import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/Header";
import { isSupabaseConfigured } from "@/lib/env";
import { AnalysisClient } from "./AnalysisClient";
import type { GameRow } from "@/lib/supabase/types";

type SavedAnalysis = {
  accuracy: number;
  mistakes_count: number;
  blunders_count: number;
  summary_text: string;
  move_comments: {
    moveNumber: number;
    severity: "excellent" | "ok" | "mistake" | "blunder";
    loss: number;
    color: "white" | "black";
    dice: number[];
    text: string | null;
  }[];
};

export default async function AnalysisPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!isSupabaseConfigured()) {
    return (
      <>
        <Header />
        <main className="p-8 text-center opacity-70">Supabase не настроен.</main>
      </>
    );
  }

  const sb = await createClient();
  const {
    data: { user },
  } = await sb.auth.getUser();
  const { data: game } = await sb
    .from("games")
    .select("*")
    .eq("id", id)
    .single<GameRow>();
  if (!game) notFound();

  const { data: existing } = user
    ? await sb
        .from("analysis")
        .select("accuracy, mistakes_count, blunders_count, summary_text, move_comments")
        .eq("game_id", id)
        .eq("user_id", user.id)
        .maybeSingle<SavedAnalysis>()
    : { data: null };

  return (
    <>
      <Header />
      <main className="max-w-3xl mx-auto p-6 space-y-6">
        <h1 className="font-display text-3xl">Разбор партии</h1>
        <p className="opacity-70 text-sm">#{id.slice(0, 8)} · {game.type}</p>
        <AnalysisClient gameId={id} initial={existing} signedIn={!!user} />
      </main>
    </>
  );
}
