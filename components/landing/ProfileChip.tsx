"use client";
import { useSyncExternalStore } from "react";
import Link from "next/link";
import { getGuestName, subscribeGuestName } from "@/lib/guest";

export function ProfileChip({ username }: { username: string | null }) {
  const guestName = useSyncExternalStore(
    subscribeGuestName,
    () => getGuestName(),
    () => null,
  );

  if (username) {
    return (
      <Link
        href="/me"
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--muted)]/20 hover:bg-[var(--muted)]/40 transition"
      >
        <span className="w-7 h-7 rounded-full bg-[var(--accent)] text-black font-bold flex items-center justify-center text-sm">
          {username[0].toUpperCase()}
        </span>
        <span className="text-sm font-medium">{username}</span>
      </Link>
    );
  }

  if (guestName) {
    return (
      <div className="flex items-center gap-2">
        <span className="px-3 py-1.5 rounded-full bg-[var(--muted)]/20 text-sm">
          Гость: <span className="font-medium">{guestName}</span>
        </span>
        <Link
          href="/sign-in"
          className="text-xs px-3 py-1.5 rounded-full bg-[var(--accent)] text-black font-medium"
        >
          Войти
        </Link>
      </div>
    );
  }

  return null;
}
