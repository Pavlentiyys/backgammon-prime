"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/env";
import { AvatarPicker } from "@/components/ui/AvatarPicker";
import { isAvatarLocked } from "@/lib/avatar-presets";
import { KZ_CITIES, COUNTRY_DEFAULT } from "@/lib/cities";

export default function EditProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<{
    username: string;
    city: string;
    country: string;
    gender: "male" | "female" | "unspecified";
    avatar_url: string;
  }>({ username: "", city: "", country: "", gender: "unspecified", avatar_url: "" });
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!isSupabaseConfigured()) {
        if (!cancelled) {
          setError("Supabase не настроен.");
          setLoading(false);
        }
        return;
      }
      const sb = createClient();
      const {
        data: { user },
      } = await sb.auth.getUser();
      if (!user) {
        router.push("/sign-in");
        return;
      }
      const { data } = await sb
        .from("profiles")
        .select("username, city, country, gender, avatar_url, is_pro, pro_expires_at")
        .eq("id", user.id)
        .single();
      if (cancelled) return;
      if (data) {
        const g = data.gender as string | null;
        const pro =
          !!data.is_pro &&
          (!data.pro_expires_at || new Date(data.pro_expires_at as string) > new Date());
        setForm({
          username: (data.username as string) ?? "",
          city: (data.city as string) ?? "",
          country: (data.country as string) ?? "",
          gender: g === "male" || g === "female" ? g : "unspecified",
          avatar_url: (data.avatar_url as string) ?? "",
        });
        setIsPro(pro);
      }
      setLoading(false);
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isAvatarLocked(form.avatar_url, isPro)) {
      setError("Этот аватар доступен только для Pro.");
      return;
    }
    setSaving(true);
    setError(null);
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error ?? "Ошибка");
      return;
    }
    router.push("/me");
  };

  if (loading) return <main className="p-8 text-center opacity-60">Загрузка...</main>;

  return (
    <main className="max-w-md mx-auto p-6 space-y-4">
      <h1 className="font-display text-2xl">Редактировать профиль</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <span className="text-xs opacity-70">Аватар</span>
          <AvatarPicker
            value={form.avatar_url}
            onChange={(src) => setForm({ ...form, avatar_url: src })}
            isPro={isPro}
            fallbackLabel={form.username}
          />
        </div>

        <Field
          label="Ник"
          value={form.username}
          onChange={(v) => setForm({ ...form, username: v })}
        />
        <div className="space-y-1">
          <span className="text-xs opacity-70">Город (Казахстан)</span>
          <select
            value={form.city}
            onChange={(e) =>
              setForm({
                ...form,
                city: e.target.value,
                country: e.target.value ? COUNTRY_DEFAULT : "",
              })
            }
            className="w-full px-3 py-2 rounded-md bg-[var(--muted)]/20 border border-[var(--muted)]/40"
          >
            <option value="">— не указывать —</option>
            {KZ_CITIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <span className="text-xs opacity-70">Пол</span>
          <div className="flex gap-2">
            {(["male", "female", "unspecified"] as const).map((g) => (
              <button
                type="button"
                key={g}
                onClick={() => setForm({ ...form, gender: g })}
                className={
                  form.gender === g
                    ? "flex-1 py-2 rounded-md border-2 border-[var(--accent)] bg-[var(--accent)]/10 text-sm"
                    : "flex-1 py-2 rounded-md border border-[var(--muted)]/40 text-sm opacity-70"
                }
              >
                {g === "male" ? "Мужской" : g === "female" ? "Женский" : "Не указывать"}
              </button>
            ))}
          </div>
        </div>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={saving}
          className="w-full py-2 rounded-md bg-[var(--accent)] text-black font-medium disabled:opacity-50"
        >
          {saving ? "Сохраняем..." : "Сохранить"}
        </button>
      </form>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block space-y-1">
      <span className="text-xs opacity-70">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-md bg-[var(--muted)]/20 border border-[var(--muted)]/40"
      />
    </label>
  );
}
