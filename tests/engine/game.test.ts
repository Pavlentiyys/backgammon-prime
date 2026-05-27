import { describe, expect, it } from "vitest";
import { createInitialState } from "@/lib/engine/state";
import { rollForTurn, endTurn, setDice } from "@/lib/engine/game";
import { mulberry32 } from "@/lib/engine/rng";

describe("rollForTurn", () => {
  it("sets dice and remaining", () => {
    const s = createInitialState();
    const next = rollForTurn(s, mulberry32(1));
    expect(next.dice.length).toBe(2);
    expect(next.remaining.length === 2 || next.remaining.length === 4).toBe(true);
    expect(next.headPlayedThisTurn).toBe(0);
  });

  it("doubles expand to 4", () => {
    // try a few seeds to find a double, or force one
    const s = createInitialState();
    const forced = setDice(s, 5, 5);
    expect(forced.remaining).toEqual([5, 5, 5, 5]);
  });
});

describe("endTurn", () => {
  it("flips turn, clears dice, sets startingPositionApplied", () => {
    const s = createInitialState();
    const rolled = setDice(s, 3, 1);
    const next = endTurn(rolled);
    expect(next.turn).toBe("black");
    expect(next.dice).toEqual([]);
    expect(next.remaining).toEqual([]);
    expect(next.startingPositionApplied).toBe(true);
    expect(next.moveNumber).toBe(s.moveNumber + 1);
  });

  it("flips back after two endTurns", () => {
    const s = createInitialState();
    const a = endTurn(setDice(s, 1, 2));
    const b = endTurn(setDice(a, 3, 4));
    expect(b.turn).toBe("white");
  });
});

describe("setDice", () => {
  it("non-double 6-5 → remaining = [6,5]", () => {
    const s = setDice(createInitialState(), 6, 5);
    expect(s.remaining).toEqual([6, 5]);
    expect(s.dice).toEqual([6, 5]);
  });
});
