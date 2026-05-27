"use client";
/* eslint-disable @next/next/no-img-element */
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Board } from "@/components/board/Board";
import { useGameStore } from "@/lib/store/gameStore";
import { useBotAutoplay } from "@/lib/store/botMode";
import { CHAPTERS, type Scene, type Chapter, type Speaker } from "@/lib/tutorial/chapters";
import { cn } from "@/lib/utils/cn";
import { Avatar } from "@/components/ui/Avatar";
import { rollDice, defaultRng } from "@/lib/engine/rng";
import { setDice } from "@/lib/engine/game";
import type { GameState } from "@/lib/engine/types";

type ChatMessage = { speaker: Speaker | "coach"; text: string };

export function TutorialClient() {
  const [chapterIdx, setChapterIdx] = useState(0);
  const [sceneIdx, setSceneIdx] = useState(0);

  const chapter = CHAPTERS[chapterIdx];
  const scene = chapter.scenes[sceneIdx];
  const totalScenes = chapter.scenes.length;

  const isLastScene = sceneIdx >= totalScenes - 1;
  const isLastChapter = chapterIdx >= CHAPTERS.length - 1;

  const next = () => {
    if (isLastScene) {
      if (isLastChapter) return;
      setChapterIdx((i) => i + 1);
      setSceneIdx(0);
    } else {
      setSceneIdx((i) => i + 1);
    }
  };

  const prev = () => {
    if (sceneIdx > 0) setSceneIdx((i) => i - 1);
    else if (chapterIdx > 0) {
      const prevChap = CHAPTERS[chapterIdx - 1];
      setChapterIdx((i) => i - 1);
      setSceneIdx(prevChap.scenes.length - 1);
    }
  };

  // Chat history scoped to the current chapter only — resets on chapter change.
  const chatHistory = useMemo(() => {
    const out: ChatMessage[] = [];
    for (let s = 0; s <= sceneIdx; s++) {
      const sc = chapter.scenes[s];
      if (sc.kind === "dialogue") out.push({ speaker: sc.speaker, text: sc.text });
    }
    return out;
  }, [chapter, sceneIdx]);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)]">
      <header className="px-4 sm:px-6 py-3 flex items-center justify-between border-b border-[var(--muted)]/30">
        <Link href="/play/local" className="text-sm opacity-80 hover:opacity-100">
          ← Назад
        </Link>
        <div className="text-sm text-center">
          <div className="font-medium">{chapter.title}</div>
          <div className="opacity-70 text-xs">{chapter.subtitle}</div>
        </div>
        <span className="text-xs opacity-70">
          {chapterIdx + 1}/{CHAPTERS.length}
        </span>
      </header>

      <ProgressBar
        chapters={CHAPTERS.length}
        currentChapter={chapterIdx}
        sceneRatio={(sceneIdx + 1) / totalScenes}
      />

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-[3fr_1fr] gap-3 p-3 sm:p-4 min-h-0">
        <section className="flex flex-col gap-3 min-h-0">
          {scene.kind === "interactive" ? (
            <InteractivePane scene={scene} />
          ) : (
            <ImagePane chapter={chapter} />
          )}
        </section>

        <ChatSidebar
          history={chatHistory}
          isLastChapter={isLastChapter}
          isLastScene={isLastScene}
          onPrev={prev}
          onNext={next}
          canPrev={chapterIdx > 0 || sceneIdx > 0}
          isInteractive={scene.kind === "interactive"}
        />
      </main>
    </div>
  );
}

function ImagePane({ chapter }: { chapter: Chapter }) {
  if (!chapter.image)
    return (
      <div className="flex-1 flex items-center justify-center text-9xl opacity-20">♟</div>
    );
  return (
    <div className="flex-1 rounded-2xl overflow-hidden shadow-2xl bg-[var(--board-bg)] relative min-h-[40vh]">
      <img
        src={chapter.image}
        alt={chapter.title}
        className="absolute inset-0 w-full h-full object-cover"
      />
    </div>
  );
}

