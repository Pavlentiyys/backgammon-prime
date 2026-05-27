import { pathPos } from "@/lib/engine/board";
import type { Color, GameState, MoveSequence } from "@/lib/engine/types";

export function stateNotation(s: GameState, color: Color): string {
  const cells: string[] = [];
  for (let i = 0; i < 24; i++) {
    const p = s.points[i];
    if (!p.color || p.count === 0) continue;
    const pp = pathPos(i, color);
    cells.push(`${p.color[0].toUpperCase()}${pp}:${p.count}`);
  }
  cells.sort();
  return `[${cells.join(" ")}] off:W${s.bornOff.white}/B${s.bornOff.black}`;
}

export function moveNotation(seq: MoveSequence, color: Color, before: GameState): string {
  if (seq.length === 0) return "(пропуск)";
  return seq
    .map((m) => {
      const from = pathPos(m.from, color) + 1;
      const to = m.to === "off" ? "off" : pathPos(m.to as number, color) + 1;
      return `${from}→${to}/d${m.die}`;
    })
    .join(", ");
  void before;
}
