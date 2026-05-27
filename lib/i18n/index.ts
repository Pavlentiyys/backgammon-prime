import ru from "@/messages/ru.json";
import en from "@/messages/en.json";
import tr from "@/messages/tr.json";
import az from "@/messages/az.json";

export const LOCALES = ["ru", "en", "tr", "az"] as const;
export type Locale = (typeof LOCALES)[number];
export const LOCALE_NAMES: Record<Locale, string> = {
  ru: "Русский",
  en: "English",
  tr: "Türkçe",
  az: "Azərbaycan",
};

const MESSAGES = { ru, en, tr, az } as const;

export function getMessages(locale: Locale) {
  return MESSAGES[locale];
}

export function isLocale(s: string | undefined | null): s is Locale {
  return !!s && (LOCALES as readonly string[]).includes(s);
}

export const LOCALE_COOKIE = "Backgammon Prime-locale";
