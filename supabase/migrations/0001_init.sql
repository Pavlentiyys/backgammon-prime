-- Nardy: initial schema
create extension if not exists "citext";
create extension if not exists "pgcrypto";

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username citext unique not null,
  avatar_url text,
  city text,
  country text,
  elo int not null default 1200,
  games_played int not null default 0,
  wins int not null default 0,
  is_pro boolean not null default false,
  pro_expires_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.games (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('bot','realtime','async','hotseat')),
  player_white uuid references public.profiles(id),
  player_black uuid references public.profiles(id),
  status text not null default 'waiting' check (status in ('waiting','active','finished','abandoned')),
  winner_color text check (winner_color in ('white','black')),
  win_type text check (win_type in ('normal','mars','koks')),
  state jsonb not null,
  time_per_move int,
  last_move_at timestamptz,
  created_at timestamptz not null default now(),
  finished_at timestamptz
);

create index games_player_white_idx on public.games(player_white);
create index games_player_black_idx on public.games(player_black);
create index games_status_type_idx on public.games(status, type);

create table public.moves (
  id bigserial primary key,
  game_id uuid not null references public.games(id) on delete cascade,
  move_number int not null,
  player_color text not null check (player_color in ('white','black')),
  dice int[] not null,
  move jsonb not null,
  state_after jsonb not null,
  created_at timestamptz not null default now(),
  unique (game_id, move_number)
);

create index moves_game_idx on public.moves(game_id, move_number);

create table public.rooms (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  game_id uuid not null references public.games(id) on delete cascade,
  host_id uuid not null references public.profiles(id),
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  expires_at timestamptz
);

create index rooms_slug_idx on public.rooms(slug);

create table public.analysis (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  accuracy numeric,
  mistakes_count int default 0,
  blunders_count int default 0,
  summary_text text,
  move_comments jsonb,
  created_at timestamptz not null default now(),
  unique (game_id, user_id)
);

-- auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'username',
      'player_' || substr(new.id::text, 1, 6)
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
