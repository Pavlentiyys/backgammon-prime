import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isAvatarLocked } from "@/lib/avatar-presets";
import { COUNTRY_DEFAULT, isKzCity } from "@/lib/cities";

export async function PATCH(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as {
    username?: string;
    city?: string;
    avatar_url?: string;
    gender?: "male" | "female" | "unspecified";
  };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const update: Record<string, string | null> = {};
  if (body.username !== undefined) update.username = body.username.trim();
  if (body.city !== undefined) {
    if (body.city && !isKzCity(body.city)) {
      return NextResponse.json({ error: "Неизвестный город" }, { status: 400 });
    }
    update.city = body.city || null;
    update.country = body.city ? COUNTRY_DEFAULT : null;
  }
  if (body.avatar_url !== undefined) {
    if (body.avatar_url) {
      const { data: prof } = await supabase
        .from("profiles")
        .select("is_pro, pro_expires_at")
        .eq("id", user.id)
        .single();
      const pro =
        !!prof?.is_pro &&
        (!prof.pro_expires_at || new Date(prof.pro_expires_at as string) > new Date());
      if (isAvatarLocked(body.avatar_url, pro)) {
        return NextResponse.json(
          { error: "Этот аватар доступен только для Pro" },
          { status: 403 },
        );
      }
    }
    update.avatar_url = body.avatar_url || null;
  }
  if (body.gender && ["male", "female", "unspecified"].includes(body.gender)) {
    update.gender = body.gender;
  }

  const { error } = await supabase.from("profiles").update(update).eq("id", user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
