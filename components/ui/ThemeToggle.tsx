"use client";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Сменить тему"
      className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-[var(--muted)]/30 transition"
    >
      <span suppressHydrationWarning>{isDark ? "☀" : "☾"}</span>
    </button>
  );
}
