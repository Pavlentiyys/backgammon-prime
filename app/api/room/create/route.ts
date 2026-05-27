import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createInitialState } from "@/lib/engine/state";
import type { GameType } from "@/lib/supabase/types";

function shortSlug(): string {
  const alphabet = "abcdefghjkmnpqrstuvwxyz23456789";
  let s = "";
  for (let i = 0; i < 6; i++) s += alphabet[Math.floor(Math.random() * alphabet.length)];
  return s;
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as {
    type?: GameType;
    timePerMove?: number;
    isPublic?: boolean;
  };
  const type: GameType = body.type ?? "realtime";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const state = createInitialState();
  const { data: game, error: gErr } = await supabase
    .from("games")
    .insert({
      type,
      player_white: user.id,
      player_black: null,
      status: "waiting",
      state,
      time_per_move: body.timePerMove ?? null,
    })
    .select("id")
    .single();
  if (gErr || !game) return NextResponse.json({ error: gErr?.message ?? "fail" }, { status: 500 });

  let slug = shortSlug();
  for (let attempt = 0; attempt < 4; attempt++) {
    const { error } = await supabase.from("rooms").insert({
      slug,
      game_id: game.id,
      host_id: user.id,
      is_public: !!body.isPublic,
    });
    if (!error) return NextResponse.json({ gameId: game.id, slug });
    slug = shortSlug();
  }
  return NextResponse.json({ error: "slug collision" }, { status: 500 });
}
