import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/Header";
import { isSupabaseConfigured } from "@/lib/env";
import { ReplayClient } from "./ReplayClient";
import type { GameRow, MoveRow } from "@/lib/supabase/types";
import { createInitialState } from "@/lib/engine/state";

export default async function ReplayPage({
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
  const { data: game } = await sb
    .from("games")
    .select("*")
    .eq("id", id)
    .single<GameRow>();
  if (!game) notFound();

  const { data: moves } = await sb
    .from("moves")
    .select("*")
    .eq("game_id", id)
    .order("move_number", { ascending: true });

  const states = [createInitialState(), ...((moves ?? []) as MoveRow[]).map((m) => m.state_after)];

  return (
    <>
      <Header />
      <main className="flex-1 p-3 sm:p-6 max-w-5xl w-full mx-auto">
        <ReplayClient
          gameId={id}
          type={game.type}
          states={states}
          moves={((moves ?? []) as MoveRow[]).map((m) => ({
            number: m.move_number,
            color: m.player_color,
            dice: m.dice,
          }))}
          winner={game.winner_color}
          winType={game.win_type}
        />
      </main>
    </>
  );
}
