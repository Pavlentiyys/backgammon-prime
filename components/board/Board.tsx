"use client";
import { useMemo } from "react";
import { motion } from "framer-motion";
import { useGameStore } from "@/lib/store/gameStore";
import { HEAD_INDEX } from "@/lib/engine/types";
import { cn } from "@/lib/utils/cn";

const TOP_ROW = [11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0];
const BOTTOM_ROW = [12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];

export function Board() {
  const state = useGameStore((s) => s.state);
  const selected = useGameStore((s) => s.selected);
  const selectPoint = useGameStore((s) => s.selectPoint);
  const playHalfMove = useGameStore((s) => s.playHalfMove);
  const legal = useGameStore((s) => s.legalHalfMoves)();

  const legalFromSelected = useMemo(
    () => (selected === null ? [] : legal.filter((m) => m.from === selected)),
    [legal, selected],
  );

  const legalSourcePoints = useMemo(() => new Set(legal.map((m) => m.from)), [legal]);

  const onPointClick = (idx: number) => {
    if (selected === null) {
      if (legalSourcePoints.has(idx)) selectPoint(idx);
      return;
    }
    if (idx === selected) {
      selectPoint(null);
      return;
    }
    const move = legalFromSelected.find((m) => m.to === idx);
    if (move) {
      playHalfMove(move);
      return;
    }
    if (legalSourcePoints.has(idx)) selectPoint(idx);
    else selectPoint(null);
  };

  const onBearOffClick = () => {
    if (selected === null) return;
    const move = legalFromSelected.find((m) => m.to === "off");
    if (move) playHalfMove(move);
  };

  const targetSet = useMemo(() => {
    const s = new Set<number | "off">();
    for (const m of legalFromSelected) s.add(m.to);
    return s;
  }, [legalFromSelected]);

  return (
    <div className="w-full max-w-4xl mx-auto select-none">
      <div className="relative rounded-lg bg-[var(--board-frame)] p-2 sm:p-3 shadow-2xl">
        <div className="relative grid grid-cols-[1fr_auto] gap-2 bg-[var(--board-bg)] rounded-md p-2 sm:p-3">
          <div className="grid grid-rows-2 gap-1">
            <div className="grid grid-cols-12 gap-px h-32 sm:h-40 md:h-48">
              {TOP_ROW.map((idx, i) => (
                <PointCell
                  key={idx}
                  idx={idx}
                  position={i}
                  orientation="top"
                  selected={selected === idx}
                  isLegalSource={legalSourcePoints.has(idx)}
                  isTarget={targetSet.has(idx)}
                  point={state.points[idx]}
                  isHead={idx === HEAD_INDEX.black}
                  onClick={() => onPointClick(idx)}
                />
              ))}
            </div>
            <div className="grid grid-cols-12 gap-px h-32 sm:h-40 md:h-48">
              {BOTTOM_ROW.map((idx, i) => (
                <PointCell
                  key={idx}
                  idx={idx}
                  position={i}
                  orientation="bottom"
                  selected={selected === idx}
                  isLegalSource={legalSourcePoints.has(idx)}
                  isTarget={targetSet.has(idx)}
                  point={state.points[idx]}
                  isHead={idx === HEAD_INDEX.white}
                  onClick={() => onPointClick(idx)}
                />
              ))}
            </div>
          </div>
          <BearOffColumn
            whiteOff={state.bornOff.white}
            blackOff={state.bornOff.black}
            canBearOff={targetSet.has("off")}
            onClick={onBearOffClick}
          />
        </div>
      </div>
    </div>
  );
}

function PointCell({
  idx,
  position,
  orientation,
  selected,
  isLegalSource,
  isTarget,
  point,
  isHead,
  onClick,
}: {
  idx: number;
  position: number;
  orientation: "top" | "bottom";
  selected: boolean;
  isLegalSource: boolean;
  isTarget: boolean;
  point: { color: "white" | "black" | null; count: number };
  isHead: boolean;
  onClick: () => void;
}) {
  const dark = position % 2 === 0;
  return (
    <button
      onClick={onClick}
      aria-label={`Пункт ${idx + 1}${point.count > 0 ? `, ${point.count} ${point.color}` : ""}`}
      className={cn(
        "relative flex flex-col items-center justify-start py-1 transition-colors",
        "border border-[var(--board-frame)]/30",
        dark ? "bg-[var(--point-dark)]/70" : "bg-[var(--point-light)]/70",
        orientation === "top" ? "flex-col" : "flex-col-reverse",
        selected && "ring-2 ring-[var(--accent)] z-10",
        isTarget && "bg-emerald-500/30 ring-2 ring-emerald-400",
        isLegalSource && !selected && "ring-1 ring-amber-300/60",
      )}
    >
      {isHead && (
        <span className="absolute -top-1 -right-1 text-[8px] px-1 rounded bg-[var(--accent)] text-black z-20">
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
          <Checker key={i} color={point.color!} />
        ))}
        {point.count > 6 && (
          <span className="text-[10px] font-bold text-[var(--foreground)] mt-0.5">
            ×{point.count}
          </span>
        )}
      </div>
      <span
        className={cn(
          "absolute text-[9px] sm:text-[10px] opacity-50",
          orientation === "top" ? "bottom-0.5" : "top-0.5",
        )}
      >
        {idx + 1}
      </span>
    </button>
  );
}

function Checker({ color }: { color: "white" | "black" }) {
  return (
    <motion.div
      layout
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={cn(
        "w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 rounded-full border-2 shadow-sm",
        color === "white"
          ? "bg-[var(--checker-white)] border-[var(--checker-white-stroke)]"
          : "bg-[var(--checker-black)] border-[var(--checker-black-stroke)]",
      )}
    />
  );
}

function BearOffColumn({
  whiteOff,
  blackOff,
  canBearOff,
  onClick,
}: {
  whiteOff: number;
  blackOff: number;
  canBearOff: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col justify-between w-10 sm:w-12 md:w-14 bg-[var(--board-frame)]/40 rounded transition-colors",
        canBearOff && "bg-emerald-500/40 ring-2 ring-emerald-400",
      )}
      aria-label="Зона выноса"
    >
      <div className="flex-1 flex flex-col items-center justify-start py-2 gap-0.5">
        <span className="text-xs opacity-70">B {blackOff}</span>
        <div className="flex flex-col gap-0.5">
          {Array.from({ length: Math.min(blackOff, 8) }).map((_, i) => (
            <div
              key={i}
              className="w-6 h-1 rounded bg-[var(--checker-black)] border border-[var(--checker-black-stroke)]"
            />
          ))}
        </div>
      </div>
      <div className="flex-1 flex flex-col-reverse items-center justify-start py-2 gap-0.5">
        <span className="text-xs opacity-70">W {whiteOff}</span>
        <div className="flex flex-col-reverse gap-0.5">
          {Array.from({ length: Math.min(whiteOff, 8) }).map((_, i) => (
            <div
              key={i}
              className="w-6 h-1 rounded bg-[var(--checker-white)] border border-[var(--checker-white-stroke)]"
            />
          ))}
        </div>
      </div>
    </button>
  );
}
