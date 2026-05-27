import { applyDie, isHomePos, pathPos } from "./board";
import { cloneState, otherColor } from "./state";
import { Color, GameState, HEAD_INDEX, Move, Point } from "./types";

export function allInHome(s: GameState, color: Color): boolean {
  for (let i = 0; i < 24; i++) {
    const p = s.points[i];
    if (p.color !== color || p.count === 0) continue;
    if (!isHomePos(pathPos(i, color))) return false;
  }
  return true;
}

export function minHomePathPos(s: GameState, color: Color): number {
  let min = 24;
  for (let i = 0; i < 24; i++) {
    const p = s.points[i];
    if (p.color !== color || p.count === 0) continue;
    const pp = pathPos(i, color);
    if (pp < min) min = pp;
  }
  return min;
}

export function headLimitFor(s: GameState): number {
  if (!s.startingPositionApplied) {
    const d = s.dice;
    if (d.length >= 2 && d[0] === d[1] && (d[0] === 6 || d[0] === 4 || d[0] === 3)) {
      return 2;
    }
  }
  return 1;
}

function buildPrimeMap(points: Point[], color: Color): boolean[] {
  return points.map((p) => p.color === color && p.count > 0);
}

export function hasIllegalSixPrime(points: Point[], builder: Color): boolean {
  const owned = buildPrimeMap(points, builder);
  const opp = otherColor(builder);

  for (let start = 0; start < 24; start++) {
    let ok = true;
    const primeCells: number[] = [];
    for (let k = 0; k < 6; k++) {
      const idx = (start + k) % 24;
      if (!owned[idx]) {
        ok = false;
        break;
      }
      primeCells.push(idx);
    }
    if (!ok) continue;
    const before = (start + 23) % 24;
    const after = (start + 6) % 24;
    if (owned[before] || owned[after]) continue;

    const maxOppPath = Math.max(...primeCells.map((i) => pathPos(i, opp)));
    let hasPassed = false;
    for (let i = 0; i < 24; i++) {
      const p = points[i];
      if (p.color !== opp || p.count === 0) continue;
      if (pathPos(i, opp) > maxOppPath) {
        hasPassed = true;
        break;
      }
    }
    if (!hasPassed) return true;
  }
  return false;
}

export type LegalCheck =
  | { ok: true; result: { type: "point"; absIdx: number } | { type: "off" } }
  | { ok: false; reason: string };

export function checkHalfMove(
  s: GameState,
  from: number,
  die: number,
  headPlayed: number,
): LegalCheck {
  const color = s.turn;
  const point = s.points[from];
  if (point.color !== color || point.count === 0)
    return { ok: false, reason: "no own checker" };

  if (from === HEAD_INDEX[color]) {
    const limit = headLimitFor(s);
    if (headPlayed >= limit) return { ok: false, reason: "head limit" };
  }

  const target = applyDie(from, color, die);
  if (target.type === "off") {
    if (!allInHome(s, color)) return { ok: false, reason: "bear off requires all home" };
    const myPath = pathPos(from, color);
    if (myPath + die === 24) return { ok: true, result: { type: "off" } };
    const minP = minHomePathPos(s, color);
    if (myPath === minP) return { ok: true, result: { type: "off" } };
    return { ok: false, reason: "overshoot only from highest" };
  }

  const toPoint = s.points[target.absIdx];
  if (toPoint.color && toPoint.color !== color && toPoint.count > 0)
    return { ok: false, reason: "occupied by opponent" };

  const after = applyMoveImmut(s.points, from, target.absIdx, color);
  if (hasIllegalSixPrime(after, color))
    return { ok: false, reason: "illegal six-prime" };

  return { ok: true, result: { type: "point", absIdx: target.absIdx } };
}

export function applyMoveImmut(
  points: Point[],
  from: number,
  to: number,
  color: Color,
): Point[] {
  const out = points.map((p) => ({ ...p }));
  out[from] = { ...out[from], count: out[from].count - 1 };
  if (out[from].count === 0) out[from].color = null;
  const dst = out[to];
  out[to] = { color, count: dst.count + 1 };
  return out;
}

export function applyHalfMove(s: GameState, m: Move): GameState {
  const next = cloneState(s);
  const color = s.turn;
  if (m.to === "off") {
    next.points = next.points.map((p, i) =>
      i === m.from ? { color: p.count - 1 === 0 ? null : color, count: p.count - 1 } : { ...p },
    );
    next.bornOff[color] += 1;
  } else {
    next.points = applyMoveImmut(next.points, m.from, m.to, color);
  }
  if (m.from === HEAD_INDEX[color]) next.headPlayedThisTurn += 1;
  const idx = next.remaining.indexOf(m.die);
  if (idx >= 0) next.remaining.splice(idx, 1);
  return next;
}
