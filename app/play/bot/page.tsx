"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Board } from "@/components/board/Board";
import { DicePanel } from "@/components/dice/Dice";
import { useGameStore } from "@/lib/store/gameStore";
import { useBotAutoplay } from "@/lib/store/botMode";
import { pipCount } from "@/lib/engine/terminal";
import { BotLevel } from "@/lib/engine/bot/expectimax";
import { Avatar } from "@/components/ui/Avatar";
import { useYouAvatar } from "@/lib/avatar";

const LEVELS: { id: BotLevel; label: string; desc: string }[] = [
  { id: "easy", label: "Лёгкий", desc: "Глубина 1, шум — для разминки" },
  { id: "medium", label: "Средний", desc: "Глубина 2 — для опытных" },
  { id: "hard", label: "Сложный", desc: "Глубина 3 — настоящий челлендж" },
];

export default function BotPage() {
  const [level, setLevel] = useState<BotLevel | null>(null);
  const reset = useGameStore((s) => s.reset);
  const state = useGameStore((s) => s.state);
  const undo = useGameStore((s) => s.undo);
  const forceEndTurn = useGameStore((s) => s.forceEndTurn);
  const gameOver = useGameStore((s) => s.gameOver);
  const history = useGameStore((s) => s.history);
  const youAvatar = useYouAvatar();

  useEffect(() => {
    reset();
  }, [reset, level]);

  useBotAutoplay("black", level ?? "medium");

  useEffect(() => {
    if (!gameOver.over) return;
    void fetch("/api/game/log", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        type: "bot",
        winnerColor: gameOver.winner ?? null,
        winType: gameOver.type ?? null,
        finalState: state,
      }),
    });
  }, [gameOver, state]);

  if (!level) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 gap-6">
        <Link href="/" className="font-display text-2xl absolute top-4 left-6">
          Backgammon Prime
        </Link>
        <h1 className="font-display text-4xl">Игра против бота</h1>
        <p className="opacity-70">Выбери уровень сложности. Ты играешь белыми.</p>
        <div className="grid gap-3 w-full max-w-md">
          {LEVELS.map((l) => (
            <button
              key={l.id}
              onClick={() => setLevel(l.id)}
              className="p-4 rounded-xl border border-[var(--muted)]/40 hover:border-[var(--accent)] hover:bg-[var(--accent)]/10 text-left transition"
            >
              <div className="font-display text-xl">{l.label}</div>
              <div className="text-sm opacity-70">{l.desc}</div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-4 py-3 flex items-center justify-between border-b border-[var(--muted)]/30">
        <Link href="/" className="font-display text-xl">
          Backgammon Prime
        </Link>
        <span className="text-sm opacity-70">
          Бот · {LEVELS.find((l) => l.id === level)?.label}
        </span>
        <button
          onClick={() => setLevel(null)}
          className="text-sm opacity-70 hover:opacity-100"
        >
          Сменить уровень
        </button>
      </header>

      <main className="flex-1 flex flex-col gap-4 p-3 sm:p-6 max-w-5xl w-full mx-auto">
        <div className="flex items-center justify-between gap-4">
          <PlayerCard
            color="black"
            active={state.turn === "black"}
            pip={pipCount(state, "black")}
            label="Бот"
            avatarSrc="/avatars/bot.png"
          />
          <DicePanel />
          <PlayerCard
            color="white"
            active={state.turn === "white"}
            pip={pipCount(state, "white")}
            label="Ты"
            avatarSrc={youAvatar}
          />
        </div>

        <Board />

        <div className="flex flex-wrap gap-2 justify-center">
          <button
            onClick={undo}
            disabled={history.length === 0 || state.turn === "black"}
            className="px-4 py-2 rounded-md bg-[var(--muted)]/30 disabled:opacity-30"
          >
            ↶ Отмена
          </button>
          <button
            onClick={forceEndTurn}
            disabled={state.dice.length === 0 || state.turn === "black"}
            className="px-4 py-2 rounded-md bg-[var(--accent)]/80 text-black disabled:opacity-30 font-medium"
          >
            Готово →
          </button>
          <button
            onClick={reset}
            className="px-4 py-2 rounded-md bg-red-500/30 hover:bg-red-500/50"
          >
            Сдаться
          </button>
          <Link
            href="/"
            className="px-4 py-2 rounded-md border border-[var(--muted)]/40 hover:bg-[var(--muted)]/10"
          >
            Выход
          </Link>
        </div>

        {gameOver.over && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-[var(--background)] border border-[var(--accent)] rounded-2xl p-8 max-w-md text-center shadow-2xl">
              <h2 className="font-display text-3xl mb-2">
                {gameOver.winner === "white" ? "Ты победил!" : "Бот победил"}
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
                Реванш
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
  label,
  avatarSrc,
}: {
  color: "white" | "black";
  active: boolean;
  pip: number;
  label: string;
  avatarSrc?: string;
}) {
  return (
    <div
      className={`flex items-center gap-3 px-3 py-2 rounded-lg border ${
        active ? "border-[var(--accent)] bg-[var(--accent)]/10" : "border-[var(--muted)]/40 opacity-60"
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
