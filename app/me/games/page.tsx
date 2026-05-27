import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/Header";
import { isSupabaseConfigured } from "@/lib/env";
import type { GameRow } from "@/lib/supabase/types";

type Search = { type?: string; result?: string };

export default async function MyGamesPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  if (!isSupabaseConfigured()) {
    return (
      <>
        <Header />
        <main className="p-8 text-center opacity-70">Supabase не настроен.</main>
      </>
    );
  }
  const sp = await searchParams;
  const sb = await createClient();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) redirect("/sign-in");

  let q = sb
    .from("games")
    .select("id, type, status, winner_color, win_type, created_at, player_white, player_black")
    .or(`player_white.eq.${user.id},player_black.eq.${user.id}`)
    .order("created_at", { ascending: false })
    .limit(50);

  if (sp.type) q = q.eq("type", sp.type);

  const { data: games } = await q;
  const filtered = (games ?? []).filter((g) => {
    if (!sp.result) return true;
    const myColor = g.player_white === user.id ? "white" : "black";
    const won = g.winner_color === myColor;
    return sp.result === "win" ? won : !won && g.status === "finished";
  }) as GameRow[];

  return (
    <>
      <Header />
      <main className="max-w-3xl mx-auto p-6 space-y-4">
        <h1 className="font-display text-3xl">Мои партии</h1>

        <div className="flex gap-2 text-sm">
          <FilterLink current={sp.type} value={undefined} label="Все" param="type" />
          <FilterLink current={sp.type} value="bot" label="Бот" param="type" />
          <FilterLink current={sp.type} value="realtime" label="Realtime" param="type" />
          <FilterLink current={sp.type} value="async" label="Async" param="type" />
          <span className="opacity-30">|</span>
          <FilterLink current={sp.result} value={undefined} label="Все" param="result" />
          <FilterLink current={sp.result} value="win" label="Победы" param="result" />
          <FilterLink current={sp.result} value="loss" label="Поражения" param="result" />
        </div>

        {filtered.length === 0 ? (
          <p className="opacity-60 text-center py-12">Пока пусто. Сыграй партию!</p>
        ) : (
          <ul className="divide-y divide-[var(--muted)]/20 rounded-xl border border-[var(--muted)]/20">
            {filtered.map((g) => {
              const myColor = g.player_white === user.id ? "white" : "black";
              const result =
                g.status !== "finished"
                  ? "в процессе"
                  : g.winner_color === myColor
                    ? `победа${g.win_type !== "normal" ? ` (${g.win_type})` : ""}`
                    : `поражение${g.win_type !== "normal" ? ` (${g.win_type})` : ""}`;
              return (
                <li key={g.id} className="p-3 flex items-center justify-between gap-3">
                  <Link
                    href={`/games/${g.id}/replay`}
                    className="flex-1 hover:opacity-80"
                  >
                    <div className="font-medium">
                      {g.type} · {result}
                    </div>
                    <div className="text-xs opacity-60">
                      {new Date(g.created_at).toLocaleString("ru")}
                    </div>
                  </Link>
                  <Link
                    href={`/games/${g.id}/analysis`}
                    className="text-xs px-2 py-1 rounded bg-[var(--accent)]/20 hover:bg-[var(--accent)]/40"
                  >
                    Разбор
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </>
  );
}

function FilterLink({
  current,
  value,
  label,
  param,
}: {
  current: string | undefined;
  value: string | undefined;
  label: string;
  param: string;
}) {
  const href = value ? `?${param}=${value}` : `?`;
  const active = current === value;
  return (
    <Link
      href={href}
      className={`px-2 py-1 rounded ${
        active ? "bg-[var(--accent)] text-black" : "opacity-60 hover:opacity-100"
      }`}
    >
      {label}
    </Link>
  );
}
