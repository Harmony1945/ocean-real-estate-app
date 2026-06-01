create table if not exists public.property_share_links (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  token text unique not null,
  created_by uuid references public.profiles(id) on delete set null,
  public_payload jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  disabled_at timestamptz,
  expires_at timestamptz
);

create index if not exists property_share_links_property_id_idx
  on public.property_share_links(property_id);

create index if not exists property_share_links_token_idx
  on public.property_share_links(token)
  where is_active;

create unique index if not exists property_share_links_one_active_per_property_idx
  on public.property_share_links(property_id)
  where is_active;

alter table public.property_share_links enable row level security;

create or replace function public.get_public_property_share(input_token text)
returns table (
  id uuid,
  property_id uuid,
  token text,
  public_payload jsonb,
  is_active boolean,
  created_at timestamptz,
  expires_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select
    psl.id,
    psl.property_id,
    psl.token,
    psl.public_payload,
    psl.is_active,
    psl.created_at,
    psl.expires_at
  from public.property_share_links psl
  where psl.token = input_token
    and psl.is_active = true
    and (psl.expires_at is null or psl.expires_at > now())
  limit 1;
$$;

revoke all on function public.get_public_property_share(text) from public;
grant execute on function public.get_public_property_share(text) to anon, authenticated;

drop policy if exists "property_share_links_select_property_advisor" on public.property_share_links;
create policy "property_share_links_select_property_advisor"
  on public.property_share_links for select
  to authenticated
  using (public.is_property_advisor(property_id) or public.is_ocean_admin());

drop policy if exists "property_share_links_insert_property_advisor" on public.property_share_links;
create policy "property_share_links_insert_property_advisor"
  on public.property_share_links for insert
  to authenticated
  with check (
    created_by = auth.uid()
    and (public.is_property_advisor(property_id) or public.is_ocean_admin())
  );

drop policy if exists "property_share_links_update_property_advisor" on public.property_share_links;
create policy "property_share_links_update_property_advisor"
  on public.property_share_links for update
  to authenticated
  using (public.is_property_advisor(property_id) or public.is_ocean_admin())
  with check (public.is_property_advisor(property_id) or public.is_ocean_admin());
