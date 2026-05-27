-- Advisor fixes: revoke RPC exposure of trigger fn + move citext to extensions schema
revoke execute on function public.handle_new_user() from anon, authenticated, public;

create schema if not exists extensions;
alter extension citext set schema extensions;
grant usage on schema extensions to anon, authenticated, service_role;
