alter table public.matches
  add column if not exists advisor_match_status text not null default 'new',
  add column if not exists advisor_match_note text null,
  add column if not exists advisor_match_status_updated_at timestamptz null,
  add column if not exists advisor_match_status_updated_by uuid null references public.profiles(id) on delete set null;

create index if not exists matches_advisor_match_status_idx
  on public.matches (advisor_match_status);

create index if not exists matches_advisor_match_status_updated_at_idx
  on public.matches (advisor_match_status_updated_at desc);

create or replace function public.update_advisor_match_workflow(
  input_match_id uuid,
  input_status text default null,
  input_note text default null
)
returns public.matches
language plpgsql
security definer
set search_path = public
as $$
declare
  target_match public.matches;
  current_advisor_id uuid;
  next_status text;
  allowed_statuses text[] := array[
    'new',
    'advisor_contacted',
    'presented_to_client',
    'client_interested',
    'showing_scheduled',
    'negative',
    'follow_up',
    'converted_to_deal'
  ];
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  select *
  into target_match
  from public.matches
  where id = input_match_id;

  if target_match.id is null then
    raise exception 'Match not found';
  end if;

  next_status := coalesce(input_status, target_match.advisor_match_status, 'new');
  if not next_status = any(allowed_statuses) then
    raise exception 'Unsupported match status';
  end if;

  select a.id
  into current_advisor_id
  from public.advisors a
  where a.profile_id = auth.uid()
  limit 1;

  if not (
    public.is_ocean_admin()
    or current_advisor_id = target_match.property_advisor_id
    or current_advisor_id = target_match.request_advisor_id
    or exists (
      select 1
      from public.properties p
      where p.id = target_match.property_id
        and p.advisor_id = current_advisor_id
    )
    or exists (
      select 1
      from public.search_requests sr
      where sr.id = target_match.search_request_id
        and sr.advisor_id = current_advisor_id
    )
  ) then
    raise exception 'Not allowed to update this match';
  end if;

  update public.matches
  set advisor_match_status = next_status,
      advisor_match_note = input_note,
      advisor_match_status_updated_at = now(),
      advisor_match_status_updated_by = auth.uid()
  where id = input_match_id
  returning * into target_match;

  return target_match;
end;
$$;

grant execute on function public.update_advisor_match_workflow(uuid, text, text) to authenticated;
