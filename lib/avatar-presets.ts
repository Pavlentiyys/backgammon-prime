export type AvatarPreset = { src: string; label: string; pro?: boolean };

export const AVATAR_PRESETS: AvatarPreset[] = [
  { src: "/avatars/you-male.png", label: "Парень" },
  { src: "/avatars/you-female.png", label: "Девушка" },
  { src: "/avatars/player-left.png", label: "Игрок (борода)" },
  { src: "/avatars/player-right.png", label: "Игрок" },
  { src: "/avatars/ded.png", label: "Дед" },
  { src: "/avatars/vnuk.png", label: "Мальчик" },
  { src: "/avatars/sultan.png", label: "Султан", pro: true },
  { src: "/avatars/bot.png", label: "Робот" },
];

export function isAvatarLocked(src: string, isPro: boolean): boolean {
  const preset = AVATAR_PRESETS.find((p) => p.src === src);
  return !!preset?.pro && !isPro;
}