function InteractivePane({
  scene,
}: {
  scene: Extract<Scene, { kind: "interactive" }>;
}) {
  const state = useGameStore((s) => s.state);
  const sequenceSoFar = useGameStore((s) => s.sequenceSoFar);
  const gameOver = useGameStore((s) => s.gameOver);
  const undo = useGameStore((s) => s.undo);
  const forceEndTurn = useGameStore((s) => s.forceEndTurn);

  useEffect(() => {
    useGameStore.setState({
      state: scene.state,
      history: [],
      sequenceSoFar: [],
      selected: null,
      gameOver: { over: false },
    });
  }, [scene.state]);

  useBotAutoplay("black", scene.bot);

  const roll = () => {
    if (state.remaining.length > 0 || sequenceSoFar.length > 0) return;
    const [d1, d2] = rollDice(defaultRng());
    useGameStore.setState({
      state: setDice(state, d1, d2),
      history: [],
      sequenceSoFar: [],
      selected: null,
    });
  };

  const hint = useMemo(
    () => coachingHint(state, sequenceSoFar.length, gameOver.over),
    [state, sequenceSoFar.length, gameOver.over],
  );

  return (
    <>
      <div className="rounded-xl border border-[var(--accent)]/40 bg-[var(--accent)]/10 p-3 flex gap-3 items-start">
        <Avatar src="/avatars/ded.png" fallback="Д" size="md" />
        <div className="text-sm leading-snug flex-1">
          <div className="text-xs opacity-70 mb-0.5">Подсказка деда</div>
          {hint}
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center min-h-0">
        <Board />
      </div>

      <div className="flex flex-wrap gap-3 justify-center items-center">
        <DiceDisplay dice={state.dice} remaining={state.remaining} />
        {state.turn === "white" &&
          state.remaining.length === 0 &&
          sequenceSoFar.length === 0 &&
          !gameOver.over && (
            <button
              onClick={roll}
              className="px-5 py-2.5 rounded-lg bg-[var(--accent)] text-black font-semibold shadow"
            >
              🎲 Бросить
            </button>
          )}
        {state.turn === "white" &&
          state.remaining.length === 0 &&
          sequenceSoFar.length > 0 && (
            <button
              onClick={forceEndTurn}
              className="px-5 py-2.5 rounded-lg bg-[var(--accent)] text-black font-semibold shadow"
            >
              Готово →
            </button>
          )}
        {sequenceSoFar.length > 0 && (
          <button
            onClick={undo}
            className="px-5 py-2.5 rounded-lg bg-[var(--muted)]/30 text-sm"
          >
            ↶ Отмена
          </button>
        )}
      </div>
    </>
  );
}

function DiceDisplay({ dice, remaining }: { dice: number[]; remaining: number[] }) {
  if (dice.length === 0) return null;
  const expanded = dice[0] === dice[1] ? [dice[0], dice[0], dice[0], dice[0]] : dice;
  const remCounts: Record<number, number> = {};
  for (const d of remaining) remCounts[d] = (remCounts[d] ?? 0) + 1;
  const usedFlags: boolean[] = [];
  const rem = { ...remCounts };
  for (const d of expanded) {
    if (rem[d] > 0) {
      usedFlags.push(false);
      rem[d] -= 1;
    } else usedFlags.push(true);
  }
  return (
    <div className="flex gap-2">
      {expanded.map((d, i) => (
        <Die key={i} value={d} used={usedFlags[i]} />
      ))}
    </div>
  );
}

const DIE_DOTS: Record<number, number[]> = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

function Die({ value, used }: { value: number; used: boolean }) {
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
            DIE_DOTS[value].includes(i) ? "bg-[var(--checker-black)]" : "",
          )}
        />
      ))}
    </div>
  );
}

