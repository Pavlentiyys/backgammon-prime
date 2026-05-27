"use client";
import { useState } from "react";
import { cn } from "@/lib/utils/cn";

type Size = "sm" | "md" | "lg" | "xl";

const SIZE_CLS: Record<Size, string> = {
  sm: "w-8 h-8 text-sm",
  md: "w-12 h-12 text-lg",
  lg: "w-16 h-16 text-2xl",
  xl: "w-24 h-24 text-4xl",
};

export function Avatar({
  src,
  fallback,
  size = "md",
  className,
  ring,
}: {
  src?: string | null;
  fallback: string;
  size?: Size;
  className?: string;
  ring?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const showImage = !!src && !failed;

  return (
    <div
      className={cn(
        "relative rounded-full overflow-hidden bg-[var(--muted)]/30 flex items-center justify-center shrink-0",
        SIZE_CLS[size],
        ring && "ring-2 ring-[var(--accent)] ring-offset-2 ring-offset-[var(--background)]",
        className,
      )}
    >
      <span className="absolute inset-0 flex items-center justify-center font-display select-none">
        {fallback.slice(0, 1).toUpperCase()}
      </span>
      {showImage && (
        <img
          src={src!}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}
