"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/env";

type Mode = "realtime" | "async";

export function NewRoomForm() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("realtime");
  const [timePerMove, setTimePerMove] = useState(60);
  const [isPublic, setIsPublic] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onCreate = async () => {
    setError(null);
    if (!isSupabaseConfigured()) {
      setError("Supabase не настроен.");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/room/create", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        type: mode,
        timePerMove: mode === "async" ? 86400 : timePerMove,
        isPublic,
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error ?? "Не удалось создать комнату. Войди в аккаунт.");
      return;
    }
    const { slug } = (await res.json()) as { slug: string };
    router.push(`/play/r/${slug}`);
  };

  return (
    <main className="max-w-md mx-auto p-6 space-y-6">
      <h1 className="font-display text-3xl">Новая комната</h1>

      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <ModeButton
            active={mode === "realtime"}
            onClick={() => setMode("realtime")}
            title="Realtime"
            sub="Оба онлайн"
          />
          <ModeButton
            active={mode === "async"}
            onClick={() => setMode("async")}
            title="Async (24ч)"
            sub="Ход когда удобно"
          />
        </div>

        {mode === "realtime" && (
          <label className="block space-y-1">
            <span className="text-sm opacity-70">Время на ход</span>
            <select
              value={timePerMove}
              onChange={(e) => setTimePerMove(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-md bg-[var(--muted)]/20 border border-[var(--muted)]/40"
            >
              <option value={30}>30 секунд</option>
              <option value={60}>1 минута</option>
              <option value={120}>2 минуты</option>
            </select>
          </label>
        )}

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
          />
          <span className="text-sm">Публичная (видна спектаторам)</span>
        </label>
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <button
        onClick={onCreate}
        disabled={loading}
        className="w-full py-3 rounded-md bg-[var(--accent)] text-black font-medium disabled:opacity-50"
      >
        {loading ? "Создаём..." : "Создать комнату"}
      </button>

      <p className="text-xs opacity-60 text-center">
        После создания получишь короткую ссылку — отправь другу.
      </p>
    </main>
  );
}

function ModeButton({
  active,
  onClick,
  title,
  sub,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  sub: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? "p-3 rounded-md border-2 border-[var(--accent)] bg-[var(--accent)]/10 text-left"
          : "p-3 rounded-md border border-[var(--muted)]/40 text-left opacity-70"
      }
    >
      <div className="font-medium text-sm">{title}</div>
      <div className="text-xs opacity-70">{sub}</div>
    </button>
  );
}
