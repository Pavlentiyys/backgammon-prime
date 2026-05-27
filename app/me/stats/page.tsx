import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/Header";
import { isSupabaseConfigured } from "@/lib/env";

type GameSummary = {
  id: string;
  type: string;
  status: string;
  winner_color: "white" | "black" | null;
  win_type: "normal" | "mars" | "koks" | null;
  player_white: string | null;
  player_black: string | null;
  created_at: string;
  finished_at: string | null;
};

export default async function StatsPage() {
  if (!isSupabaseConfigured()) {
    return (
      <>
        <Header />
        <main className="p-8 text-center opacity-70">Supabase не настроен.</main>
      </>
    );
  }

  const sb = await createClient();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) redirect("/sign-in");

  const { data: games } = await sb
    .from("games")
    .select(
      "id, type, status, winner_color, win_type, player_white, player_black, created_at, finished_at",
    )
    .or(`player_white.eq.${user.id},player_black.eq.${user.id}`)
    .eq("status", "finished")
    .order("created_at", { ascending: false })
    .limit(500);

  const list = (games ?? []) as GameSummary[];
  const total = list.length;
  let wins = 0;
  let marsWins = 0;
  let koksWins = 0;
  let durationsMs = 0;
  let durationsCount = 0;
  let streak = 0;
  const byType: Record<string, { played: number; wins: number }> = {};

  for (const g of list) {
    const myColor = g.player_white === user.id ? "white" : "black";
    const won = g.winner_color === myColor;
    if (won) wins += 1;
    if (won && g.win_type === "mars") marsWins += 1;
    if (won && g.win_type === "koks") koksWins += 1;
    byType[g.type] ??= { played: 0, wins: 0 };
    byType[g.type].played += 1;
    if (won) byType[g.type].wins += 1;
    if (g.finished_at) {
      durationsMs += new Date(g.finished_at).getTime() - new Date(g.created_at).getTime();
      durationsCount += 1;
    }
  }
  for (const g of list) {
    const myColor = g.player_white === user.id ? "white" : "black";
    if (g.winner_color === myColor) streak += 1;
    else break;
  }

  const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;
  const avgMinutes =
    durationsCount > 0 ? Math.round(durationsMs / durationsCount / 60000) : 0;

  return (
    <>
      <Header />
      <main className="max-w-3xl mx-auto p-6 space-y-6">
        <h1 className="font-display text-3xl">Статистика</h1>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Stat label="Партий" value={total} />
          <Stat label="Побед" value={wins} />
          <Stat label="Win rate" value={`${winRate}%`} />
          <Stat label="Streak" value={streak} />
          <Stat label="Марс" value={marsWins} />
          <Stat label="Кокс" value={koksWins} />
          <Stat label="Средняя длительность" value={`${avgMinutes} мин`} />
        </div>

        <section className="space-y-2">
          <h2 className="font-display text-xl">По соперникам</h2>
          <div className="space-y-1">
            {Object.entries(byType).map(([k, v]) => (
              <div key={k} className="flex justify-between p-2 rounded bg-[var(--muted)]/10">
                <span>{k}</span>
                <span className="opacity-70">
                  {v.wins}/{v.played} ({Math.round((v.wins / v.played) * 100)}%)
                </span>
              </div>
            ))}
            {Object.keys(byType).length === 0 && (
              <p className="opacity-60 text-sm">Нет данных</p>
            )}
          </div>
        </section>
      </main>
    </>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="p-3 rounded-xl border border-[var(--muted)]/30 bg-[var(--muted)]/10 text-center">
      <div className="text-xl font-display">{value}</div>
      <div className="text-xs opacity-60">{label}</div>
    </div>
  );
}
