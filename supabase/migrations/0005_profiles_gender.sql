alter table public.profiles
  add column if not exists gender text
  check (gender in ('male','female','unspecified')) default 'unspecified';
