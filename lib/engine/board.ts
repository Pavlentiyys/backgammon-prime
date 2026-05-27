import { Color, HEAD_INDEX, PATH_LENGTH } from "./types";

export function pathPos(absIdx: number, color: Color): number {
  const head = HEAD_INDEX[color];
  if (color === "white") return head - absIdx;
  if (absIdx <= head) return head - absIdx;
  return head - absIdx + PATH_LENGTH;
}

export function absFromPath(pos: number, color: Color): number {
  const head = HEAD_INDEX[color];
  if (color === "white") return head - pos;
  let abs = head - pos;
  if (abs < 0) abs += PATH_LENGTH;
  return abs;
}

export function applyDie(
  absIdx: number,
  color: Color,
  die: number,
): { type: "point"; absIdx: number } | { type: "off"; overshoot: number } {
  const newPath = pathPos(absIdx, color) + die;
  if (newPath >= PATH_LENGTH) {
    return { type: "off", overshoot: newPath - (PATH_LENGTH - 1) };
  }
  return { type: "point", absIdx: absFromPath(newPath, color) };
}

export function isHomePos(pos: number): boolean {
  return pos >= 18 && pos < 24;
}

export function isInHome(absIdx: number, color: Color): boolean {
  return isHomePos(pathPos(absIdx, color));
}
