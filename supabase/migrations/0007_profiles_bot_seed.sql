alter table public.profiles drop constraint if exists profiles_id_fkey;
alter table public.profiles add column if not exists is_bot boolean not null default false;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username, gender)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'username',
      'player_' || substr(new.id::text, 1, 6)
    ),
    coalesce(new.raw_user_meta_data->>'gender', 'unspecified')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
revoke execute on function public.handle_new_user() from anon, authenticated, public;

insert into public.profiles (id, username, elo, avatar_url, is_bot, gender, city, country)
values
  (gen_random_uuid(), 'Бот-Новичок',      720, '/avatars/bot.png', true, 'unspecified', null, null),
  (gen_random_uuid(), 'Beep Bop',         735, '/avatars/bot.png', true, 'unspecified', null, null),
  (gen_random_uuid(), 'RNG-1000',         750, '/avatars/bot.png', true, 'unspecified', null, null),
  (gen_random_uuid(), 'Алгоритм',         770, '/avatars/bot.png', true, 'unspecified', null, null),
  (gen_random_uuid(), 'CodeRunner',       790, '/avatars/bot.png', true, 'unspecified', null, null),
  (gen_random_uuid(), 'Нейрон',           810, '/avatars/bot.png', true, 'unspecified', null, null),
  (gen_random_uuid(), 'BackgammonAI',     830, '/avatars/bot.png', true, 'unspecified', null, null),
  (gen_random_uuid(), 'DiceBot',          850, '/avatars/bot.png', true, 'unspecified', null, null),
  (gen_random_uuid(), 'Робот-3000',       870, '/avatars/bot.png', true, 'unspecified', null, null),
  (gen_random_uuid(), 'Зеро',             890, '/avatars/bot.png', true, 'unspecified', null, null),
  (gen_random_uuid(), 'Пешка',            910, '/avatars/bot.png', true, 'unspecified', null, null),
  (gen_random_uuid(), 'Эта',              930, '/avatars/bot.png', true, 'unspecified', null, null),
  (gen_random_uuid(), 'Гамма',            950, '/avatars/bot.png', true, 'unspecified', null, null),
  (gen_random_uuid(), 'Дельта',           970, '/avatars/bot.png', true, 'unspecified', null, null),
  (gen_random_uuid(), 'Сигма',            990, '/avatars/bot.png', true, 'unspecified', null, null),
  (gen_random_uuid(), 'Бот-Чайник',      1010, '/avatars/bot.png', true, 'unspecified', null, null),
  (gen_random_uuid(), 'Бот-Любитель',    1030, '/avatars/bot.png', true, 'unspecified', null, null),
  (gen_random_uuid(), 'Бот-Серединка',   1050, '/avatars/bot.png', true, 'unspecified', null, null),
  (gen_random_uuid(), 'Бот-Стажёр',      1070, '/avatars/bot.png', true, 'unspecified', null, null),
  (gen_random_uuid(), 'Бот-Подмастерье', 1090, '/avatars/bot.png', true, 'unspecified', null, null)
on conflict (username) do nothing;
