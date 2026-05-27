import { expandDice, Rng, rollDice } from "./rng";
import { cloneState, otherColor } from "./state";
import { GameState } from "./types";

export function rollForTurn(s: GameState, rng: Rng): GameState {
  const [d1, d2] = rollDice(rng);
  const next = cloneState(s);
  next.dice = [d1, d2];
  next.remaining = expandDice(d1, d2);
  next.headPlayedThisTurn = 0;
  return next;
}

export function endTurn(s: GameState): GameState {
  const next = cloneState(s);
  next.turn = otherColor(s.turn);
  next.dice = [];
  next.remaining = [];
  next.moveNumber += 1;
  next.headPlayedThisTurn = 0;
  next.startingPositionApplied = true;
  return next;
}

export function setDice(s: GameState, d1: number, d2: number): GameState {
  const next = cloneState(s);
  next.dice = [d1, d2];
  next.remaining = expandDice(d1, d2);
  next.headPlayedThisTurn = 0;
  return next;
}

export * from "./types";
export * from "./state";
export * from "./board";
export * from "./rng";
export * from "./rules";
export * from "./moves";
export * from "./terminal";
