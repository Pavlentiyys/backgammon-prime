create policy "moves insert participants"
  on public.moves for insert with check (
    exists (
      select 1 from public.games g
      where g.id = moves.game_id
        and (auth.uid() = g.player_white or auth.uid() = g.player_black)
    )
  );

alter publication supabase_realtime add table public.games;
alter publication supabase_realtime add table public.moves;
