import { describe, expect, it } from "vitest";
import { createInitialState, emptyPoints } from "@/lib/engine/state";
import { pipCount } from "@/lib/engine/terminal";
import { GameState } from "@/lib/engine/types";

describe("pipCount", () => {
  it("starting position: pip = 15 checkers × 24 path = 360", () => {
    const s = createInitialState();
    // pathPos of head is 0, so each checker contributes (24-0)=24 → 360
    expect(pipCount(s, "white")).toBe(360);
    expect(pipCount(s, "black")).toBe(360);
  });

  it("borne-off-only checkers contribute zero (no points)", () => {
    const s: GameState = {
      points: emptyPoints(),
      bornOff: { white: 15, black: 0 },
      turn: "white",
      dice: [],
      remaining: [],
      moveNumber: 0,
      headPlayedThisTurn: 0,
      startingPositionApplied: true,
    };
    expect(pipCount(s, "white")).toBe(0);
  });

  it("custom position", () => {
    const pts = emptyPoints();
    // 1 white checker at abs 0 (white's bear-off-adjacent point, pathPos 23) → pip = 24-23 = 1
    pts[0] = { color: "white", count: 1 };
    const s: GameState = {
      points: pts,
      bornOff: { white: 14, black: 0 },
      turn: "white",
      dice: [],
      remaining: [],
      moveNumber: 0,
      headPlayedThisTurn: 0,
      startingPositionApplied: true,
    };
    expect(pipCount(s, "white")).toBe(1);
  });
});
