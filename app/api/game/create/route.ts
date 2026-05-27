import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createInitialState } from "@/lib/engine/state";
import type { GameType } from "@/lib/supabase/types";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as {
    type?: GameType;
    timePerMove?: number;
  };
  const type: GameType = body.type ?? "hotseat";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const admin = createAdminClient();
  const state = createInitialState();
  const insert = {
    type,
    player_white: user.id,
    player_black: type === "hotseat" || type === "bot" ? user.id : null,
    status: type === "realtime" || type === "async" ? "waiting" : "active",
    state,
    time_per_move: body.timePerMove ?? null,
  };

  const { data, error } = await admin
    .from("games")
    .insert(insert)
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ gameId: data.id });
}
