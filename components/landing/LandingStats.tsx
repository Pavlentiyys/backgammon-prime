import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";

type TopPlayer = { username: string; elo: number; avatar_url: string | null };

async function loadStats(): Promise<{
  players: number;
  games: number;
  finishedToday: number;
  top: TopPlayer | null;
}> {
  if (!isSupabaseConfigured()) {
    return { players: 0, games: 0, finishedToday: 0, top: null };
  }
  const sb = await createClient();
  const todayIso = new Date(new Date().setUTCHours(0, 0, 0, 0)).toISOString();
  const [
    { count: players },
    { count: games },
    { count: finishedToday },
    { data: topRows },
  ] = await Promise.all([
    sb.from("profiles").select("*", { count: "exact", head: true }).eq("is_bot", false),
    sb.from("games").select("*", { count: "exact", head: true }),
    sb
      .from("games")
      .select("*", { count: "exact", head: true })
      .eq("status", "finished")
      .gte("finished_at", todayIso),
    sb
      .from("profiles")
      .select("username, elo, avatar_url")
      .eq("is_bot", false)
      .order("elo", { ascending: false })
      .limit(1),
  ]);
  return {
    players: players ?? 0,
    games: games ?? 0,
    finishedToday: finishedToday ?? 0,
    top: (topRows?.[0] as TopPlayer | undefined) ?? null,
  };
}

export async function LandingStats() {
  const stats = await loadStats();
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
      <Stat label="Игроков" value={stats.players} />
      <Stat label="Партий всего" value={stats.games} />
      <Stat label="Сыграно сегодня" value={stats.finishedToday} highlight={stats.finishedToday > 0} />
      <Stat
        label="Лидер"
        value={stats.top?.username ?? "—"}
        sub={stats.top ? `ELO ${stats.top.elo}` : ""}
      />
    </div>
  );
}

function Stat({
  label,
  value,
  sub,
  highlight,
}: {
  label: string;
  value: number | string;
  sub?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`p-3 rounded-xl border backdrop-blur-sm ${
        highlight
          ? "border-[var(--accent)]/40 bg-[var(--accent)]/10"
          : "border-[var(--muted)]/30 bg-[var(--muted)]/10"
      }`}
    >
      <div className="text-lg sm:text-xl font-display truncate">{value}</div>
      <div className="text-xs opacity-60 uppercase tracking-wide truncate">{label}</div>
      {sub && <div className="text-[10px] opacity-50 mt-0.5">{sub}</div>}
    </div>
  );
}
