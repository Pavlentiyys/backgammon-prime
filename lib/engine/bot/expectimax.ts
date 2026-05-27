import { setDice, endTurn } from "../game";
import { applySequence, getLegalSequences } from "../moves";
import { GameState, MoveSequence } from "../types";
import { isGameOver } from "../terminal";
import { evaluate } from "./evaluate";

export type BotLevel = "easy" | "medium" | "hard";

const DEPTH: Record<BotLevel, number> = { easy: 1, medium: 2, hard: 3 };

const DICE_PAIRS: { d1: number; d2: number; weight: number }[] = (() => {
  const out: { d1: number; d2: number; weight: number }[] = [];
  for (let a = 1; a <= 6; a++) {
    for (let b = a; b <= 6; b++) {
      out.push({ d1: a, d2: b, weight: a === b ? 1 / 36 : 2 / 36 });
    }
  }
  return out;
})();

export function pickBestMove(
  state: GameState,
  level: BotLevel = "medium",
): MoveSequence {
  const depth = DEPTH[level];
  const sequences = getLegalSequences(state);
  if (sequences.length === 0 || (sequences.length === 1 && sequences[0].length === 0)) {
    return [];
  }
  const perspective = state.turn;
  let best: { seq: MoveSequence; score: number } | null = null;

  for (const seq of sequences) {
    const afterSeq = applySequence(state, seq);
    const finalState = endTurn(afterSeq);
    const terminal = isGameOver(finalState);
    let score: number;
    if (terminal.over) {
      score = terminal.winner === perspective ? 1e6 : -1e6;
    } else {
      score = scoreState(finalState, perspective, depth - 1);
    }
    if (level === "easy") {
      score += (Math.random() - 0.5) * 20;
    }
    if (!best || score > best.score) best = { seq, score };
  }
  return best?.seq ?? [];
}

function scoreState(state: GameState, perspective: GameState["turn"], depth: number): number {
  if (depth <= 0) return evaluate(state, perspective);

  let expected = 0;
  for (const pair of DICE_PAIRS) {
    const withDice = setDice(state, pair.d1, pair.d2);
    const sequences = getLegalSequences(withDice);
    const opts = sequences.length > 0 ? sequences : [[]];
    let best = state.turn === perspective ? -Infinity : Infinity;
    for (const seq of opts) {
      const afterSeq = seq.length > 0 ? applySequence(withDice, seq) : withDice;
      const next = endTurn(afterSeq);
      const terminal = isGameOver(next);
      let s: number;
      if (terminal.over) {
        s = terminal.winner === perspective ? 1e6 : -1e6;
      } else {
        s = scoreState(next, perspective, depth - 1);
      }
      best = state.turn === perspective ? Math.max(best, s) : Math.min(best, s);
    }
    if (!isFinite(best)) best = evaluate(withDice, perspective);
    expected += pair.weight * best;
  }
  return expected;
}
