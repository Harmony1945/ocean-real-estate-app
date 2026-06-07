create table if not exists public.notification_preferences (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  advisor_id uuid references public.advisors(id) on delete cascade,
  in_app_enabled boolean not null default true,
  email_enabled boolean not null default false,
  critical_enabled boolean not null default true,
  property_updates_enabled boolean not null default true,
  match_notifications_enabled boolean not null default true,
  revenue_notifications_enabled boolean not null default true,
  advisor_application_notifications_enabled boolean not null default true,
  system_notifications_enabled boolean not null default true,
  quiet_hours_enabled boolean not null default false,
  quiet_hours_start text,
  quiet_hours_end text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint notification_preferences_profile_unique unique (profile_id)
);

create index if not exists notification_preferences_profile_idx on public.notification_preferences(profile_id);
create index if not exists notification_preferences_advisor_idx on public.notification_preferences(advisor_id);

alter table public.notification_preferences enable row level security;

drop policy if exists "notification_preferences_own_select" on public.notification_preferences;
create policy "notification_preferences_own_select"
  on public.notification_preferences for select
  to authenticated
  using (profile_id = auth.uid());

drop policy if exists "notification_preferences_own_insert" on public.notification_preferences;
create policy "notification_preferences_own_insert"
  on public.notification_preferences for insert
  to authenticated
  with check (
    profile_id = auth.uid()
    and (
      advisor_id is null
      or exists (
        select 1
        from public.advisors a
        where a.id = notification_preferences.advisor_id
          and a.profile_id = auth.uid()
      )
    )
  );

drop policy if exists "notification_preferences_own_update" on public.notification_preferences;
create policy "notification_preferences_own_update"
  on public.notification_preferences for update
  to authenticated
  using (profile_id = auth.uid())
  with check (
    profile_id = auth.uid()
    and (
      advisor_id is null
      or exists (
        select 1
        from public.advisors a
        where a.id = notification_preferences.advisor_id
          and a.profile_id = auth.uid()
      )
    )
  );

drop policy if exists "notification_preferences_admin_manage" on public.notification_preferences;
create policy "notification_preferences_admin_manage"
  on public.notification_preferences for all
  to authenticated
  using (public.is_ocean_admin())
  with check (public.is_ocean_admin());

create or replace function public.touch_notification_preferences_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists notification_preferences_touch_updated_at on public.notification_preferences;
create trigger notification_preferences_touch_updated_at
  before update on public.notification_preferences
  for each row
  execute function public.touch_notification_preferences_updated_at();

create or replace function public.should_create_notification_for_preferences(
  pref public.notification_preferences,
  input_type text,
  input_priority text
)
returns boolean
language plpgsql
stable
set search_path = public
as $$
begin
  if input_priority in ('urgent', 'high') then
    return coalesce(pref.critical_enabled, true);
  end if;

  if coalesce(pref.in_app_enabled, true) = false then
    return false;
  end if;

  if input_type like 'property_%' then
    return coalesce(pref.property_updates_enabled, true);
  end if;

  if input_type like 'match_%' then
    return coalesce(pref.match_notifications_enabled, true);
  end if;

  if input_type like 'revenue_%' or input_type like 'transaction_%' or input_type like 'commission_%' then
    return coalesce(pref.revenue_notifications_enabled, true);
  end if;

  if input_type like 'advisor_application_%' then
    return coalesce(pref.advisor_application_notifications_enabled, true);
  end if;

  if input_type = 'system_notice' then
    return coalesce(pref.system_notifications_enabled, true);
  end if;

  return true;
end;
$$;

create or replace function public.should_create_notification_for_recipient(
  input_profile_id uuid,
  input_type text,
  input_priority text
)
returns boolean
language plpgsql
stable
set search_path = public
as $$
declare
  pref public.notification_preferences;
begin
  if input_profile_id is null then
    return true;
  end if;

  select *
    into pref
    from public.notification_preferences
    where profile_id = input_profile_id
    limit 1;

  return public.should_create_notification_for_preferences(pref, input_type, input_priority);
end;
$$;

create or replace function public.create_notification(
  input_recipient_profile_id uuid default null,
  input_recipient_advisor_id uuid default null,
  input_type text default null,
  input_title text default null,
  input_body text default null,
  input_entity_type text default null,
  input_entity_id uuid default null,
  input_entity_title text default null,
  input_priority text default 'normal',
  input_action_url text default null,
  input_metadata jsonb default '{}'::jsonb
)
returns setof public.notifications
language plpgsql
security definer
set search_path = public
as $$
declare
  current_profile_id uuid;
  current_advisor_id uuid;
  target_profile_id uuid;
  target_advisor_id uuid;
  normalized_type text;
  normalized_title text;
  normalized_priority text;
  created_notification public.notifications;
  should_notify_admins boolean;
