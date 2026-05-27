import { pathPos } from "../board";
import { otherColor } from "../state";
import { pipCount } from "../terminal";
import { Color, GameState } from "../types";

export function evaluate(s: GameState, perspective: Color): number {
  const opp = otherColor(perspective);
  const myPip = pipCount(s, perspective) + (15 - s.bornOff[perspective] - countOnBoard(s, perspective)) * 0;
  const oppPip = pipCount(s, opp);
  const pipDiff = oppPip - myPip;

  const bornOff = (s.bornOff[perspective] - s.bornOff[opp]) * 8;

  const primeBonus = primeBonusFor(s, perspective) - primeBonusFor(s, opp);

  const homeControl = homeControlFor(s, perspective) - homeControlFor(s, opp);

  const backCheckers = backRiskFor(s, perspective) * -2 - backRiskFor(s, opp) * -2;

  return pipDiff * 1.0 + bornOff + primeBonus * 1.2 + homeControl * 0.4 + backCheckers;
}

function countOnBoard(s: GameState, color: Color): number {
  let n = 0;
  for (const p of s.points) if (p.color === color) n += p.count;
  return n;
}

function primeBonusFor(s: GameState, color: Color): number {
  let run = 0;
  let best = 0;
  for (let pos = 0; pos < 24; pos++) {
    const abs = absFromPath(pos, color);
    const p = s.points[abs];
    if (p.color === color && p.count >= 2) {
      run += 1;
      best = Math.max(best, run);
    } else {
      run = 0;
    }
  }
  if (best <= 1) return 0;
  return best * best;
}

function absFromPath(pos: number, color: Color): number {
  if (color === "white") return 23 - pos;
  let abs = 11 - pos;
  if (abs < 0) abs += 24;
  return abs;
}

function homeControlFor(s: GameState, color: Color): number {
  let score = 0;
  for (let i = 0; i < 24; i++) {
    const p = s.points[i];
    if (p.color !== color || p.count < 2) continue;
    const pp = pathPos(i, color);
    if (pp >= 18) score += 2;
    else if (pp >= 12) score += 1;
  }
  return score;
}

function backRiskFor(s: GameState, color: Color): number {
  let n = 0;
  for (let i = 0; i < 24; i++) {
    const p = s.points[i];
    if (p.color !== color || p.count === 0) continue;
    const pp = pathPos(i, color);
    if (pp < 6 && p.count === 1) n += 1;
  }
  return n;
}
