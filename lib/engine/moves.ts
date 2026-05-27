import { applyHalfMove, checkHalfMove } from "./rules";
import { cloneState } from "./state";
import { GameState, Move, MoveSequence } from "./types";

export function getLegalSequences(s: GameState): MoveSequence[] {
  if (s.remaining.length === 0) return [[]];

  const all: { seq: MoveSequence; state: GameState }[] = [];
  const seen = new Set<string>();

  function dfs(state: GameState, seq: MoveSequence): void {
    let extended = false;
    const triedDice = new Set<number>();
    for (const die of state.remaining) {
      if (triedDice.has(die)) continue;
      triedDice.add(die);
      for (let from = 0; from < 24; from++) {
        const p = state.points[from];
        if (p.color !== state.turn || p.count === 0) continue;
        const check = checkHalfMove(state, from, die, state.headPlayedThisTurn);
        if (!check.ok) continue;
        const move: Move =
          check.result.type === "off"
            ? { from, to: "off", die }
            : { from, to: check.result.absIdx, die };
        const next = applyHalfMove(state, move);
        extended = true;
        dfs(next, [...seq, move]);
      }
    }
    if (!extended) {
      const key = stateKey(state);
      if (!seen.has(key)) {
        seen.add(key);
        all.push({ seq, state });
      }
    }
  }

  dfs(s, []);

  if (all.length === 0) return [[]];

  const maxDice = Math.max(...all.map((x) => x.seq.length));
  let filtered = all.filter((x) => x.seq.length === maxDice);

  if (maxDice === 1 && s.dice.length === 2 && s.dice[0] !== s.dice[1]) {
    const bigger = Math.max(...s.dice);
    const canBig = filtered.some((x) => x.seq[0].die === bigger);
    if (canBig) filtered = filtered.filter((x) => x.seq[0].die === bigger);
  }

  return filtered.map((x) => x.seq);
}

export function getLegalHalfMoves(
  s: GameState,
): { from: number; to: number | "off"; die: number }[] {
  const seqs = getLegalSequences(s);
  const out = new Map<string, Move>();
  for (const seq of seqs) {
    if (seq.length === 0) continue;
    const m = seq[0];
    const key = `${m.from}-${m.to}-${m.die}`;
    out.set(key, m);
  }
  return [...out.values()];
}

export function applySequence(s: GameState, seq: MoveSequence): GameState {
  let cur = cloneState(s);
  for (const m of seq) cur = applyHalfMove(cur, m);
  return cur;
}

function stateKey(s: GameState): string {
  return (
    s.points.map((p) => `${p.color ?? "_"}${p.count}`).join("|") +
    `#W${s.bornOff.white}B${s.bornOff.black}#${s.remaining.join(",")}`
  );
}
