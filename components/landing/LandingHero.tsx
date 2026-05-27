"use client";
import { useState } from "react";

export function LandingHero() {
  const [imgFailed, setImgFailed] = useState(false);
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[var(--board-bg)]"
    >
      {!imgFailed && (
        <img
          src="/landing/hero.png"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          onError={() => setImgFailed(true)}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)] via-[var(--background)]/70 to-[var(--background)]/30" />
      <div className="absolute inset-0 bg-gradient-to-r from-[var(--background)]/80 via-transparent to-[var(--background)]/40" />
    </div>
  );
}
