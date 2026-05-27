"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/env";
import { AvatarPicker } from "@/components/ui/AvatarPicker";
import { AVATAR_PRESETS } from "@/lib/avatar-presets";
import { KZ_CITIES, COUNTRY_DEFAULT } from "@/lib/cities";

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "unspecified">("unspecified");
  const [city, setCity] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string>(AVATAR_PRESETS[0].src);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    if (!isSupabaseConfigured()) {
      setError("Supabase не настроен. Подложи ключи в .env.local.");
      return;
    }
    setLoading(true);
    const sb = createClient();
    const { error } = await sb.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          gender,
          city: city || null,
          country: city ? COUNTRY_DEFAULT : null,
          avatar_url: avatarUrl,
        },
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    });
    setLoading(false);
    if (error) setError(error.message);
    else {
      setInfo("Проверь почту для подтверждения. Затем можно войти.");
      setTimeout(() => router.push("/sign-in"), 2000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        <h1 className="font-display text-3xl text-center">Регистрация</h1>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <span className="text-xs opacity-70">Аватар</span>
            <AvatarPicker
              value={avatarUrl}
              onChange={setAvatarUrl}
              isPro={false}
              fallbackLabel={username}
            />
          </div>

          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Ник"
            required
            minLength={3}
            className="w-full px-3 py-2 rounded-md bg-[var(--muted)]/20 border border-[var(--muted)]/40"
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="w-full px-3 py-2 rounded-md bg-[var(--muted)]/20 border border-[var(--muted)]/40"
          />

          <div className="space-y-1">
            <span className="text-xs opacity-70">Пол</span>
            <div className="flex gap-2">
              {(["male", "female", "unspecified"] as const).map((g) => (
                <button
                  type="button"
                  key={g}
                  onClick={() => setGender(g)}
                  className={
                    gender === g
                      ? "flex-1 py-2 rounded-md border-2 border-[var(--accent)] bg-[var(--accent)]/10 text-sm"
                      : "flex-1 py-2 rounded-md border border-[var(--muted)]/40 text-sm opacity-70"
                  }
                >
                  {g === "male" ? "Мужской" : g === "female" ? "Женский" : "Не указывать"}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-xs opacity-70">Город (Казахстан)</span>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full px-3 py-2 rounded-md bg-[var(--muted)]/20 border border-[var(--muted)]/40"
            >
              <option value="">— не указывать —</option>
              {KZ_CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Пароль (мин. 6 символов)"
            required
            minLength={6}
            className="w-full px-3 py-2 rounded-md bg-[var(--muted)]/20 border border-[var(--muted)]/40"
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          {info && <p className="text-emerald-400 text-sm">{info}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-md bg-[var(--accent)] text-black font-medium disabled:opacity-50"
          >
            {loading ? "Создаём..." : "Зарегистрироваться"}
          </button>
        </form>
        <p className="text-sm text-center opacity-70">
          Уже есть аккаунт?{" "}
          <Link href="/sign-in" className="text-[var(--accent)] hover:underline">
            Войти
          </Link>
        </p>
      </div>
    </div>
  );
}
