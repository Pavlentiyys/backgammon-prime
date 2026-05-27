"use client";
import { useEffect } from "react";
import { Board } from "@/components/board/Board";
import { DicePanel } from "@/components/dice/Dice";
import { useGameStore } from "@/lib/store/gameStore";
import { pipCount } from "@/lib/engine/terminal";
import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";

export default function HotseatPage() {
  const state = useGameStore((s) => s.state);
  const undo = useGameStore((s) => s.undo);
  const reset = useGameStore((s) => s.reset);
  const forceEndTurn = useGameStore((s) => s.forceEndTurn);
  const gameOver = useGameStore((s) => s.gameOver);
  const history = useGameStore((s) => s.history);

  useEffect(() => {
    if (!gameOver.over) return;
    void fetch("/api/game/log", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        type: "hotseat",
        winnerColor: gameOver.winner ?? null,
        winType: gameOver.type ?? null,
        finalState: state,
      }),
    });
  }, [gameOver, state]);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-4 py-3 flex items-center justify-between border-b border-[var(--muted)]/30">
        <Link href="/" className="font-display text-xl">
          Backgammon Prime
        </Link>
        <span className="text-sm opacity-70">Hot-seat</span>
      </header>

      <main className="flex-1 flex flex-col gap-4 p-3 sm:p-6 max-w-5xl w-full mx-auto">
        <div className="flex items-center justify-between gap-4">
          <PlayerCard
            color="black"
            active={state.turn === "black"}
            pip={pipCount(state, "black")}
            avatarSrc="/avatars/player-left.png"
          />
          <DicePanel />
          <PlayerCard
            color="white"
            active={state.turn === "white"}
            pip={pipCount(state, "white")}
            avatarSrc="/avatars/player-right.png"
          />
        </div>

        <Board />

        <div className="flex flex-wrap gap-2 justify-center">
          <button
            onClick={undo}
            disabled={history.length === 0}
            className="px-4 py-2 rounded-md bg-[var(--muted)]/30 disabled:opacity-30 hover:bg-[var(--muted)]/50 transition"
          >
            ↶ Отмена
          </button>
          <button
            onClick={forceEndTurn}
            disabled={state.dice.length === 0}
            className="px-4 py-2 rounded-md bg-[var(--accent)]/80 text-black disabled:opacity-30 hover:brightness-110 transition font-medium"
          >
            Готово →
          </button>
          <button
            onClick={reset}
            className="px-4 py-2 rounded-md bg-red-500/30 hover:bg-red-500/50 transition"
          >
            Новая партия
          </button>
        </div>

        {gameOver.over && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-[var(--background)] border border-[var(--accent)] rounded-2xl p-8 max-w-md text-center shadow-2xl">
              <h2 className="font-display text-3xl mb-2">
                {gameOver.winner === "white" ? "Победили белые" : "Победили чёрные"}
              </h2>
              <p className="text-lg mb-4 opacity-80">
                {gameOver.type === "mars" && "Марс ×2"}
                {gameOver.type === "koks" && "Кокс ×3"}
                {gameOver.type === "normal" && "Обычная победа"}
              </p>
              <button
                onClick={reset}
                className="px-6 py-3 rounded-lg bg-[var(--accent)] text-black font-semibold"
              >
                Сыграть ещё
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function PlayerCard({
  color,
  active,
  pip,
  avatarSrc,
}: {
  color: "white" | "black";
  active: boolean;
  pip: number;
  avatarSrc?: string;
}) {
  const label = color === "white" ? "Белые" : "Чёрные";
  return (
    <div
      className={`flex items-center gap-3 px-3 py-2 rounded-lg border ${
        active
          ? "border-[var(--accent)] bg-[var(--accent)]/10"
          : "border-[var(--muted)]/40 opacity-60"
      }`}
    >
      <Avatar src={avatarSrc} fallback={label} size="md" ring={active} />
      <div className="text-sm">
        <div className="font-medium flex items-center gap-1">
          <span
            className={`w-3 h-3 rounded-full border ${
              color === "white"
                ? "bg-[var(--checker-white)] border-[var(--checker-white-stroke)]"
                : "bg-[var(--checker-black)] border-[var(--checker-black-stroke)]"
            }`}
          />
          {label}
        </div>
        <div className="opacity-60 text-xs">pip {pip}</div>
      </div>
    </div>
  );
}
