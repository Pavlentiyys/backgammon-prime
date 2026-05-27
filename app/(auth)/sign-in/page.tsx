"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/env";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!isSupabaseConfigured()) {
      setError("Supabase не настроен. Подложи ключи в .env.local.");
      return;
    }
    setLoading(true);
    const sb = createClient();
    const { error } = await sb.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) setError(error.message);
    else router.push("/me");
  };

  const onGoogle = async () => {
    if (!isSupabaseConfigured()) {
      setError("Supabase не настроен.");
      return;
    }
    const sb = createClient();
    await sb.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${location.origin}/auth/callback` },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        <h1 className="font-display text-3xl text-center">Вход</h1>
        <form onSubmit={onSubmit} className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="w-full px-3 py-2 rounded-md bg-[var(--muted)]/20 border border-[var(--muted)]/40"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Пароль"
            required
            className="w-full px-3 py-2 rounded-md bg-[var(--muted)]/20 border border-[var(--muted)]/40"
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-md bg-[var(--accent)] text-black font-medium disabled:opacity-50"
          >
            {loading ? "Входим..." : "Войти"}
          </button>
        </form>
        <p className="text-sm text-center opacity-70">
          Нет аккаунта?{" "}
          <Link href="/sign-up" className="text-[var(--accent)] hover:underline">
            Регистрация
          </Link>
        </p>
        <p className="text-xs text-center opacity-50">
          <Link href="/play/hotseat">Играть как гость →</Link>
        </p>
      </div>
    </div>
  );
}
