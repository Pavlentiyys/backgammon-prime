"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Board } from "@/components/board/Board";
import { useGameStore } from "@/lib/store/gameStore";
import { createClient } from "@/lib/supabase/client";
import { pipCount, isGameOver } from "@/lib/engine/terminal";
import type { GameState, Color } from "@/lib/engine/types";
import type { GameType } from "@/lib/supabase/types";
import { cn } from "@/lib/utils/cn";
import { Avatar } from "@/components/ui/Avatar";

type Props = {
  gameId: string;
  initialState: GameState;
  type: GameType;
  myColor: Color | "spectator" | null;
};

export function GameClient({ gameId, initialState, type, myColor }: Props) {
  const state = useGameStore((s) => s.state);
  const sequenceSoFar = useGameStore((s) => s.sequenceSoFar);
  const [busy, setBusy] = useState<null | "roll" | "submit" | "resign">(null);
  const [error, setError] = useState<string | null>(null);
  const baseStateRef = useRef<GameState>(initialState);
  const gameOver = useMemo(() => isGameOver(state), [state]);

  useEffect(() => {
    baseStateRef.current = initialState;
    useGameStore.setState({
      state: initialState,
      history: [],
      sequenceSoFar: [],
      selected: null,
      gameOver: { over: false },
    });
  }, [initialState]);

  useEffect(() => {
    const sb = createClient();
    const channel = sb
      .channel(`game:${gameId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "games", filter: `id=eq.${gameId}` },
        (payload) => {
          const next = (payload.new as { state: GameState }).state;
          baseStateRef.current = next;
          useGameStore.setState({
            state: next,
            history: [],
            sequenceSoFar: [],
            selected: null,
          });
        },
      )
      .subscribe();
    return () => {
      void sb.removeChannel(channel);
    };
  }, [gameId]);

  const isMyTurn = useMemo(() => {
    if (type === "hotseat") return true;
    return myColor === state.turn;
  }, [type, myColor, state.turn]);

  const canAct = !!myColor && myColor !== "spectator" && !gameOver.over;

  const onRoll = async () => {
    setError(null);
    setBusy("roll");
    const res = await fetch(`/api/game/${gameId}/roll`, { method: "POST" });
    setBusy(null);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error ?? "Не удалось бросить");
    }
  };

  const onSubmit = async () => {
    if (sequenceSoFar.length === 0) return;
    setError(null);
    setBusy("submit");
    const res = await fetch(`/api/game/${gameId}/move`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ sequence: sequenceSoFar }),
    });
    setBusy(null);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error ?? "Ход отклонён сервером");
      useGameStore.setState({
        state: baseStateRef.current,
        history: [],
        sequenceSoFar: [],
        selected: null,
      });
    }
  };

  const onResign = async () => {
    if (!confirm("Сдаться?")) return;
    setBusy("resign");
    await fetch(`/api/game/${gameId}/resign`, { method: "POST" });
    setBusy(null);
  };

  const onUndo = () => useGameStore.getState().undo();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between text-sm opacity-70 flex-wrap gap-2">
        <span>
          Партия #{gameId.slice(0, 8)} · {type}
          {myColor === "spectator" && " · спектатор"}
        </span>
        <span>
          ход: {state.turn === "white" ? "белые" : "чёрные"}
          {!isMyTurn && canAct && " · ждём соперника"}
        </span>
      </div>

      <div className="flex items-center justify-between gap-4">
        <PlayerCard
          color="black"
          active={state.turn === "black"}
          you={myColor === "black"}
          pip={pipCount(state, "black")}
        />
        <div className="flex flex-col items-center gap-2">
          <DiceDisplay state={state} />
          {canAct && isMyTurn && state.remaining.length === 0 && (
            <button
              onClick={onRoll}
              disabled={busy === "roll"}
              className="px-4 py-2 rounded-md bg-[var(--accent)] text-black font-medium disabled:opacity-50"
            >
              {busy === "roll" ? "..." : "Бросить"}
            </button>
          )}
        </div>
        <PlayerCard
          color="white"
          active={state.turn === "white"}
          you={myColor === "white"}
          pip={pipCount(state, "white")}
        />
      </div>

      <Board />

      {canAct && (
        <div className="flex flex-wrap gap-2 justify-center">
          <button
            onClick={onUndo}
            disabled={sequenceSoFar.length === 0}
            className="px-4 py-2 rounded-md bg-[var(--muted)]/30 disabled:opacity-30"
          >
            ↶ Отмена
          </button>
          <button
            onClick={onSubmit}
            disabled={sequenceSoFar.length === 0 || busy !== null}
            className="px-4 py-2 rounded-md bg-[var(--accent)] text-black disabled:opacity-30 font-medium"
          >
            {busy === "submit" ? "Отправляем..." : "Готово →"}
          </button>
          <button
            onClick={onResign}
            disabled={busy !== null}
            className="px-4 py-2 rounded-md bg-red-500/30 hover:bg-red-500/50"
          >
            Сдаться
          </button>
        </div>
      )}

      {error && (
        <div className="text-center text-red-400 text-sm">{error}</div>
      )}

      {gameOver.over && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[var(--background)] border border-[var(--accent)] rounded-2xl p-8 max-w-md text-center shadow-2xl">
            <h2 className="font-display text-3xl mb-2">
              {gameOver.winner === myColor
                ? "Победа!"
                : myColor === "spectator"
                  ? gameOver.winner === "white" ? "Победили белые" : "Победили чёрные"
                  : "Поражение"}
            </h2>
            <p className="text-lg mb-4 opacity-80">
              {gameOver.type === "mars" && "Марс ×2"}
              {gameOver.type === "koks" && "Кокс ×3"}
              {gameOver.type === "normal" && "Обычная победа"}
            </p>
            <Link
              href="/play/new"
              className="inline-block px-6 py-3 rounded-lg bg-[var(--accent)] text-black font-semibold"
            >
              Новая партия
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function PlayerCard({
  color,
  active,
  you,
  pip,
}: {
  color: Color;
  active: boolean;
  you: boolean;
  pip: number;
}) {
  const label = color === "white" ? "Белые" : "Чёрные";
  const avatarSrc = color === "white" ? "/avatars/player-right.png" : "/avatars/player-left.png";
  return (
    <div
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-lg border",
        active
          ? "border-[var(--accent)] bg-[var(--accent)]/10"
          : "border-[var(--muted)]/40 opacity-60",
      )}
    >
      <Avatar src={avatarSrc} fallback={label} size="md" ring={active} />
      <div className="text-sm">
        <div className="font-medium flex items-center gap-1">
          <span
            className={cn(
              "w-3 h-3 rounded-full border",
              color === "white"
                ? "bg-[var(--checker-white)] border-[var(--checker-white-stroke)]"
                : "bg-[var(--checker-black)] border-[var(--checker-black-stroke)]",
            )}
          />
          {label}
          {you && <span className="ml-1 text-xs opacity-60">(ты)</span>}
        </div>
        <div className="opacity-60 text-xs">pip {pip}</div>
      </div>
    </div>
  );
}

function DiceDisplay({ state }: { state: GameState }) {
  if (state.dice.length === 0) {
    return <div className="text-sm opacity-50">кости ещё не брошены</div>;
  }
  const expanded =
    state.dice[0] === state.dice[1]
      ? [state.dice[0], state.dice[0], state.dice[0], state.dice[0]]
      : state.dice;
  const remCounts: Record<number, number> = {};
  for (const d of state.remaining) remCounts[d] = (remCounts[d] ?? 0) + 1;
  const usedFlags: boolean[] = [];
  const rem = { ...remCounts };
  for (const d of expanded) {
    if (rem[d] > 0) {
      usedFlags.push(false);
      rem[d] -= 1;
    } else usedFlags.push(true);
  }
  return (
    <div className="flex gap-1">
      {expanded.map((d, i) => (
        <span
          key={i}
          className={cn(
            "w-7 h-7 rounded bg-[var(--checker-white)] text-[var(--checker-black)] font-bold text-sm flex items-center justify-center border-2 border-[var(--checker-white-stroke)]",
            usedFlags[i] && "opacity-30",
          )}
        >
          {d}
        </span>
      ))}
    </div>
  );
}
