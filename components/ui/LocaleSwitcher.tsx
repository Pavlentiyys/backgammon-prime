"use client";
import { LOCALES, LOCALE_NAMES, LOCALE_COOKIE, type Locale } from "@/lib/i18n";

export function LocaleSwitcher({ current }: { current: Locale }) {
  const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    document.cookie = `${LOCALE_COOKIE}=${e.target.value}; path=/; max-age=31536000`;
    window.location.reload();
  };
  return (
    <select
      defaultValue={current}
      onChange={onChange}
      aria-label="Язык"
      className="bg-transparent border border-[var(--muted)]/40 rounded px-2 py-1 text-xs"
    >
      {LOCALES.map((l) => (
        <option key={l} value={l} className="bg-[var(--background)]">
          {LOCALE_NAMES[l]}
        </option>
      ))}
    </select>
  );
}
