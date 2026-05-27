import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { GameState, Color } from "@/lib/engine/types";
import type { GameType, WinType } from "@/lib/supabase/types";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as {
    type?: GameType;
    winnerColor?: Color | null;
    winType?: WinType | null;
    finalState?: GameState;
  };
  if (!body.type || !body.finalState) {
    return NextResponse.json({ error: "missing fields" }, { status: 400 });
  }
  if (body.type !== "bot" && body.type !== "hotseat") {
    return NextResponse.json({ error: "endpoint only for bot/hotseat" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data: game, error: gErr } = await supabase
    .from("games")
    .insert({
      type: body.type,
      player_white: user.id,
      player_black: body.type === "hotseat" ? user.id : null,
      status: "finished",
      winner_color: body.winnerColor ?? null,
      win_type: body.winType ?? null,
      state: body.finalState,
      finished_at: new Date().toISOString(),
    })
    .select("id")
    .single();
  if (gErr) return NextResponse.json({ error: gErr.message }, { status: 500 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("games_played, wins")
    .eq("id", user.id)
    .single();

  const userWon = body.winnerColor === "white";
  const update: Record<string, number> = {
    games_played: ((profile?.games_played as number | undefined) ?? 0) + 1,
  };
  if (userWon) {
    update.wins = ((profile?.wins as number | undefined) ?? 0) + 1;
  }
  await supabase.from("profiles").update(update).eq("id", user.id);

  return NextResponse.json({ gameId: game.id });
}
