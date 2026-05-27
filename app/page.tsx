import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import { getServerMessages } from "@/lib/i18n/server";
import { LandingHero } from "@/components/landing/LandingHero";
import { ProfileChip } from "@/components/landing/ProfileChip";
import { IdentityGate } from "@/components/auth/IdentityGate";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { LocaleSwitcher } from "@/components/ui/LocaleSwitcher";
import { LandingStats } from "@/components/landing/LandingStats";

export default async function HomePage() {
  const { locale, t } = await getServerMessages();
  let username: string | null = null;
  let hasSession = false;
  if (isSupabaseConfigured()) {
    try {
      const sb = await createClient();
      const {
        data: { user },
      } = await sb.auth.getUser();
      if (user) {
        hasSession = true;
        const { data } = await sb
          .from("profiles")
          .select("username")
          .eq("id", user.id)
          .single();
        username = (data?.username as string | undefined) ?? null;
      }
    } catch {
      /* env not ready */
    }
  }

  return (
    <>
      <IdentityGate hasSession={hasSession} />
      <LandingHero />
      <div className="min-h-screen flex flex-col relative z-10">
        <header className="px-6 py-4 flex items-center justify-between">
          <Link href="/" className="font-display text-2xl drop-shadow-md">
            Backgammon Prime
          </Link>
          <div className="flex items-center gap-3">
            <LocaleSwitcher current={locale} />
            <ThemeToggle />
            <ProfileChip username={username} />
          </div>
        </header>

        <main className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_minmax(280px,360px)] gap-6 px-6 pb-10">
          <section className="flex flex-col justify-center gap-6 max-w-2xl">
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl leading-tight drop-shadow-lg">
              {t.site.tagline.split(".").slice(0, -1).join(".")}.{" "}
              <span className="text-[var(--accent)]">
                {t.site.tagline.split(".").slice(-2, -1)[0]}.
              </span>
            </h1>
            <p className="text-lg sm:text-xl opacity-90 max-w-xl drop-shadow-md">
              {t.site.subtitle}
            </p>
          </section>

          <section className="flex flex-col gap-3 self-center w-full">
            <Link
              href="/play/local"
              className="px-6 py-4 rounded-xl bg-[var(--accent)] text-black font-semibold text-lg shadow-2xl hover:brightness-110 transition text-center"
            >
              {t.site.cta_bot}
            </Link>
            <Link
              href="/play/new"
              className="px-6 py-4 rounded-xl border-2 border-[var(--accent)] bg-[var(--background)]/60 backdrop-blur text-[var(--accent)] font-semibold text-lg hover:bg-[var(--accent)]/10 transition text-center"
            >
              {t.site.cta_room}
            </Link>
            <Link
              href="/leaderboard"
              className="px-6 py-4 rounded-xl border border-[var(--muted)]/40 bg-[var(--background)]/50 backdrop-blur font-medium hover:bg-[var(--muted)]/30 transition text-center"
            >
              {t.nav.leaderboard}
            </Link>
            <LandingStats />
          </section>
        </main>
      </div>
    </>
  );
}
