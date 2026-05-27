"use client";
import { useGameStore } from "@/lib/store/gameStore";
import { cn } from "@/lib/utils/cn";

export function DicePanel() {
  const state = useGameStore((s) => s.state);
  const roll = useGameStore((s) => s.roll);

  const remaining = state.remaining;
  const dice = state.dice;

  if (dice.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2">
        <button
          onClick={roll}
          className="px-6 py-3 rounded-lg bg-[var(--accent)] text-black font-semibold shadow hover:brightness-110 transition"
        >
          Бросить кости
        </button>
        <span className="text-xs opacity-60">Ход: {state.turn === "white" ? "белые" : "чёрные"}</span>
      </div>
    );
  }

  const usedCounts: Record<number, number> = {};
  for (const d of dice) usedCounts[d] = (usedCounts[d] ?? 0) + (dice[0] === dice[1] ? 2 : 1);
  const expanded = dice[0] === dice[1] ? [dice[0], dice[0], dice[0], dice[0]] : dice;
  const remainingCounts: Record<number, number> = {};
  for (const d of remaining) remainingCounts[d] = (remainingCounts[d] ?? 0) + 1;
  const usedFlags: boolean[] = [];
  const remCopy = { ...remainingCounts };
  for (const d of expanded) {
    if (remCopy[d] > 0) {
      usedFlags.push(false);
      remCopy[d] -= 1;
    } else {
      usedFlags.push(true);
    }
  }

  return (
    <div className="flex items-center gap-2">
      {expanded.map((d, i) => (
        <Die key={i} value={d} used={usedFlags[i]} />
      ))}
    </div>
  );
}

function Die({ value, used }: { value: number; used: boolean }) {
  const dots = DOT_PATTERNS[value];
  return (
    <div
      className={cn(
        "w-10 h-10 sm:w-12 sm:h-12 rounded-md bg-[var(--checker-white)] border-2 border-[var(--checker-white-stroke)] grid grid-cols-3 grid-rows-3 gap-0.5 p-1 shadow",
        used && "opacity-30 grayscale",
      )}
    >
      {Array.from({ length: 9 }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "rounded-full",
            dots.includes(i) ? "bg-[var(--checker-black)]" : "",
          )}
        />
      ))}
    </div>
  );
}

const DOT_PATTERNS: Record<number, number[]> = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};
