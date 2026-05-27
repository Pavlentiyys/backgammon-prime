"use client";
import { createInitialState } from "@/lib/engine/state";
import { HEAD_INDEX } from "@/lib/engine/types";
import { cn } from "@/lib/utils/cn";

const TOP_ROW = [11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0];
const BOTTOM_ROW = [12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];

export function LandingBoard() {
  const state = createInitialState();
  return (
    <div className="w-full max-w-2xl select-none pointer-events-none">
      <div className="rounded-lg bg-[var(--board-frame)] p-2 sm:p-3 shadow-2xl">
        <div className="grid grid-cols-[1fr_auto] gap-2 bg-[var(--board-bg)] rounded-md p-2 sm:p-3">
          <div className="grid grid-rows-2 gap-1">
            <div className="grid grid-cols-12 gap-px h-40 sm:h-48 md:h-56">
              {TOP_ROW.map((idx, i) => (
                <PointCell
                  key={idx}
                  idx={idx}
                  position={i}
                  orientation="top"
                  point={state.points[idx]}
                  isHead={idx === HEAD_INDEX.black}
                />
              ))}
            </div>
            <div className="grid grid-cols-12 gap-px h-40 sm:h-48 md:h-56">
              {BOTTOM_ROW.map((idx, i) => (
                <PointCell
                  key={idx}
                  idx={idx}
                  position={i}
                  orientation="bottom"
                  point={state.points[idx]}
                  isHead={idx === HEAD_INDEX.white}
                />
              ))}
            </div>
          </div>
          <div className="w-8 sm:w-10 md:w-12 bg-[var(--board-frame)]/40 rounded" />
        </div>
      </div>
    </div>
  );
}

function PointCell({
  idx,
  position,
  orientation,
  point,
  isHead,
}: {
  idx: number;
  position: number;
  orientation: "top" | "bottom";
  point: { color: "white" | "black" | null; count: number };
  isHead: boolean;
}) {
  const dark = position % 2 === 0;
  return (
    <div
      className={cn(
        "relative flex items-center py-1 border border-[var(--board-frame)]/30",
        dark ? "bg-[var(--point-dark)]/70" : "bg-[var(--point-light)]/70",
        orientation === "top" ? "flex-col" : "flex-col-reverse",
      )}
    >
      {isHead && (
        <span className="absolute -top-1 -right-1 text-[8px] px-1 rounded bg-[var(--accent)] text-black z-10">
          Г
        </span>
      )}
      <div
        className={cn(
          "flex gap-0.5 items-center w-full px-0.5",
          orientation === "top" ? "flex-col" : "flex-col-reverse",
        )}
      >
        {Array.from({ length: Math.min(point.count, 6) }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 rounded-full border-2 shadow-sm",
              point.color === "white"
                ? "bg-[var(--checker-white)] border-[var(--checker-white-stroke)]"
                : "bg-[var(--checker-black)] border-[var(--checker-black-stroke)]",
            )}
          />
        ))}
        {point.count > 6 && (
          <span className="text-[10px] font-bold mt-0.5">×{point.count}</span>
        )}
      </div>
      <span
        className={cn(
          "absolute text-[9px] opacity-50",
          orientation === "top" ? "bottom-0.5" : "top-0.5",
        )}
      >
        {idx + 1}
      </span>
    </div>
  );
}
