"use client";
import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  getGuestName,
  setGuestName,
  setGuestGender,
  subscribeGuestName,
  type Gender,
} from "@/lib/guest";

export function IdentityGate({ hasSession }: { hasSession: boolean }) {
  const router = useRouter();
  const guestName = useSyncExternalStore(
    subscribeGuestName,
    () => getGuestName(),
    () => null,
  );

  const [guestMode, setGuestMode] = useState(false);
  const [name, setName] = useState("");
  const [gender, setGender] = useState<Gender>("unspecified");
  const [error, setError] = useState<string | null>(null);

  if (hasSession || guestName) return null;

  const onGuestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      setError("Имя слишком короткое");
      return;
    }
    setGuestGender(gender);
    setGuestName(trimmed);
    router.refresh();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[var(--background)] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6 text-center">
        <h1 className="font-display text-5xl">Backgammon Prime</h1>
        <p className="opacity-70">Длинные нарды. Как продолжим?</p>

        {!guestMode ? (
          <div className="flex flex-col gap-3">
            <button
              onClick={() => setGuestMode(true)}
              className="px-6 py-3 rounded-xl bg-[var(--accent)] text-black font-semibold"
            >
              Играть как гость
            </button>
            <Link
              href="/sign-in"
              className="px-6 py-3 rounded-xl border border-[var(--muted)]/40 font-medium hover:bg-[var(--muted)]/10"
            >
              Войти
            </Link>
            <Link
              href="/sign-up"
              className="px-6 py-3 rounded-xl border border-[var(--muted)]/40 font-medium hover:bg-[var(--muted)]/10"
            >
              Регистрация
            </Link>
            <p className="text-xs opacity-50 pt-2">
              Гость — твоё имя сохранится в браузере. История партий и AI-разбор доступны после регистрации.
            </p>
          </div>
        ) : (
          <form onSubmit={onGuestSubmit} className="flex flex-col gap-3">
            <label className="block text-left text-sm opacity-70">Как тебя зовут?</label>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Имя или ник"
              className="w-full px-4 py-3 rounded-xl bg-[var(--muted)]/20 border border-[var(--muted)]/40 text-lg"
            />
            <div className="flex gap-2">
              {(["male", "female", "unspecified"] as Gender[]).map((g) => (
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
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-[var(--accent)] text-black font-semibold"
            >
              Играть
            </button>
            <button
              type="button"
              onClick={() => setGuestMode(false)}
              className="text-sm opacity-60 hover:opacity-100"
            >
              ← Назад
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
