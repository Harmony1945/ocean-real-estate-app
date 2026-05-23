-- Keep advisor roles database-controlled. Authenticated users may complete their
-- own profile, but they should not be able to promote themselves by writing role.

create or replace function public.lock_profile_role_for_authenticated_users()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.role() = 'authenticated' then
    if tg_op = 'INSERT' then
      new.role := 'advisor';
    elsif tg_op = 'UPDATE' then
      new.role := old.role;
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists lock_profile_role_for_authenticated_users on public.profiles;

create trigger lock_profile_role_for_authenticated_users
before insert or update on public.profiles
for each row
execute function public.lock_profile_role_for_authenticated_users();
