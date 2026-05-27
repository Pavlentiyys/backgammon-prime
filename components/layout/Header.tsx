import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { LocaleSwitcher } from "@/components/ui/LocaleSwitcher";
import { isSupabaseConfigured } from "@/lib/env";
import { getServerMessages } from "@/lib/i18n/server";

export async function Header() {
  const { locale, t } = await getServerMessages();
  let username: string | null = null;
  if (isSupabaseConfigured()) {
    try {
      const sb = await createClient();
      const {
        data: { user },
      } = await sb.auth.getUser();
      if (user) {
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
    <header className="px-6 py-3 flex items-center justify-between border-b border-[var(--muted)]/30">
      <Link href="/" className="font-display text-2xl">
        Backgammon Prime
      </Link>
      <nav className="flex items-center gap-3 text-sm">
        <Link href="/play/bot" className="opacity-80 hover:opacity-100">
          {t.nav.play}
        </Link>
        <Link href="/leaderboard" className="opacity-80 hover:opacity-100">
          {t.nav.leaderboard}
        </Link>
        <LocaleSwitcher current={locale} />
        <ThemeToggle />
        {username ? (
          <Link
            href="/me"
            className="px-3 py-1 rounded-md bg-[var(--muted)]/20 hover:bg-[var(--muted)]/40"
          >
            {username}
          </Link>
        ) : (
          <Link
            href="/sign-in"
            className="px-3 py-1 rounded-md bg-[var(--accent)] text-black font-medium"
          >
            {t.nav.sign_in}
          </Link>
        )}
      </nav>
    </header>
  );
}
