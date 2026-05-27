"use client";
import { useState } from "react";

export function PricingCTA({
  plan,
  recommended,
}: {
  plan: "monthly" | "yearly";
  recommended: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onClick = async () => {
    setLoading(true);
    setError(null);
    const res = await fetch("https://backgammon-prime.vercel.app/api/stripe/checkout", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ plan }),
    });
    setLoading(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error ?? "Stripe не настроен — нужны ключи в .env.local");
      return;
    }
    const { url } = (await res.json()) as { url: string };
    window.location.href = url;
  };

  return (
    <div className="space-y-2">
      <button
        onClick={onClick}
        disabled={loading}
        className={
          recommended
            ? "w-full py-2.5 rounded-md bg-[var(--accent)] text-black font-semibold disabled:opacity-50"
            : "w-full py-2.5 rounded-md border border-[var(--muted)]/40 font-medium disabled:opacity-50"
        }
      >
        {loading ? "..." : "Подключить Pro"}
      </button>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
