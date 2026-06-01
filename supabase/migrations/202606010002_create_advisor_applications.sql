create table if not exists public.advisor_applications (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text,
  city text,
  district text,
  experience_level text,
  current_company text,
  preferred_model text not null check (preferred_model in ('ocean_elite', 'ocean_core')),
  motivation text,
  contract_accepted boolean not null default false,
  red_lines_accepted boolean not null default false,
  commission_model_accepted boolean not null default false,
  kvkk_accepted boolean not null default false,
  status text not null default 'new' check (status in ('new', 'in_review', 'approved', 'rejected')),
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  review_note text,
  linked_profile_id uuid references public.profiles(id) on delete set null,
  linked_advisor_id uuid references public.advisors(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists advisor_applications_status_idx on public.advisor_applications(status);
create index if not exists advisor_applications_email_idx on public.advisor_applications(lower(email));

alter table public.advisor_applications enable row level security;

drop trigger if exists advisor_applications_set_updated_at on public.advisor_applications;
create trigger advisor_applications_set_updated_at
  before update on public.advisor_applications
  for each row execute function public.set_updated_at();

drop policy if exists "advisor_applications_insert_public" on public.advisor_applications;
create policy "advisor_applications_insert_public"
  on public.advisor_applications for insert
  to anon, authenticated
  with check (
    contract_accepted = true
    and red_lines_accepted = true
    and commission_model_accepted = true
    and kvkk_accepted = true
  );

drop policy if exists "advisor_applications_admin_select" on public.advisor_applications;
create policy "advisor_applications_admin_select"
  on public.advisor_applications for select
  to authenticated
  using (public.is_ocean_admin());

drop policy if exists "advisor_applications_admin_update" on public.advisor_applications;
create policy "advisor_applications_admin_update"
  on public.advisor_applications for update
  to authenticated
  using (public.is_ocean_admin())
  with check (public.is_ocean_admin());

create or replace function public.review_advisor_application(
  application_id uuid,
  next_status text,
  note text default null
)
returns public.advisor_applications
language plpgsql
security definer
set search_path = public
as $$
declare
  target_application public.advisor_applications;
  target_profile public.profiles;
  target_advisor_id uuid;
  advisor_model_value text;
  advisor_model_is_enum boolean;
begin
  if not public.is_ocean_admin() then
    raise exception 'admin_required';
  end if;

  if next_status not in ('approved', 'rejected', 'in_review') then
    raise exception 'invalid_application_status';
  end if;

  select *
    into target_application
    from public.advisor_applications
    where id = application_id
    for update;

  if target_application.id is null then
    raise exception 'application_not_found';
  end if;

  if next_status = 'approved' then
    select *
      into target_profile
      from public.profiles
      where lower(email) = lower(target_application.email)
      limit 1;

    if target_profile.id is not null then
      select id
        into target_advisor_id
        from public.advisors
        where profile_id = target_profile.id
        limit 1;

      if target_advisor_id is null then
        select exists (
          select 1
          from pg_attribute a
          join pg_type t on t.oid = a.atttypid
          where a.attrelid = 'public.advisors'::regclass
            and a.attname = 'model'
            and t.typtype = 'e'
        ) into advisor_model_is_enum;

        if advisor_model_is_enum then
          select e.enumlabel
            into advisor_model_value
            from pg_attribute a
            join pg_type t on t.oid = a.atttypid
            join pg_enum e on e.enumtypid = t.oid
            where a.attrelid = 'public.advisors'::regclass
              and a.attname = 'model'
              and (
                lower(e.enumlabel) = target_application.preferred_model
                or lower(e.enumlabel) = replace(target_application.preferred_model, 'ocean_', '')
              )
            order by e.enumsortorder
            limit 1;

          select coalesce(advisor_model_value, min(e.enumlabel))
            into advisor_model_value
            from pg_attribute a
            join pg_type t on t.oid = a.atttypid
            join pg_enum e on e.enumtypid = t.oid
            where a.attrelid = 'public.advisors'::regclass
              and a.attname = 'model';

          execute format(
            'insert into public.advisors (profile_id, advisor_code, model, title, city, district, commission_cap_amount, commission_cap_currency, joined_at) values ($1, $2, %L, $3, $4, $5, 50000, ''USD'', now()) returning id',
            advisor_model_value
          )
          using
            target_profile.id,
            'OCEAN-' || upper(substr(replace(target_application.id::text, '-', ''), 1, 8)),
            'Gayrimenkul Danışmanı',
            target_application.city,
            target_application.district
          into target_advisor_id;
        else
          insert into public.advisors (
            profile_id,
            advisor_code,
            model,
            title,
            city,
            district,
            commission_cap_amount,
            commission_cap_currency,
            joined_at
          )
          values (
            target_profile.id,
            'OCEAN-' || upper(substr(replace(target_application.id::text, '-', ''), 1, 8)),
            target_application.preferred_model,
            'Gayrimenkul Danışmanı',
            target_application.city,
            target_application.district,
            50000,
            'USD',
            now()
          )
          returning id into target_advisor_id;
        end if;
      end if;
    end if;
  end if;

  update public.advisor_applications
    set
      status = next_status,
      reviewed_by = auth.uid(),
      reviewed_at = now(),
      review_note = note,
      linked_profile_id = case when next_status = 'approved' then target_profile.id else linked_profile_id end,
      linked_advisor_id = case when next_status = 'approved' then target_advisor_id else linked_advisor_id end
    where id = application_id
    returning * into target_application;

  return target_application;
end;
$$;

revoke all on function public.review_advisor_application(uuid, text, text) from public;
grant execute on function public.review_advisor_application(uuid, text, text) to authenticated;
