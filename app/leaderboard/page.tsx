import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/Header";
import { isSupabaseConfigured } from "@/lib/env";
import { Avatar } from "@/components/ui/Avatar";
import { KZ_CITIES, isKzCity } from "@/lib/cities";

type Search = { scope?: "global" | "city"; city?: string };

type Row = {
  username: string;
  avatar_url: string | null;
  elo: number;
  city: string | null;
  games_played: number;
  wins: number;
  is_bot: boolean;
};

export default async function LeaderboardPage({
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
  const scope = sp.scope === "city" ? "city" : "global";
  const selectedCity = isKzCity(sp.city) ? sp.city : null;
  const sb = await createClient();

  let q = sb
    .from("profiles")
    .select("username, avatar_url, elo, city, games_played, wins, is_bot")
    .order("elo", { ascending: false })
    .limit(100);

  if (scope === "city" && selectedCity) q = q.eq("city", selectedCity);

  const { data } = await q;
  const rows = (data ?? []) as Row[];

  return (
    <>
      <Header />
      <main className="max-w-3xl mx-auto p-6 space-y-4">
        <h1 className="font-display text-3xl">Лидерборд</h1>

        <div className="flex gap-2 text-sm flex-wrap">
          <Tab href="/leaderboard" active={scope === "global"} label="Глобальный" />
          <Tab href="/leaderboard?scope=city" active={scope === "city"} label="По городам" />
        </div>

        {scope === "city" && (
          <div className="flex gap-2 flex-wrap text-xs">
            {KZ_CITIES.map((c) => (
              <Link
                key={c}
                href={`/leaderboard?scope=city&city=${encodeURIComponent(c)}`}
                className={
                  selectedCity === c
                    ? "px-2 py-1 rounded bg-[var(--accent)] text-black font-medium"
                    : "px-2 py-1 rounded bg-[var(--muted)]/20 hover:bg-[var(--muted)]/40"
                }
              >
                {c}
              </Link>
            ))}
          </div>
        )}

        <ol className="space-y-1">
          {rows.length === 0 && (
            <li className="opacity-60 text-center py-12">
              {scope === "city" && selectedCity
                ? `В городе «${selectedCity}» пока нет игроков.`
                : "Пока пусто."}
            </li>
          )}
          {rows.map((r, i) => (
            <li
              key={r.username}
              className="flex items-center gap-3 p-2 rounded bg-[var(--muted)]/10"
            >
              <span className="w-8 text-right font-display opacity-70">{i + 1}</span>
              <Avatar src={r.avatar_url} fallback={r.username} size="md" />
              {r.is_bot ? (
                <span className="flex-1 font-medium flex items-center gap-2">
                  {r.username}
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--muted)]/40 opacity-70 uppercase">
                    bot
                  </span>
                </span>
              ) : (
                <Link
                  href={`/profile/${r.username}`}
                  className="flex-1 font-medium hover:underline"
                >
                  {r.username}
                </Link>
              )}
              <span className="text-xs opacity-60 hidden sm:inline">{r.city ?? ""}</span>
              <span className="font-display text-lg w-16 text-right">{r.elo}</span>
            </li>
          ))}
        </ol>
      </main>
    </>
  );
}

function Tab({ href, active, label }: { href: string; active: boolean; label: string }) {
  return (
    <Link
      href={href}
      className={
        active
          ? "px-3 py-1 rounded bg-[var(--accent)] text-black font-medium"
          : "px-3 py-1 rounded opacity-60 hover:opacity-100"
      }
    >
      {label}
    </Link>
  );
}
