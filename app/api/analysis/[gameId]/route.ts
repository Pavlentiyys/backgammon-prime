import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createInitialState } from "@/lib/engine/state";
import { reviewGame, accuracy } from "@/lib/coach/equity";
import { explainTopMistakes } from "@/lib/coach/gemini";
import { isGeminiConfigured } from "@/lib/env";
import type { GameRow, MoveRow, Profile } from "@/lib/supabase/types";

const FREE_LIMIT = 3;

export async function POST(
  _request: NextRequest,
  context: { params: Promise<{ gameId: string }> },
) {
  const { gameId } = await context.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data: existing } = await supabase
    .from("analysis")
    .select("*")
    .eq("game_id", gameId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (existing) return NextResponse.json({ analysis: existing, cached: true });

  const { data: game } = await supabase
    .from("games")
    .select("*")
    .eq("id", gameId)
    .single<GameRow>();
  if (!game) return NextResponse.json({ error: "game not found" }, { status: 404 });
  if (game.status !== "finished") {
    return NextResponse.json({ error: "game not finished" }, { status: 409 });
  }

  const myColor = user.id === game.player_white ? "white" : user.id === game.player_black ? "black" : null;
  if (!myColor) return NextResponse.json({ error: "not a participant" }, { status: 403 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_pro, pro_expires_at")
    .eq("id", user.id)
    .single<Pick<Profile, "is_pro" | "pro_expires_at">>();
  const isPro =
    profile?.is_pro &&
    (!profile.pro_expires_at || new Date(profile.pro_expires_at) > new Date());

  if (!isPro) {
    const since = new Date(Date.now() - 30 * 86400 * 1000).toISOString();
    const { count } = await supabase
      .from("analysis")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", since);
    if ((count ?? 0) >= FREE_LIMIT) {
      return NextResponse.json(
        { error: "free limit reached", paywall: true },
        { status: 402 },
      );
    }
  }

  const { data: moves } = await supabase
    .from("moves")
    .select("move_number, player_color, dice, move, state_after")
    .eq("game_id", gameId)
    .order("move_number", { ascending: true });
  const moveList = (moves ?? []) as MoveRow[];

  const initial = createInitialState();
  const reviews = reviewGame(initial, moveList, myColor);
  const acc = accuracy(reviews);
  const mistakes = reviews.filter((r) => r.severity === "mistake").length;
  const blunders = reviews.filter((r) => r.severity === "blunder").length;

  let summary = "";
  let comments: { moveNumber: number; text: string }[] = [];
  if (isGeminiConfigured()) {
    try {
      const states = [initial, ...moveList.map((m) => m.state_after)];
      const out = await explainTopMistakes(initial, states, reviews, myColor);
      summary = out.summary;
      comments = out.comments;
    } catch (e) {
      summary = `Анализ движка готов, но Gemini недоступен: ${(e as Error).message}`;
    }
  } else {
    summary = "GEMINI_API_KEY не настроен — показан только движковый анализ.";
  }

  const moveComments = reviews.map((r) => ({
    moveNumber: r.moveNumber,
    severity: r.severity,
    loss: Number(r.loss.toFixed(2)),
    color: r.color,
    dice: r.dice,
    text: comments.find((c) => c.moveNumber === r.moveNumber)?.text ?? null,
  }));

  const { data: saved, error: insErr } = await supabase
    .from("analysis")
    .insert({
      game_id: gameId,
      user_id: user.id,
      accuracy: acc,
      mistakes_count: mistakes,
      blunders_count: blunders,
      summary_text: summary,
      move_comments: moveComments,
    })
    .select("*")
    .single();
  if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 });

  return NextResponse.json({ analysis: saved });
}
