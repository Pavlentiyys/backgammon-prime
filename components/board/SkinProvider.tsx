"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { SKINS, SKIN_STORAGE_KEY, SkinId, getSkin } from "@/lib/skins";

type Ctx = { skin: SkinId; setSkin: (s: SkinId) => void };
const SkinCtx = createContext<Ctx>({ skin: "classic", setSkin: () => {} });

export function SkinProvider({ children }: { children: React.ReactNode }) {
  const [skin, setSkinState] = useState<SkinId>(() => {
    if (typeof window === "undefined") return "classic";
    const saved = localStorage.getItem(SKIN_STORAGE_KEY) as SkinId | null;
    return saved && SKINS.some((s) => s.id === saved) ? saved : "classic";
  });

  useEffect(() => {
    const s = getSkin(skin);
    const root = document.documentElement;
    for (const [k, v] of Object.entries(s.vars)) root.style.setProperty(k, v);
    return () => {
      for (const k of Object.keys(s.vars)) root.style.removeProperty(k);
    };
  }, [skin]);

  const setSkin = (s: SkinId) => {
    setSkinState(s);
    localStorage.setItem(SKIN_STORAGE_KEY, s);
  };

  return <SkinCtx.Provider value={{ skin, setSkin }}>{children}</SkinCtx.Provider>;
}

export function useSkin() {
  return useContext(SkinCtx);
}
