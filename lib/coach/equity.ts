import { setDice, endTurn } from "@/lib/engine/game";
import { applySequence, getLegalSequences } from "@/lib/engine/moves";
import { evaluate } from "@/lib/engine/bot/evaluate";
import type { Color, GameState, MoveSequence } from "@/lib/engine/types";
import type { MoveRow } from "@/lib/supabase/types";

export type Severity = "excellent" | "ok" | "mistake" | "blunder";

export type MoveReview = {
  moveNumber: number;
  color: Color;
  dice: number[];
  playedSeq: MoveSequence;
  bestSeq: MoveSequence;
  loss: number;
  severity: Severity;
};

function classify(loss: number): Severity {
  if (loss < 0.5) return "excellent";
  if (loss < 2) return "ok";
  if (loss < 5) return "mistake";
  return "blunder";
}

export function reviewGame(
  initialState: GameState,
  moves: Pick<MoveRow, "move_number" | "player_color" | "dice" | "move" | "state_after">[],
  forColor: Color,
): MoveReview[] {
  const reviews: MoveReview[] = [];
  let state = initialState;

  for (const m of moves) {
    if (m.player_color !== forColor) {
      state = m.state_after;
      continue;
    }
    const withDice = setDice(state, m.dice[0], m.dice[1]);
    const all = getLegalSequences(withDice);
    if (all.length === 0 || (all.length === 1 && all[0].length === 0)) {
      state = m.state_after;
      continue;
    }

    let bestScore = -Infinity;
    let bestSeq: MoveSequence = [];
    let playedScore = -Infinity;
    for (const seq of all) {
      const after = endTurn(applySequence(withDice, seq));
      const score = evaluate(after, forColor);
      if (score > bestScore) {
        bestScore = score;
        bestSeq = seq;
      }
      if (sameSeq(seq, m.move)) playedScore = score;
    }
    if (playedScore === -Infinity) playedScore = bestScore;

    const loss = Math.max(0, bestScore - playedScore);
    reviews.push({
      moveNumber: m.move_number,
      color: m.player_color,
      dice: m.dice,
      playedSeq: m.move,
      bestSeq,
      loss,
      severity: classify(loss),
    });
    state = m.state_after;
  }
  return reviews;
}

function sameSeq(a: MoveSequence, b: MoveSequence): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i].from !== b[i].from || a[i].to !== b[i].to || a[i].die !== b[i].die) return false;
  }
  return true;
}

export function accuracy(reviews: MoveReview[]): number {
  if (reviews.length === 0) return 100;
  const totalLoss = reviews.reduce((s, r) => s + r.loss, 0);
  const avg = totalLoss / reviews.length;
  return Math.max(0, Math.min(100, Math.round(100 - avg * 6)));
}
