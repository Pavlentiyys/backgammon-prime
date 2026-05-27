import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { GameRow } from "@/lib/supabase/types";
import type { Color } from "@/lib/engine/types";
import { isHomePos, pathPos } from "@/lib/engine/board";

export async function POST(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data: game } = await supabase
    .from("games")
    .select("*")
    .eq("id", id)
    .single<GameRow>();
  if (!game) return NextResponse.json({ error: "game not found" }, { status: 404 });
  if (game.status === "finished")
    return NextResponse.json({ error: "already finished" }, { status: 409 });

  const isWhite = user.id === game.player_white;
  const isBlack = user.id === game.player_black;
  if (!isWhite && !isBlack && game.type !== "hotseat") {
    return NextResponse.json({ error: "not a participant" }, { status: 403 });
  }

  const resignedColor: Color = isWhite ? "white" : "black";
  const winnerColor: Color = resignedColor === "white" ? "black" : "white";

  const loserHasBornOff = game.state.bornOff[resignedColor] > 0;
  const loserAllHome = (() => {
    for (let i = 0; i < 24; i++) {
      const p = game.state.points[i];
      if (p.color !== resignedColor || p.count === 0) continue;
      if (!isHomePos(pathPos(i, resignedColor))) return false;
    }
    return true;
  })();
  const winType = loserHasBornOff ? "normal" : loserAllHome ? "mars" : "koks";

  await supabase
    .from("games")
    .update({
      status: "finished",
      winner_color: winnerColor,
      win_type: winType,
      finished_at: new Date().toISOString(),
    })
    .eq("id", id);

  return NextResponse.json({ ok: true, winner: winnerColor, winType });
}