begin
  normalized_type := nullif(btrim(coalesce(input_type, '')), '');
  normalized_title := nullif(btrim(coalesce(input_title, '')), '');

  if normalized_type is null then
    raise exception 'notification_type_required';
  end if;

  if normalized_title is null then
    raise exception 'notification_title_required';
  end if;

  normalized_priority := coalesce(nullif(input_priority, ''), 'normal');
  if normalized_priority not in ('low', 'normal', 'high', 'urgent') then
    normalized_priority := 'normal';
  end if;

  current_profile_id := auth.uid();

  if current_profile_id is not null then
    select id
      into current_advisor_id
      from public.advisors
      where profile_id = current_profile_id
      limit 1;
  end if;

  should_notify_admins :=
    input_recipient_profile_id is null
    and input_recipient_advisor_id is null
    and (
      (
        current_profile_id is not null
        and normalized_type in (
          'property_created',
          'search_request_created',
          'advisor_application_submitted',
          'system_notice'
        )
      )
      or (
        current_profile_id is null
        and normalized_type = 'advisor_application_submitted'
      )
    );

  if should_notify_admins then
    return query
      insert into public.notifications (
        recipient_profile_id,
        actor_profile_id,
        actor_advisor_id,
        type,
        title,
        body,
        entity_type,
        entity_id,
        entity_title,
        priority,
        action_url,
        metadata
      )
      select
        p.id,
        current_profile_id,
        current_advisor_id,
        normalized_type,
        normalized_title,
        nullif(input_body, ''),
        nullif(input_entity_type, ''),
        input_entity_id,
        nullif(input_entity_title, ''),
        normalized_priority,
        nullif(input_action_url, ''),
        coalesce(input_metadata, '{}'::jsonb)
      from public.profiles p
      left join public.notification_preferences pref on pref.profile_id = p.id
      where p.role = 'admin'
        and public.should_create_notification_for_preferences(pref, normalized_type, normalized_priority);
    return;
  end if;

  target_profile_id := coalesce(input_recipient_profile_id, current_profile_id);
  target_advisor_id := input_recipient_advisor_id;

  if target_profile_id is null and target_advisor_id is null then
    raise exception 'notification_recipient_required';
  end if;

  if current_profile_id is null then
    raise exception 'notification_auth_required';
  end if;

  if target_profile_id is null and target_advisor_id is not null then
    select a.profile_id into target_profile_id
    from public.advisors a
    where a.id = target_advisor_id
    limit 1;
  end if;

  if not public.is_ocean_admin() then
    if target_profile_id is not null and target_profile_id <> current_profile_id then
      raise exception 'notification_recipient_forbidden';
    end if;

    if target_advisor_id is not null and not exists (
      select 1
      from public.advisors a
      where a.id = target_advisor_id
        and a.profile_id = current_profile_id
    ) then
      raise exception 'notification_recipient_forbidden';
    end if;
  end if;

  if not public.should_create_notification_for_recipient(target_profile_id, normalized_type, normalized_priority) then
    return;
  end if;

  insert into public.notifications (
    recipient_profile_id,
    recipient_advisor_id,
    actor_profile_id,
    actor_advisor_id,
    type,
    title,
    body,
    entity_type,
    entity_id,
    entity_title,
    priority,
    action_url,
    metadata
  )
  values (
    target_profile_id,
    target_advisor_id,
    current_profile_id,
    current_advisor_id,
    normalized_type,
    normalized_title,
    nullif(input_body, ''),
    nullif(input_entity_type, ''),
    input_entity_id,
    nullif(input_entity_title, ''),
    normalized_priority,
    nullif(input_action_url, ''),
    coalesce(input_metadata, '{}'::jsonb)
  )
  returning * into created_notification;

  return next created_notification;
end;
$$;

revoke all on public.notification_preferences from anon;
grant select, insert, update on public.notification_preferences to authenticated;

revoke all on function public.should_create_notification_for_preferences(public.notification_preferences, text, text) from public;
grant execute on function public.should_create_notification_for_preferences(public.notification_preferences, text, text) to authenticated;

revoke all on function public.should_create_notification_for_recipient(uuid, text, text) from public;
grant execute on function public.should_create_notification_for_recipient(uuid, text, text) to authenticated;
