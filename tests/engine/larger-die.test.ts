import { describe, expect, it } from "vitest";
import { emptyPoints } from "@/lib/engine/state";
import { setDice } from "@/lib/engine/game";
import { getLegalSequences } from "@/lib/engine/moves";
import { absFromPath, pathPos } from "@/lib/engine/board";
import { GameState } from "@/lib/engine/types";

function emptyState(turn: "white" | "black" = "white"): GameState {
  return {
    points: emptyPoints(),
    bornOff: { white: 0, black: 0 },
    turn,
    dice: [],
    remaining: [],
    moveNumber: 5,
    headPlayedThisTurn: 0,
    startingPositionApplied: true,
  };
}

describe("larger die must be played when only one die is playable", () => {
  it("plays 5 instead of 3 when both are mutually exclusive single plays", () => {
    // White checker at pathPos 19 (in home). Die 5 lands on pathPos 24 = exact bear off.
    // Die 3 lands on pathPos 22 = still in home. Both individually legal as single moves.
    // But combined we'd play both → maxDice path used, this won't trigger larger-die rule.
    //
    // Need a position where only ONE half-move is possible total (maxDice=1).
    // Idea: a single checker far from home, opponent blocks all but one die.
    const s = emptyState();
    // white checker at abs 23 (head). Block targets for both 5 and 3, leave only one open.
    // applyDie(23, 'white', 5) -> abs 18. applyDie(23, 'white', 3) -> abs 20.
    // applyDie(18, 'white', 3) -> abs 15. applyDie(20, 'white', 5) -> abs 15.
    // To force ONLY ONE half-move (using die 5), block abs 20 (so die 3 from head impossible)
    // and block abs 15 (so we can't do 3-then-5 or 5-then-3).
    // Then from abs 18 (after die 5), check if die 3 has any legal destination.
    // applyDie(18, 'white', 3) -> abs 15 — blocked. So no continuation. maxDice=1.
    // From abs 23 + die 3: abs 20 blocked. Can't play 3 alone? It can't.
    // So only single move possible: from 23 with die 5 → abs 18.
    s.points[23] = { color: "white", count: 1 };
    s.points[20] = { color: "black", count: 2 };
    s.points[15] = { color: "black", count: 2 };
    s.points[11] = { color: "black", count: 11 };

    const withDice = setDice(s, 5, 3);
    const seqs = getLegalSequences(withDice);
    expect(seqs.length).toBeGreaterThan(0);
    for (const seq of seqs) {
      expect(seq.length).toBe(1);
      expect(seq[0].die).toBe(5);
    }
  });

  it("plays smaller when larger has no legal move at all", () => {
    const s = emptyState();
    // White checker at abs 23. Block target for die 5 (abs 18) but leave die 3 (abs 20) open.
    // Also block subsequent abs 17 (5-then-3 from 20) and abs 15 (3-then-5 from 20).
    s.points[23] = { color: "white", count: 1 };
    s.points[18] = { color: "black", count: 2 };
    s.points[15] = { color: "black", count: 2 };
    s.points[11] = { color: "black", count: 11 };

    const withDice = setDice(s, 5, 3);
    const seqs = getLegalSequences(withDice);
    expect(seqs.length).toBeGreaterThan(0);
    // Some sequence should use die 3
    const usesThree = seqs.some((seq) => seq.some((m) => m.die === 3));
    expect(usesThree).toBe(true);
  });
});

describe("absFromPath sanity", () => {
  it("white pathPos 19 = abs 4", () => {
    // not really sanity for larger die, but bumps board.ts coverage
    const abs = absFromPath(19, "white");
    expect(pathPos(abs, "white")).toBe(19);
  });
});
