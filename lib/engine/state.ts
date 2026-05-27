import { Color, GameState, HEAD_INDEX, Point } from "./types";

export function emptyPoints(): Point[] {
  return Array.from({ length: 24 }, () => ({ color: null, count: 0 }));
}

export function createInitialState(turn: Color = "white"): GameState {
  const points = emptyPoints();
  points[HEAD_INDEX.white] = { color: "white", count: 15 };
  points[HEAD_INDEX.black] = { color: "black", count: 15 };
  return {
    points,
    bornOff: { white: 0, black: 0 },
    turn,
    dice: [],
    remaining: [],
    moveNumber: 0,
    headPlayedThisTurn: 0,
    startingPositionApplied: false,
  };
}

export function cloneState(s: GameState): GameState {
  return {
    points: s.points.map((p) => ({ ...p })),
    bornOff: { ...s.bornOff },
    turn: s.turn,
    dice: [...s.dice],
    remaining: [...s.remaining],
    moveNumber: s.moveNumber,
    headPlayedThisTurn: s.headPlayedThisTurn,
    startingPositionApplied: s.startingPositionApplied,
  };
}

export function serialize(s: GameState): string {
  return JSON.stringify(s);
}

export function deserialize(json: string): GameState {
  return JSON.parse(json) as GameState;
}

export function otherColor(c: Color): Color {
  return c === "white" ? "black" : "white";
}

export function checkersOnBoard(s: GameState, color: Color): number {
  let n = 0;
  for (const p of s.points) if (p.color === color) n += p.count;
  return n;
}
