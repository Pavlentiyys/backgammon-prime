"use client";
import { create } from "zustand";
import {
  createInitialState,
  GameState,
  Move,
  MoveSequence,
} from "@/lib/engine/game";
import { setDice, endTurn } from "@/lib/engine/game";
import { getLegalSequences } from "@/lib/engine/moves";
import { applyHalfMove } from "@/lib/engine/rules";
import { rollDice, defaultRng } from "@/lib/engine/rng";
import { isGameOver, GameOver } from "@/lib/engine/terminal";

type Snapshot = { state: GameState; sequenceSoFar: MoveSequence };

type Store = {
  state: GameState;
  history: Snapshot[];
  sequenceSoFar: MoveSequence;
  selected: number | null;
  gameOver: GameOver;
  roll: () => void;
  selectPoint: (idx: number | null) => void;
  playHalfMove: (move: Move) => void;
  legalHalfMoves: () => Move[];
  undo: () => void;
  endTurnIfDone: () => void;
  forceEndTurn: () => void;
  reset: () => void;
};

function dedupeMoves(moves: Move[]): Move[] {
  const seen = new Set<string>();
  const out: Move[] = [];
  for (const m of moves) {
    const k = `${m.from}-${m.to}-${m.die}`;
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(m);
  }
  return out;
}

export const useGameStore = create<Store>((set, get) => ({
  state: createInitialState(),
  history: [],
  sequenceSoFar: [],
  selected: null,
  gameOver: { over: false },

  roll: () => {
    const s = get().state;
    if (s.remaining.length > 0) return;
    const [d1, d2] = rollDice(defaultRng());
    const next = setDice(s, d1, d2);
    set({ state: next, sequenceSoFar: [], history: [], selected: null });
  },

  selectPoint: (idx) => set({ selected: idx }),

  legalHalfMoves: () => {
    const { state } = get();
    if (state.remaining.length === 0) return [];
    const seqs = getLegalSequences(state);
    return dedupeMoves(seqs.flatMap((seq) => (seq.length > 0 ? [seq[0]] : [])));
  },

  playHalfMove: (move) => {
    const { state, history, sequenceSoFar } = get();
    const next = applyHalfMove(state, move);
    const newHistory = [...history, { state, sequenceSoFar }];
    set({
      state: next,
      history: newHistory,
      sequenceSoFar: [...sequenceSoFar, move],
      selected: null,
    });
    get().endTurnIfDone();
  },

  undo: () => {
    const { history } = get();
    if (history.length === 0) return;
    const last = history[history.length - 1];
    set({
      state: last.state,
      sequenceSoFar: last.sequenceSoFar,
      history: history.slice(0, -1),
      selected: null,
    });
  },

  endTurnIfDone: () => {
    const { state } = get();
    const over = isGameOver(state);
    if (over.over) {
      set({ gameOver: over });
      return;
    }
    if (state.remaining.length === 0) return;
    const seqs = getLegalSequences(state);
    const playable = seqs.some((s) => s.length > 0);
    if (!playable) {
      const next = endTurn(state);
      set({ state: next, history: [], sequenceSoFar: [], selected: null });
    }
  },

  forceEndTurn: () => {
    const { state } = get();
    const next = endTurn(state);
    set({
      state: next,
      history: [],
      sequenceSoFar: [],
      selected: null,
    });
  },

  reset: () =>
    set({
      state: createInitialState(),
      history: [],
      sequenceSoFar: [],
      selected: null,
      gameOver: { over: false },
    }),
}));
