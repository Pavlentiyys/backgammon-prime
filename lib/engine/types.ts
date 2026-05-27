export type Color = "white" | "black";

export type Point = { color: Color | null; count: number };

export type GameState = {
  points: Point[];
  bornOff: { white: number; black: number };
  turn: Color;
  dice: number[];
  remaining: number[];
  moveNumber: number;
  headPlayedThisTurn: number;
  startingPositionApplied: boolean;
};

export type Move = { from: number; to: number | "off"; die: number };
export type MoveSequence = Move[];

export const HEAD_INDEX: Record<Color, number> = { white: 23, black: 11 };
export const HOME_PATH_START = 18;
export const PATH_LENGTH = 24;
