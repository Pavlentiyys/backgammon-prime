"use client";
import { useSyncExternalStore, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/env";
import { getGuestGender, subscribeGuestGender, type Gender } from "@/lib/guest";

export function youAvatarSrc(gender: Gender | string | null | undefined): string {
  if (gender === "female") return "/avatars/you-female.png";
  return "/avatars/you-male.png";
}

export function useYouAvatar(): string {
  const guestGender = useSyncExternalStore(
    subscribeGuestGender,
    () => getGuestGender(),
    () => "unspecified" as Gender,
  );
  const [authGender, setAuthGender] = useState<Gender | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    let cancelled = false;
    (async () => {
      const sb = createClient();
      const {
        data: { user },
      } = await sb.auth.getUser();
      if (!user || cancelled) return;
      const { data } = await sb
        .from("profiles")
        .select("gender")
        .eq("id", user.id)
        .single();
      if (cancelled) return;
      const g = (data?.gender as string | null) ?? null;
      setAuthGender(g === "male" || g === "female" ? g : "unspecified");
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return youAvatarSrc(authGender ?? guestGender);
}
