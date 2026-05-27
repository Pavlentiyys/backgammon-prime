"use client";
import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";

type Comment = {
  moveNumber: number;
  severity: "excellent" | "ok" | "mistake" | "blunder";
  loss: number;
  color: "white" | "black";
  dice: number[];
  text: string | null;
};

type Analysis = {
  accuracy: number;
  mistakes_count: number;
  blunders_count: number;
  summary_text: string;
  move_comments: Comment[];
};

const SEVERITY_STYLE: Record<Comment["severity"], string> = {
  excellent: "text-emerald-400 bg-emerald-400/10",
  ok: "text-yellow-300 bg-yellow-300/10",
  mistake: "text-orange-400 bg-orange-400/10",
  blunder: "text-red-400 bg-red-400/10",
};

const SEVERITY_ICON: Record<Comment["severity"], string> = {
  excellent: "●",
  ok: "●",
  mistake: "▲",
  blunder: "✕",
};

export function AnalysisClient({
  gameId,
  initial,
  signedIn,
}: {
  gameId: string;
  initial: Analysis | null;
  signedIn: boolean;
}) {
  const [data, setData] = useState<Analysis | null>(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paywall, setPaywall] = useState(false);

  const run = async () => {
    setError(null);
    setPaywall(false);
    setLoading(true);
    const res = await fetch(`/api/analysis/${gameId}`, { method: "POST" });
    setLoading(false);
    if (res.status === 402) {
      setPaywall(true);
      return;
    }
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error ?? "ошибка");
      return;
    }
    const j = (await res.json()) as { analysis: Analysis };
    setData(j.analysis);
  };

  if (!signedIn) {
    return (
      <p className="opacity-70">
        Войди, чтобы получить разбор партии.{" "}
        <Link href="/sign-in" className="text-[var(--accent)] underline">
          Войти
        </Link>
      </p>
    );
  }

  if (!data) {
    return (
      <div className="space-y-3">
        {paywall && (
          <div className="p-4 rounded-xl border border-[var(--accent)] bg-[var(--accent)]/10">
            <p className="font-medium mb-2">Бесплатный лимит исчерпан (3/мес)</p>
            <Link
              href="/pricing"
              className="inline-block px-4 py-2 rounded bg-[var(--accent)] text-black font-medium"
            >
              Подключить Pro
            </Link>
          </div>
        )}
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button
          onClick={run}
          disabled={loading}
          className="px-6 py-3 rounded-lg bg-[var(--accent)] text-black font-semibold disabled:opacity-50"
        >
          {loading ? "Анализируем..." : "Запросить разбор"}
        </button>
        <p className="text-xs opacity-60">
          Движок посчитает equity loss каждого твоего хода, Claude объяснит топ-3 ошибки.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-3">
        <Stat label="Accuracy" value={`${data.accuracy}%`} />
        <Stat label="Ошибки" value={data.mistakes_count} />
        <Stat label="Зевки" value={data.blunders_count} />
      </div>

      {data.summary_text && (
        <div className="p-4 rounded-xl border border-[var(--muted)]/30 bg-[var(--muted)]/10">
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{data.summary_text}</p>
        </div>
      )}

      <AccuracyChart comments={data.move_comments} />

      <section className="space-y-2">
        <h2 className="font-display text-xl">Ходы</h2>
        <ul className="space-y-1">
          {data.move_comments.map((c) => (
            <li
              key={c.moveNumber}
              className="p-3 rounded-lg border border-[var(--muted)]/20 flex flex-col gap-1"
            >
              <div className="flex items-center gap-2">
                <span className={cn("px-2 py-0.5 rounded text-xs", SEVERITY_STYLE[c.severity])}>
                  {SEVERITY_ICON[c.severity]} #{c.moveNumber}
                </span>
                <span className="text-xs opacity-60">
                  {c.color === "white" ? "белые" : "чёрные"} · {c.dice.join("-")}
                </span>
                <span className="text-xs opacity-60 ml-auto">loss {c.loss}</span>
              </div>
              {c.text && <p className="text-sm opacity-80">{c.text}</p>}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="p-3 rounded-xl border border-[var(--muted)]/30 bg-[var(--muted)]/10 text-center">
      <div className="text-2xl font-display">{value}</div>
      <div className="text-xs opacity-60">{label}</div>
    </div>
  );
}

function AccuracyChart({ comments }: { comments: Comment[] }) {
  if (comments.length === 0) return null;
  const max = Math.max(1, ...comments.map((c) => c.loss));
  return (
    <div className="flex items-end gap-1 h-24 p-2 rounded-xl border border-[var(--muted)]/20">
      {comments.map((c) => (
        <div
          key={c.moveNumber}
          title={`#${c.moveNumber} loss ${c.loss}`}
          className={cn(
            "flex-1 rounded-t min-w-[3px]",
            c.severity === "excellent" && "bg-emerald-400/50",
            c.severity === "ok" && "bg-yellow-300/50",
            c.severity === "mistake" && "bg-orange-400/70",
            c.severity === "blunder" && "bg-red-400/80",
          )}
          style={{ height: `${Math.max(4, (c.loss / max) * 100)}%` }}
        />
      ))}
    </div>
  );
}
