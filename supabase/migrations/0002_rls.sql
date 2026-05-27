-- Row-level security for Nardy
alter table public.profiles enable row level security;
alter table public.games enable row level security;
alter table public.moves enable row level security;
alter table public.rooms enable row level security;
alter table public.analysis enable row level security;

-- profiles: anyone can read public fields, owner can update self
create policy "profiles read all"
  on public.profiles for select using (true);

create policy "profiles update self"
  on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

-- games: participants can read; reads through public rooms allowed
create policy "games read participants"
  on public.games for select using (
    auth.uid() = player_white
    or auth.uid() = player_black
    or exists (
      select 1 from public.rooms r
      where r.game_id = games.id and r.is_public = true
    )
  );

create policy "games update participants"
  on public.games for update using (
    auth.uid() = player_white or auth.uid() = player_black
  );

create policy "games insert authenticated"
  on public.games for insert with check (auth.uid() is not null);

-- moves: participants read, only service-role writes
create policy "moves read participants"
  on public.moves for select using (
    exists (
      select 1 from public.games g
      where g.id = moves.game_id
        and (auth.uid() = g.player_white or auth.uid() = g.player_black
             or exists (select 1 from public.rooms r where r.game_id = g.id and r.is_public = true))
    )
  );

-- rooms: public visible to all, private to participants
create policy "rooms read public or participant"
  on public.rooms for select using (
    is_public = true
    or auth.uid() = host_id
    or exists (
      select 1 from public.games g
      where g.id = rooms.game_id
        and (auth.uid() = g.player_white or auth.uid() = g.player_black)
    )
  );

create policy "rooms insert authenticated"
  on public.rooms for insert with check (auth.uid() = host_id);

-- analysis: owner or participants read
create policy "analysis read participants"
  on public.analysis for select using (
    auth.uid() = user_id
    or exists (
      select 1 from public.games g
      where g.id = analysis.game_id
        and (auth.uid() = g.player_white or auth.uid() = g.player_black)
    )
  );
