import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/Header";
import { isSupabaseConfigured } from "@/lib/env";
import type { GameRow, RoomRow } from "@/lib/supabase/types";
import { JoinClient } from "./JoinClient";

export default async function RoomPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!isSupabaseConfigured()) {
    return (
      <>
        <Header />
        <main className="p-8 text-center opacity-70">Supabase не настроен.</main>
      </>
    );
  }

  const sb = await createClient();
  const { data: room } = await sb
    .from("rooms")
    .select("*")
    .eq("slug", slug)
    .single<RoomRow>();
  if (!room) notFound();

  const { data: game } = await sb
    .from("games")
    .select("*")
    .eq("id", room.game_id)
    .single<GameRow>();
  if (!game) notFound();

  const {
    data: { user },
  } = await sb.auth.getUser();

  if (user && (user.id === game.player_white || user.id === game.player_black)) {
    redirect(`/play/${game.id}`);
  }

  return (
    <>
      <Header />
      <main className="max-w-md mx-auto p-6 space-y-6 text-center">
        <h1 className="font-display text-3xl">Комната {slug}</h1>
        <p className="opacity-70">
          {game.player_white && game.player_black
            ? "Партия уже идёт. Можно подключиться спектатором."
            : "Свободное место. Подключись и начнём."}
        </p>

        {user ? (
          <JoinClient slug={slug} />
        ) : (
          <div className="space-y-2">
            <Link
              href={`/sign-in?next=/play/r/${slug}`}
              className="block w-full py-3 rounded-md bg-[var(--accent)] text-black font-medium"
            >
              Войти и подключиться
            </Link>
            <Link
              href={`/sign-up?next=/play/r/${slug}`}
              className="block w-full py-3 rounded-md border border-[var(--muted)]/40"
            >
              Создать аккаунт
            </Link>
          </div>
        )}
      </main>
    </>
  );
}
