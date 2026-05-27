import { cookies } from "next/headers";
import { LOCALE_COOKIE, getMessages, isLocale, type Locale } from "./index";

export async function getServerLocale(): Promise<Locale> {
  const c = await cookies();
  const v = c.get(LOCALE_COOKIE)?.value;
  return isLocale(v) ? v : "ru";
}

export async function getServerMessages() {
  const locale = await getServerLocale();
  return { locale, t: getMessages(locale) };
}