function ChatSidebar({
  history,
  isLastChapter,
  isLastScene,
  onPrev,
  onNext,
  canPrev,
  isInteractive,
}: {
  history: ChatMessage[];
  isLastChapter: boolean;
  isLastScene: boolean;
  onPrev: () => void;
  onNext: () => void;
  canPrev: boolean;
  isInteractive: boolean;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history.length]);

  return (
    <aside className="flex flex-col gap-2 min-h-0 rounded-2xl border border-[var(--muted)]/30 bg-[var(--muted)]/5 p-3">
      <div className="text-xs opacity-60 uppercase tracking-wide px-1">Диалог</div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[40vh]">
        {history.length === 0 && (
          <p className="text-xs opacity-50 text-center pt-8">Начинаем разговор…</p>
        )}
        {history.map((m, i) => (
          <ChatBubble key={i} speaker={m.speaker} text={m.text} />
        ))}
        {isInteractive && (
          <div className="text-[11px] opacity-60 text-center pt-2 italic">
            …идёт партия. Слушай подсказки сверху над доской.
          </div>
        )}
      </div>

      <div className="flex gap-2 pt-2 border-t border-[var(--muted)]/20">
        <button
          onClick={onPrev}
          disabled={!canPrev}
          className="flex-1 py-2 rounded-md border border-[var(--muted)]/40 disabled:opacity-30 text-sm"
        >
          ←
        </button>
        {isLastChapter && isLastScene ? (
          <Link
            href="/play/bot"
            className="flex-[2] py-2 rounded-md bg-[var(--accent)] text-black font-semibold text-center text-sm"
          >
            К боту →
          </Link>
        ) : (
          <button
            onClick={onNext}
            className="flex-[2] py-2 rounded-md bg-[var(--accent)] text-black font-semibold text-sm"
          >
            Дальше →
          </button>
        )}
      </div>
    </aside>
  );
}

function ChatBubble({ speaker, text }: { speaker: Speaker | "coach"; text: string }) {
  const isDed = speaker === "ded" || speaker === "coach";
  return (
    <div
      className={cn(
        "flex gap-2 items-start",
        isDed ? "flex-row" : "flex-row-reverse",
      )}
    >
      <Avatar
        src={isDed ? "/avatars/ded.png" : "/avatars/vnuk.png"}
        fallback={isDed ? "Д" : "В"}
        size="sm"
      />
      <div
        className={cn(
          "rounded-2xl p-2.5 text-xs leading-snug max-w-[85%]",
          isDed
            ? "rounded-tl-none bg-amber-900/30 border border-amber-700/30"
            : "rounded-tr-none bg-sky-900/30 border border-sky-700/30",
        )}
      >
        <div className="text-[10px] opacity-60 mb-0.5">{isDed ? "Дед" : "Внук"}</div>
        <p className="whitespace-pre-wrap">{text}</p>
      </div>
    </div>
  );
}

function coachingHint(state: GameState, soFar: number, over: boolean): string {
  if (over) return "Партия окончена. Молодец! Жми «Дальше» в чате справа.";
  if (state.turn === "black") return "Теперь мой ход. Думаю над лучшим ходом…";
  if (state.remaining.length === 0 && soFar === 0)
    return "Жми «Бросить» — выпадут два кубика. Каждый кубик — это сколько шагов сдвинуть фишку.";
  if (state.remaining.length > 0 && soFar === 0)
    return "Кликни на свою фишку (белую). Подсветятся пункты, куда можно сходить — кликни на нужный.";
  if (state.remaining.length > 0 && soFar > 0)
    return "Хорошо! Остались ещё кубики — сыграй их. Можно одной фишкой, можно разными.";
  if (state.remaining.length === 0 && soFar > 0)
    return "Все кубики разыграл — жми «Готово» чтобы передать ход.";
  return "Думай, не торопись.";
}

function ProgressBar({
  chapters,
  currentChapter,
  sceneRatio,
}: {
  chapters: number;
  currentChapter: number;
  sceneRatio: number;
}) {
  return (
    <div className="flex gap-1 px-6 py-2 border-b border-[var(--muted)]/20">
      {Array.from({ length: chapters }).map((_, i) => (
        <div
          key={i}
          className="flex-1 h-1 rounded-full bg-[var(--muted)]/20 overflow-hidden"
        >
          <div
            className="h-full bg-[var(--accent)] transition-all"
            style={{
              width:
                i < currentChapter
                  ? "100%"
                  : i === currentChapter
                    ? `${sceneRatio * 100}%`
                    : "0%",
            }}
          />
        </div>
      ))}
    </div>
  );
}
