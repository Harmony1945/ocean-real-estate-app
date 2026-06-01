create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  actor_profile_id uuid references public.profiles(id) on delete set null,
  actor_advisor_id uuid references public.advisors(id) on delete set null,
  actor_email text,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  entity_title text,
  status text not null default 'success',
  summary text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists activity_logs_created_at_idx on public.activity_logs(created_at desc);
create index if not exists activity_logs_actor_profile_id_idx on public.activity_logs(actor_profile_id);
create index if not exists activity_logs_actor_advisor_id_idx on public.activity_logs(actor_advisor_id);
create index if not exists activity_logs_entity_idx on public.activity_logs(entity_type, entity_id);
create index if not exists activity_logs_action_idx on public.activity_logs(action);

alter table public.activity_logs enable row level security;

drop policy if exists "activity_logs_admin_select" on public.activity_logs;
create policy "activity_logs_admin_select"
  on public.activity_logs for select
  to authenticated
  using (public.is_ocean_admin());

drop policy if exists "activity_logs_advisor_own_select" on public.activity_logs;
create policy "activity_logs_advisor_own_select"
  on public.activity_logs for select
  to authenticated
  using (
    actor_profile_id = auth.uid()
    or exists (
      select 1
      from public.advisors a
      where a.id = activity_logs.actor_advisor_id
        and a.profile_id = auth.uid()
    )
  );

create or replace function public.log_activity(
  input_action text,
  input_entity_type text,
  input_entity_id uuid default null,
  input_entity_title text default null,
  input_status text default 'success',
  input_summary text default null,
  input_metadata jsonb default '{}'::jsonb,
  input_actor_email text default null
)
returns public.activity_logs
language plpgsql
security definer
set search_path = public
as $$
declare
  current_profile_id uuid;
  current_advisor_id uuid;
  current_actor_email text;
  created_log public.activity_logs;
begin
  if input_action is null or btrim(input_action) = '' then
    raise exception 'activity_action_required';
  end if;

  if input_entity_type is null or btrim(input_entity_type) = '' then
    raise exception 'activity_entity_type_required';
  end if;

  current_profile_id := auth.uid();
  current_actor_email := coalesce(nullif(input_actor_email, ''), nullif(auth.jwt() ->> 'email', ''));

  if current_profile_id is not null then
    select id
      into current_advisor_id
      from public.advisors
      where profile_id = current_profile_id
      limit 1;
  end if;

  insert into public.activity_logs (
    actor_profile_id,
    actor_advisor_id,
    actor_email,
    action,
    entity_type,
    entity_id,
    entity_title,
    status,
    summary,
    metadata
  )
  values (
    current_profile_id,
    current_advisor_id,
    current_actor_email,
    input_action,
    input_entity_type,
    input_entity_id,
    nullif(input_entity_title, ''),
    coalesce(nullif(input_status, ''), 'success'),
    nullif(input_summary, ''),
    coalesce(input_metadata, '{}'::jsonb)
  )
  returning * into created_log;

  return created_log;
end;
$$;

revoke all on function public.log_activity(text, text, uuid, text, text, text, jsonb, text) from public;
grant execute on function public.log_activity(text, text, uuid, text, text, text, jsonb, text) to anon, authenticated;
revoke all on public.activity_logs from anon;
revoke insert, update, delete on public.activity_logs from authenticated;
grant select on public.activity_logs to authenticated;
