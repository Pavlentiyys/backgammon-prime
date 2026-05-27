"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function JoinClient({ slug }: { slug: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onJoin = async () => {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/room/join", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ slug }),
    });
    setLoading(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error ?? "ошибка");
      return;
    }
    const { gameId } = (await res.json()) as { gameId: string };
    router.push(`/play/${gameId}`);
  };

  return (
    <div className="space-y-2">
      <button
        onClick={onJoin}
        disabled={loading}
        className="w-full py-3 rounded-md bg-[var(--accent)] text-black font-medium disabled:opacity-50"
      >
        {loading ? "Подключаемся..." : "Подключиться"}
      </button>
      {error && <p className="text-red-400 text-sm">{error}</p>}
    </div>
  );
}
