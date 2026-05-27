import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { applySequence, getLegalSequences } from "@/lib/engine/moves";
import { isGameOver } from "@/lib/engine/terminal";
import { endTurn, setDice } from "@/lib/engine/game";
import type { GameState, MoveSequence } from "@/lib/engine/types";
import type { GameRow } from "@/lib/supabase/types";
import { createAdminClient } from "@/lib/supabase/admin";
import { eloDelta } from "@/lib/elo";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const body = (await request.json().catch(() => ({}))) as {
    sequence: MoveSequence;
    dice?: [number, number];
  };
  if (!body.sequence) {
    return NextResponse.json({ error: "missing sequence" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data: game, error: gErr } = await supabase
    .from("games")
    .select("*")
    .eq("id", id)
    .single<GameRow>();
  if (gErr || !game) return NextResponse.json({ error: "game not found" }, { status: 404 });
  if (game.status !== "active" && game.status !== "waiting") {
    return NextResponse.json({ error: "game not active" }, { status: 409 });
  }

  const isWhite = user.id === game.player_white;
  const isBlack = user.id === game.player_black;
  if (game.type !== "hotseat" && !isWhite && !isBlack) {
    return NextResponse.json({ error: "not a participant" }, { status: 403 });
  }

  let working: GameState = game.state;
  if (working.remaining.length === 0 && body.dice) {
    working = setDice(working, body.dice[0], body.dice[1]);
  }

  if (game.type !== "hotseat") {
    const expected = isWhite ? "white" : "black";
    if (working.turn !== expected) {
      return NextResponse.json({ error: "not your turn" }, { status: 409 });
    }
  }

  const legal = getLegalSequences(working);
  const matches = legal.some(
    (seq) =>
      seq.length === body.sequence.length &&
      seq.every(
        (m, i) =>
          m.from === body.sequence[i].from &&
          m.to === body.sequence[i].to &&
          m.die === body.sequence[i].die,
      ),
  );
  if (!matches) {
    return NextResponse.json({ error: "illegal move sequence" }, { status: 422 });
  }

  const after = applySequence(working, body.sequence);
  const final = endTurn(after);
  const terminal = isGameOver(final);

  const { count: moveCount } = await supabase
    .from("moves")
    .select("*", { count: "exact", head: true })
    .eq("game_id", id);

  await supabase.from("moves").insert({
    game_id: id,
    move_number: (moveCount ?? 0) + 1,
    player_color: working.turn,
    dice: working.dice,
    move: body.sequence,
    state_after: final,
  });

  await supabase
    .from("games")
    .update({
      state: final,
      last_move_at: new Date().toISOString(),
      status: terminal.over ? "finished" : "active",
      winner_color: terminal.winner ?? null,
      win_type: terminal.type ?? null,
      finished_at: terminal.over ? new Date().toISOString() : null,
    })
    .eq("id", id);

  if (terminal.over && terminal.winner && terminal.type && game.player_white && game.player_black) {
    await applyEloAndStats({
      whiteId: game.player_white,
      blackId: game.player_black,
      winnerColor: terminal.winner,
      winType: terminal.type,
    });
  }

  return NextResponse.json({ state: final, gameOver: terminal });
}

async function applyEloAndStats(args: {
  whiteId: string;
  blackId: string;
  winnerColor: "white" | "black";
  winType: "normal" | "mars" | "koks";
}) {
  const admin = createAdminClient();
  const { data: profiles } = await admin
    .from("profiles")
    .select("id, elo, games_played, wins")
    .in("id", [args.whiteId, args.blackId]);
  if (!profiles || profiles.length !== 2) return;
  const white = profiles.find((p) => p.id === args.whiteId);
  const black = profiles.find((p) => p.id === args.blackId);
  if (!white || !black) return;
  const winnerId = args.winnerColor === "white" ? args.whiteId : args.blackId;
  const loserId = args.winnerColor === "white" ? args.blackId : args.whiteId;
  const winnerElo = args.winnerColor === "white" ? white.elo : black.elo;
  const loserElo = args.winnerColor === "white" ? black.elo : white.elo;
  const { winnerDelta, loserDelta } = eloDelta(winnerElo, loserElo, args.winType);

  await admin
    .from("profiles")
    .update({
      elo: winnerElo + winnerDelta,
      games_played: (args.winnerColor === "white" ? white.games_played : black.games_played) + 1,
      wins: (args.winnerColor === "white" ? white.wins : black.wins) + 1,
    })
    .eq("id", winnerId);
  await admin
    .from("profiles")
    .update({
      elo: Math.max(100, loserElo + loserDelta),
      games_played: (args.winnerColor === "white" ? black.games_played : white.games_played) + 1,
    })
    .eq("id", loserId);
}
