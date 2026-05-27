import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { setDice } from "@/lib/engine/game";
import { defaultRng, rollDice } from "@/lib/engine/rng";
import type { GameRow } from "@/lib/supabase/types";

export async function POST(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data: game } = await supabase
    .from("games")
    .select("*")
    .eq("id", id)
    .single<GameRow>();
  if (!game) return NextResponse.json({ error: "game not found" }, { status: 404 });
  if (game.status !== "active" && game.status !== "waiting") {
    return NextResponse.json({ error: "game not active" }, { status: 409 });
  }

  const isWhite = user.id === game.player_white;
  const isBlack = user.id === game.player_black;
  if (!isWhite && !isBlack && game.type !== "hotseat") {
    return NextResponse.json({ error: "not a participant" }, { status: 403 });
  }
  const expected = isWhite ? "white" : "black";
  if (game.type !== "hotseat" && game.state.turn !== expected) {
    return NextResponse.json({ error: "not your turn" }, { status: 409 });
  }
  if (game.state.remaining.length > 0) {
    return NextResponse.json({ error: "dice already rolled" }, { status: 409 });
  }

  const [d1, d2] = rollDice(defaultRng());
  const next = setDice(game.state, d1, d2);

  await supabase
    .from("games")
    .update({ state: next, status: "active", last_move_at: new Date().toISOString() })
    .eq("id", id);

  return NextResponse.json({ state: next, dice: [d1, d2] });
}
