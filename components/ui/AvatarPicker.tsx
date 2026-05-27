"use client";
import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { AVATAR_PRESETS } from "@/lib/avatar-presets";
import { cn } from "@/lib/utils/cn";

export function AvatarPicker({
  value,
  onChange,
  isPro,
  fallbackLabel,
}: {
  value: string;
  onChange: (src: string) => void;
  isPro: boolean;
  fallbackLabel?: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <Avatar src={value || null} fallback={fallbackLabel || "?"} size="xl" />
        <p className="text-xs opacity-60 flex-1">
          Выбери из списка ниже.{" "}
          {!isPro && (
            <>
              Аватары с <span className="text-[var(--accent)]">PRO</span> доступны после{" "}
              <Link href="/pricing" className="underline">
                подписки
              </Link>
              .
            </>
          )}
        </p>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {AVATAR_PRESETS.map((p) => {
          const locked = !!p.pro && !isPro;
          const selected = value === p.src;
          return (
            <button
              type="button"
              key={p.src}
              onClick={() => !locked && onChange(p.src)}
              title={locked ? `${p.label} — только для Pro` : p.label}
              aria-disabled={locked}
              className={cn(
                "relative p-1 rounded-lg",
                selected
                  ? "border-2 border-[var(--accent)] bg-[var(--accent)]/10"
                  : "border border-[var(--muted)]/30 hover:border-[var(--accent)]",
                locked && "cursor-not-allowed",
              )}
            >
              <Avatar src={p.src} fallback={p.label[0]} size="md" />
              {locked && (
                <span className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/55 text-[10px] font-bold tracking-wide">
                  🔒 PRO
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
