export const KZ_CITIES = [
  "Алматы",
  "Астана",
  "Шымкент",
  "Караганда",
  "Актобе",
  "Тараз",
  "Павлодар",
  "Усть-Каменогорск",
  "Семей",
  "Атырау",
  "Кызылорда",
  "Костанай",
  "Уральск",
  "Петропавловск",
  "Актау",
  "Темиртау",
  "Туркестан",
  "Кокшетау",
  "Талдыкорган",
  "Экибастуз",
] as const;

export const COUNTRY_DEFAULT = "Казахстан";

export type KzCity = (typeof KZ_CITIES)[number];

export function isKzCity(s: string | null | undefined): s is KzCity {
  return !!s && (KZ_CITIES as readonly string[]).includes(s);
}
