import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { GameRow, RoomRow } from "@/lib/supabase/types";

export async function POST(request: NextRequest) {
  const { slug } = (await request.json().catch(() => ({}))) as { slug?: string };
  if (!slug) return NextResponse.json({ error: "missing slug" }, { status: 400 });

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data: room } = await supabase
    .from("rooms")
    .select("*")
    .eq("slug", slug)
    .single<RoomRow>();
  if (!room) return NextResponse.json({ error: "room not found" }, { status: 404 });

  const { data: game } = await supabase
    .from("games")
    .select("*")
    .eq("id", room.game_id)
    .single<GameRow>();
  if (!game) return NextResponse.json({ error: "game gone" }, { status: 404 });

  if (game.player_white === user.id || game.player_black === user.id) {
    return NextResponse.json({ gameId: game.id });
  }
  if (game.player_white && game.player_black) {
    return NextResponse.json({ gameId: game.id, spectator: true });
  }

  const fillColor = game.player_white ? "player_black" : "player_white";
  await supabase
    .from("games")
    .update({ [fillColor]: user.id, status: "active" })
    .eq("id", game.id);

  return NextResponse.json({ gameId: game.id });
}
