import { describe, expect, it } from "vitest";
import { createInitialState } from "@/lib/engine/state";
import { setDice } from "@/lib/engine/game";
import { pickBestMove } from "@/lib/engine/bot/expectimax";
import { evaluate } from "@/lib/engine/bot/evaluate";
import { applySequence } from "@/lib/engine/moves";

describe("bot picks a legal move", () => {
  it("easy returns non-empty sequence on opening", () => {
    const s = setDice(createInitialState(), 3, 1);
    const seq = pickBestMove(s, "easy");
    expect(seq.length).toBeGreaterThan(0);
  });

  it("medium returns sequence on opening 6-5", () => {
    const s = setDice(createInitialState(), 6, 5);
    const seq = pickBestMove(s, "medium");
    expect(seq.length).toBeGreaterThan(0);
  });

  it("hard completes a move within 1.5 s on opening 6-6", () => {
    const s = setDice(createInitialState(), 6, 6);
    const t0 = Date.now();
    const seq = pickBestMove(s, "hard");
    const elapsed = Date.now() - t0;
    expect(seq.length).toBeGreaterThan(0);
    expect(elapsed).toBeLessThan(1500);
  }, 5000);
});

describe("evaluate", () => {
  it("symmetric on initial state", () => {
    const s = createInitialState();
    const w = evaluate(s, "white");
    const b = evaluate(s, "black");
    expect(Math.abs(w + b)).toBeLessThan(1e-6);
  });

  it("favors player with smaller pip count", () => {
    const s = setDice(createInitialState(), 6, 5);
    const seq = pickBestMove(s, "medium");
    const after = applySequence(s, seq);
    expect(evaluate(after, "white")).toBeGreaterThan(evaluate(s, "white"));
  });
});
