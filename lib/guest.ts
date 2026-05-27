const NAME_KEY = "Backgammon Prime-guest-name";
const ID_KEY = "Backgammon Prime-guest-id";
const GENDER_KEY = "Backgammon Prime-guest-gender";

export type Gender = "male" | "female" | "unspecified";

export function getGuestName(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(NAME_KEY);
}

export function setGuestName(name: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(NAME_KEY, name.trim());
  window.dispatchEvent(new StorageEvent("storage", { key: NAME_KEY }));
}

export function clearGuest(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(NAME_KEY);
  localStorage.removeItem(ID_KEY);
  window.dispatchEvent(new StorageEvent("storage", { key: NAME_KEY }));
}

export function getGuestId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(ID_KEY, id);
  }
  return id;
}

export function subscribeGuestName(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = (e: StorageEvent) => {
    if (e.key === NAME_KEY || e.key === null) cb();
  };
  window.addEventListener("storage", handler);
  return () => window.removeEventListener("storage", handler);
}

export function getGuestGender(): Gender {
  if (typeof window === "undefined") return "unspecified";
  const v = localStorage.getItem(GENDER_KEY);
  return v === "male" || v === "female" ? v : "unspecified";
}

export function setGuestGender(g: Gender): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(GENDER_KEY, g);
  window.dispatchEvent(new StorageEvent("storage", { key: GENDER_KEY }));
}

export function subscribeGuestGender(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = (e: StorageEvent) => {
    if (e.key === GENDER_KEY || e.key === null) cb();
  };
  window.addEventListener("storage", handler);
  return () => window.removeEventListener("storage", handler);
}
