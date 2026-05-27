import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/Header";
import { isSupabaseConfigured } from "@/lib/env";
import type { Profile } from "@/lib/supabase/types";

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  if (!isSupabaseConfigured()) {
    return (
      <>
        <Header />
        <main className="p-8 text-center opacity-70">Профиль недоступен (Supabase не настроен).</main>
      </>
    );
  }

  const sb = await createClient();
  const { data: profile } = await sb
    .from("profiles")
    .select("username, avatar_url, city, country, elo, games_played, wins, is_pro, created_at")
    .eq("username", username)
    .single<Profile>();

  if (!profile) notFound();

  const winRate =
    profile.games_played > 0
      ? Math.round((profile.wins / profile.games_played) * 100)
      : 0;

  return (
    <>
      <Header />
      <main className="max-w-2xl mx-auto p-6 space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-[var(--muted)]/30 flex items-center justify-center text-3xl font-display">
            {profile.username[0].toUpperCase()}
          </div>
          <div>
            <h1 className="font-display text-3xl flex items-center gap-2">
              {profile.username}
              {profile.is_pro && (
                <span className="text-xs px-2 py-0.5 rounded bg-[var(--accent)] text-black">
                  PRO
                </span>
              )}
            </h1>
            <p className="opacity-70 text-sm">
              {profile.city ?? "—"}
              {profile.country ? `, ${profile.country}` : ""}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-3">
          <Stat label="ELO" value={profile.elo} />
          <Stat label="Партий" value={profile.games_played} />
          <Stat label="Побед" value={profile.wins} />
          <Stat label="Win rate" value={`${winRate}%`} />
        </div>
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
