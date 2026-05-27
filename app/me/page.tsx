import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/Header";
import { isSupabaseConfigured } from "@/lib/env";
import { SkinPicker } from "@/components/board/SkinPicker";
import { LocaleSwitcher } from "@/components/ui/LocaleSwitcher";
import { getServerLocale } from "@/lib/i18n/server";
import { computeDaysStreak } from "@/lib/stats";
import type { Profile } from "@/lib/supabase/types";

type RecentGame = {
  id: string;
  type: string;
  status: string;
  winner_color: "white" | "black" | null;
  win_type: string | null;
  finished_at: string | null;
  player_white: string | null;
  player_black: string | null;
};

export default async function MePage() {
  if (!isSupabaseConfigured()) {
    return (
      <>
        <Header />
        <main className="p-8 text-center">
          <p>
            Supabase не настроен. Подложи ключи в <code>.env.local</code>.
          </p>
          <Link href="/" className="text-[var(--accent)] underline">
            ← На главную
          </Link>
        </main>
      </>
    );
  }

  const sb = await createClient();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) redirect("/sign-in?next=/me");

  const locale = await getServerLocale();

  const { data: profile } = await sb
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single<Profile>();

  const { data: finishedGames } = await sb
    .from("games")
    .select(
      "id, type, status, winner_color, win_type, finished_at, player_white, player_black",
    )
    .or(`player_white.eq.${user.id},player_black.eq.${user.id}`)
    .eq("status", "finished")
    .order("finished_at", { ascending: false })
    .limit(500);

  const all = (finishedGames ?? []) as RecentGame[];
  const wins = all.filter((g) => {
    const my = g.player_white === user.id ? "white" : "black";
    return g.winner_color === my;
  }).length;
  const winRate = all.length > 0 ? Math.round((wins / all.length) * 100) : 0;
  const streak = computeDaysStreak(
    all.map((g) => g.finished_at).filter((d): d is string => !!d),
  );

  const isPro =
    !!profile?.is_pro &&
    (!profile.pro_expires_at || new Date(profile.pro_expires_at) > new Date());

  const recent = all.slice(0, 5);

  return (
    <>
      <Header />
      <main className="max-w-2xl mx-auto p-6 space-y-8">
        <header className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-[var(--muted)]/30 flex items-center justify-center text-3xl font-display">
            {profile?.username?.[0]?.toUpperCase() ?? "?"}
          </div>
          <div className="flex-1">
            <h1 className="font-display text-3xl flex items-center gap-2">
              {profile?.username}
              {isPro && (
                <span className="text-xs px-2 py-0.5 rounded bg-[var(--accent)] text-black font-medium">
                  PRO
                </span>
              )}
            </h1>
            <p className="opacity-70 text-sm">
              {profile?.city ?? "—"}
              {profile?.country ? `, ${profile.country}` : ""}
            </p>
          </div>
        </header>

        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Stat label="ELO" value={profile?.elo ?? 1200} />
          <Stat label="Партий" value={all.length} />
          <Stat label="Побед" value={wins} />
          <Stat label="Win rate" value={`${winRate}%`} />
          <Stat label="Дней подряд" value={streak} highlight={streak > 0} />
        </section>

        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl">История</h2>
            <Link
              href="/me/games"
              className="text-xs opacity-70 hover:opacity-100"
            >
              Все партии →
            </Link>
          </div>
          {recent.length === 0 ? (
            <p className="opacity-60 text-sm">Пока партий нет.</p>
          ) : (
            <ul className="divide-y divide-[var(--muted)]/20 rounded-xl border border-[var(--muted)]/20">
              {recent.map((g) => {
                const myColor = g.player_white === user.id ? "white" : "black";
                const won = g.winner_color === myColor;
                return (
                  <li key={g.id}>
                    <Link
                      href={`/games/${g.id}/replay`}
                      className="flex items-center justify-between p-3 hover:bg-[var(--muted)]/10"
                    >
                      <span className="text-sm">
                        {g.type} ·{" "}
                        <span className={won ? "text-emerald-400" : "text-red-400"}>
                          {won ? "победа" : "поражение"}
                        </span>
                        {g.win_type && g.win_type !== "normal" && ` (${g.win_type})`}
                      </span>
                      <span className="text-xs opacity-50">
                        {g.finished_at
                          ? new Date(g.finished_at).toLocaleDateString("ru")
                          : ""}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-xl">Pro</h2>
          {isPro ? (
            <div className="p-4 rounded-xl border border-[var(--accent)]/50 bg-[var(--accent)]/5">
              <p className="font-medium">Активен</p>
              <p className="text-xs opacity-70">
                {profile?.pro_expires_at
                  ? `до ${new Date(profile.pro_expires_at).toLocaleDateString("ru")}`
                  : "бессрочно"}
              </p>
            </div>
          ) : (
            <Link
              href="/pricing"
              className="block p-4 rounded-xl border border-[var(--muted)]/30 hover:border-[var(--accent)] hover:bg-[var(--accent)]/5 transition"
            >
              <p className="font-medium">Подключить Pro</p>
              <p className="text-xs opacity-70">
                Безлимит AI-разборов, все скины, расширенная статистика.
              </p>
            </Link>
          )}
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-xl">Скин доски</h2>
          <SkinPicker isPro={isPro} />
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-xl">Язык интерфейса</h2>
          <LocaleSwitcher current={locale} />
        </section>

        <section className="flex flex-wrap gap-2 pt-4 border-t border-[var(--muted)]/20">
          <Link
            href="/me/edit"
            className="px-4 py-2 rounded-md bg-[var(--accent)] text-black font-medium"
          >
            Редактировать профиль
          </Link>
          <Link
            href="/me/stats"
            className="px-4 py-2 rounded-md bg-[var(--muted)]/30"
          >
            Подробная статистика
          </Link>
          <form action="/auth/sign-out" method="POST">
            <button
              type="submit"
              className="px-4 py-2 rounded-md border border-[var(--muted)]/40"
            >
              Выйти
            </button>
          </form>
        </section>
      </main>
    </>
  );
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: number | string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`p-4 rounded-xl border text-center ${
        highlight
          ? "border-[var(--accent)]/50 bg-[var(--accent)]/10"
          : "border-[var(--muted)]/30 bg-[var(--muted)]/10"
      }`}
    >
      <div className="text-2xl font-display">{value}</div>
      <div className="text-xs opacity-60 uppercase tracking-wide">{label}</div>
    </div>
  );
}
