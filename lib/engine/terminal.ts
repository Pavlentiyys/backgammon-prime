import { isHomePos, pathPos } from "./board";
import { Color, GameState } from "./types";

export type GameOver = {
  over: boolean;
  winner?: Color;
  type?: "normal" | "mars" | "koks";
};

export function isGameOver(s: GameState): GameOver {
  for (const color of ["white", "black"] as Color[]) {
    if (s.bornOff[color] === 15) {
      const other: Color = color === "white" ? "black" : "white";
      if (s.bornOff[other] > 0) return { over: true, winner: color, type: "normal" };
      const otherAllHome = (() => {
        for (let i = 0; i < 24; i++) {
          const p = s.points[i];
          if (p.color !== other || p.count === 0) continue;
          if (!isHomePos(pathPos(i, other))) return false;
        }
        return true;
      })();
      return { over: true, winner: color, type: otherAllHome ? "mars" : "koks" };
    }
  }
  return { over: false };
}

export function pipCount(s: GameState, color: Color): number {
  let pip = 0;
  for (let i = 0; i < 24; i++) {
    const p = s.points[i];
    if (p.color !== color || p.count === 0) continue;
    pip += (24 - pathPos(i, color)) * p.count;
  }
  return pip;
}
