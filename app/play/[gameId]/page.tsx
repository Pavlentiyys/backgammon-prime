import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/Header";
import { isSupabaseConfigured } from "@/lib/env";
import { GameClient } from "./GameClient";
import type { GameRow } from "@/lib/supabase/types";
import type { Color } from "@/lib/engine/types";

export default async function GamePage({
  params,
}: {
  params: Promise<{ gameId: string }>;
}) {
  const { gameId } = await params;
  if (!isSupabaseConfigured()) {
    return (
      <>
        <Header />
        <main className="p-8 text-center opacity-70">
          Сетевые партии недоступны (Supabase не настроен). Открой{" "}
          <Link href="/play/hotseat" className="text-[var(--accent)] underline">
            hot-seat
          </Link>
          .
        </main>
      </>
    );
  }

  const sb = await createClient();
  const { data: game } = await sb
    .from("games")
    .select("*")
    .eq("id", gameId)
    .single<GameRow>();
  if (!game) notFound();

  const {
    data: { user },
  } = await sb.auth.getUser();
  let myColor: Color | "spectator" | null = null;
  if (user) {
    if (user.id === game.player_white) myColor = "white";
    else if (user.id === game.player_black) myColor = "black";
    else myColor = "spectator";
  }

  return (
    <>
      <Header />
      <main className="flex-1 p-3 sm:p-6 max-w-5xl w-full mx-auto">
        <GameClient
          gameId={gameId}
          initialState={game.state}
          type={game.type}
          myColor={myColor}
        />
      </main>
    </>
  );
}
