create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_profile_id uuid references public.profiles(id) on delete cascade,
  recipient_advisor_id uuid references public.advisors(id) on delete cascade,
  actor_profile_id uuid references public.profiles(id) on delete set null,
  actor_advisor_id uuid references public.advisors(id) on delete set null,
  type text not null,
  title text not null,
  body text,
  entity_type text,
  entity_id uuid,
  entity_title text,
  priority text not null default 'normal',
  status text not null default 'unread',
  action_url text,
  metadata jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now(),
  constraint notifications_priority_check check (priority in ('low', 'normal', 'high', 'urgent')),
  constraint notifications_status_check check (status in ('unread', 'read'))
);

create index if not exists notifications_recipient_profile_created_idx on public.notifications(recipient_profile_id, created_at desc);
create index if not exists notifications_recipient_advisor_created_idx on public.notifications(recipient_advisor_id, created_at desc);
create index if not exists notifications_status_idx on public.notifications(status);
create index if not exists notifications_type_idx on public.notifications(type);
create index if not exists notifications_entity_idx on public.notifications(entity_type, entity_id);
create index if not exists notifications_created_at_idx on public.notifications(created_at desc);

alter table public.notifications enable row level security;

drop policy if exists "notifications_own_select" on public.notifications;
create policy "notifications_own_select"
  on public.notifications for select
  to authenticated
  using (
    recipient_profile_id = auth.uid()
    or exists (
      select 1
      from public.advisors a
      where a.id = notifications.recipient_advisor_id
        and a.profile_id = auth.uid()
    )
  );

drop policy if exists "notifications_admin_select" on public.notifications;
create policy "notifications_admin_select"
  on public.notifications for select
  to authenticated
  using (public.is_ocean_admin());

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
      where p.role = 'admin';
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

create or replace function public.mark_notification_read(input_notification_id uuid)
returns public.notifications
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_notification public.notifications;
begin
  update public.notifications n
    set status = 'read',
        read_at = coalesce(n.read_at, now())
    where n.id = input_notification_id
      and (
        public.is_ocean_admin()
        or n.recipient_profile_id = auth.uid()
        or exists (
          select 1
          from public.advisors a
          where a.id = n.recipient_advisor_id
            and a.profile_id = auth.uid()
        )
      )
    returning * into updated_notification;

  if updated_notification.id is null then
    raise exception 'notification_not_found';
  end if;

  return updated_notification;
end;
$$;

create or replace function public.mark_all_notifications_read()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_count integer;
begin
  update public.notifications n
    set status = 'read',
        read_at = coalesce(n.read_at, now())
    where n.status = 'unread'
      and (
        public.is_ocean_admin()
        or n.recipient_profile_id = auth.uid()
        or exists (
          select 1
          from public.advisors a
          where a.id = n.recipient_advisor_id
            and a.profile_id = auth.uid()
        )
      );

  get diagnostics updated_count = row_count;
  return updated_count;
end;
$$;

revoke all on public.notifications from anon;
revoke insert, update, delete on public.notifications from authenticated;
grant select on public.notifications to authenticated;

revoke all on function public.create_notification(uuid, uuid, text, text, text, text, uuid, text, text, text, jsonb) from public;
grant execute on function public.create_notification(uuid, uuid, text, text, text, text, uuid, text, text, text, jsonb) to anon, authenticated;

revoke all on function public.mark_notification_read(uuid) from public;
grant execute on function public.mark_notification_read(uuid) to authenticated;

revoke all on function public.mark_all_notifications_read() from public;
grant execute on function public.mark_all_notifications_read() to authenticated;
