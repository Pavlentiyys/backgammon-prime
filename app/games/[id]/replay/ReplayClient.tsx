"use client";
import { useEffect, useState } from "react";
import { Board } from "@/components/board/Board";
import { useGameStore } from "@/lib/store/gameStore";
import type { GameState, Color } from "@/lib/engine/types";

type MoveMeta = { number: number; color: Color; dice: number[] };

export function ReplayClient({
  gameId,
  type,
  states,
  moves,
  winner,
  winType,
}: {
  gameId: string;
  type: string;
  states: GameState[];
  moves: MoveMeta[];
  winner: Color | null;
  winType: string | null;
}) {
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    useGameStore.setState({
      state: states[idx],
      history: [],
      sequenceSoFar: [],
      selected: null,
      gameOver: { over: false },
    });
  }, [idx, states]);

  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => {
      setIdx((i) => {
        if (i >= states.length - 1) {
          setPlaying(false);
          return i;
        }
        return i + 1;
      });
    }, 900);
    return () => clearInterval(t);
  }, [playing, states.length]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between text-sm opacity-70">
        <span>
          Replay #{gameId.slice(0, 8)} · {type}
        </span>
        <span>
          Ход {idx} / {states.length - 1}
          {winner && idx === states.length - 1 && (
            <span className="ml-2 text-[var(--accent)]">
              · {winner === "white" ? "белые" : "чёрные"} {winType ?? ""}
            </span>
          )}
        </span>
      </div>

      <Board />

      <div className="flex items-center justify-center gap-2">
        <button
          onClick={() => setIdx(0)}
          className="px-3 py-1.5 rounded bg-[var(--muted)]/30"
        >
          ⏮
        </button>
        <button
          onClick={() => setIdx((i) => Math.max(0, i - 1))}
          className="px-3 py-1.5 rounded bg-[var(--muted)]/30"
        >
          ◀
        </button>
        <button
          onClick={() => setPlaying((p) => !p)}
          className="px-4 py-1.5 rounded bg-[var(--accent)] text-black font-medium"
        >
          {playing ? "⏸" : "⏯"}
        </button>
        <button
          onClick={() => setIdx((i) => Math.min(states.length - 1, i + 1))}
          className="px-3 py-1.5 rounded bg-[var(--muted)]/30"
        >
          ▶
        </button>
        <button
          onClick={() => setIdx(states.length - 1)}
          className="px-3 py-1.5 rounded bg-[var(--muted)]/30"
        >
          ⏭
        </button>
      </div>

      <input
        type="range"
        min={0}
        max={states.length - 1}
        value={idx}
        onChange={(e) => setIdx(Number(e.target.value))}
        className="w-full"
      />

      {moves[idx - 1] && (
        <div className="text-center text-sm opacity-70">
          Ход {moves[idx - 1].number}: {moves[idx - 1].color === "white" ? "белые" : "чёрные"} · кости {moves[idx - 1].dice.join("-")}
        </div>
      )}
    </div>
  );
}
