import { describe, expect, it } from "vitest";
import { emptyPoints } from "@/lib/engine/state";
import { setDice } from "@/lib/engine/game";
import { getLegalSequences } from "@/lib/engine/moves";
import { absFromPath } from "@/lib/engine/board";
import { isGameOver } from "@/lib/engine/terminal";
import { GameState } from "@/lib/engine/types";

function emptyState(): GameState {
  return {
    points: emptyPoints(),
    bornOff: { white: 0, black: 0 },
    turn: "white",
    dice: [],
    remaining: [],
    moveNumber: 0,
    headPlayedThisTurn: 0,
    startingPositionApplied: true,
  };
}

describe("bear off", () => {
  it("white with 1 checker at point 1 (pathPos 23) bears off on die 1", () => {
    const s = emptyState();
    s.points[absFromPath(23, "white")] = { color: "white", count: 1 };
    s.bornOff.white = 14;
    const withDice = setDice(s, 1, 2);
    const seqs = getLegalSequences(withDice);
    const bearOff = seqs.find((seq) => seq.some((m) => m.to === "off"));
    expect(bearOff).toBeDefined();
  });

  it("overshoot bears off only from highest occupied", () => {
    const s = emptyState();
    s.points[absFromPath(20, "white")] = { color: "white", count: 1 };
    s.points[absFromPath(22, "white")] = { color: "white", count: 1 };
    s.bornOff.white = 13;
    const withDice = setDice(s, 6, 5);
    const seqs = getLegalSequences(withDice);
    const firstOffMoves = new Set<number>();
    for (const seq of seqs) {
      const first = seq[0];
      if (first && first.to === "off") firstOffMoves.add(first.from);
    }
    expect(firstOffMoves.has(absFromPath(22, "white"))).toBe(false);
    expect(firstOffMoves.has(absFromPath(20, "white"))).toBe(true);
  });
});

describe("win types", () => {
  it("normal win when opponent has borne off ≥1", () => {
    const s = emptyState();
    s.bornOff.white = 15;
    s.bornOff.black = 1;
    s.points[absFromPath(18, "black")] = { color: "black", count: 14 };
    const r = isGameOver(s);
    expect(r).toEqual({ over: true, winner: "white", type: "normal" });
  });

  it("mars when opponent has 0 borne off but all in home", () => {
    const s = emptyState();
    s.bornOff.white = 15;
    s.points[absFromPath(20, "black")] = { color: "black", count: 15 };
    const r = isGameOver(s);
    expect(r.type).toBe("mars");
  });

  it("koks when opponent not all home", () => {
    const s = emptyState();
    s.bornOff.white = 15;
    s.points[absFromPath(0, "black")] = { color: "black", count: 15 };
    const r = isGameOver(s);
    expect(r.type).toBe("koks");
  });
});
