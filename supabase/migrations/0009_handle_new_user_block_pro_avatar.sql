create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  picked_avatar text;
begin
  picked_avatar := nullif(new.raw_user_meta_data->>'avatar_url', '');
  -- Pro-only avatars cannot be selected at signup (user is never Pro yet)
  if picked_avatar in ('/avatars/sultan.png') then
    picked_avatar := null;
  end if;

  insert into public.profiles (id, username, gender, city, country, avatar_url)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'username',
      'player_' || substr(new.id::text, 1, 6)
    ),
    coalesce(new.raw_user_meta_data->>'gender', 'unspecified'),
    nullif(new.raw_user_meta_data->>'city', ''),
    nullif(new.raw_user_meta_data->>'country', ''),
    picked_avatar
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
revoke execute on function public.handle_new_user() from anon, authenticated, public;
