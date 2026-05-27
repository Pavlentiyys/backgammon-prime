"use client";
import Link from "next/link";
import { SKINS } from "@/lib/skins";
import { useSkin } from "./SkinProvider";
import { cn } from "@/lib/utils/cn";

export function SkinPicker({ isPro }: { isPro: boolean }) {
  const { skin, setSkin } = useSkin();
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {SKINS.map((s) => {
        const locked = s.pro && !isPro;
        const active = s.id === skin;
        return (
          <button
            key={s.id}
            disabled={locked}
            onClick={() => setSkin(s.id)}
            className={cn(
              "p-3 rounded-xl border text-left transition relative",
              active
                ? "border-[var(--accent)] ring-2 ring-[var(--accent)]"
                : "border-[var(--muted)]/30 hover:border-[var(--muted)]",
              locked && "opacity-60",
            )}
          >
            <div
              className="h-12 rounded-md mb-2 flex"
              style={{ background: s.vars["--board-bg"], borderColor: s.vars["--board-frame"] }}
            >
              <div className="flex-1" style={{ background: s.vars["--point-light"] }} />
              <div className="flex-1" style={{ background: s.vars["--point-dark"] }} />
              <div className="flex-1" style={{ background: s.vars["--point-light"] }} />
              <div className="flex-1" style={{ background: s.vars["--point-dark"] }} />
            </div>
            <div className="font-medium text-sm">{s.name}</div>
            <div className="text-xs opacity-60">{s.description}</div>
            {locked && (
              <Link
                href="/pricing"
                className="absolute inset-0 flex items-center justify-center text-xs font-medium bg-black/40 rounded-xl"
                onClick={(e) => e.stopPropagation()}
              >
                🔒 PRO
              </Link>
            )}
          </button>
        );
      })}
    </div>
  );
}
