create table if not exists public.property_media (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  storage_bucket text not null default 'property-images',
  storage_path text not null,
  display_storage_path text,
  original_storage_path text,
  file_name text,
  file_size bigint,
  mime_type text,
  sort_order integer not null default 0,
  is_cover boolean not null default false,
  visibility text not null default 'internal' check (visibility in ('public', 'internal', 'restricted', 'private')),
  uploaded_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint property_media_bucket_check check (storage_bucket = 'property-images'),
  constraint property_media_mime_type_check check (mime_type is null or mime_type in ('image/jpeg', 'image/png', 'image/webp')),
  constraint property_media_unique_path unique (storage_bucket, storage_path)
);

create index if not exists property_media_property_id_idx on public.property_media(property_id);
create index if not exists property_media_uploaded_by_idx on public.property_media(uploaded_by);
create unique index if not exists property_media_one_cover_idx
  on public.property_media(property_id)
  where is_cover;

alter table public.property_media enable row level security;

create or replace function public.property_id_from_storage_path(object_name text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
begin
  return ((storage.foldername(object_name))[1])::uuid;
exception
  when others then
    return null;
end;
$$;

create or replace function public.is_property_advisor(target_property_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.properties p
    join public.advisors a on a.id = p.advisor_id
    where p.id = target_property_id
      and a.profile_id = auth.uid()
  );
$$;

create or replace function public.is_ocean_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  );
$$;

create or replace function public.enforce_property_media_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (
    select count(*)
    from public.property_media
    where property_id = new.property_id
      and id <> new.id
  ) >= 12 then
    raise exception 'Her portföy için en fazla 12 fotoğraf yüklenebilir.';
  end if;

  return new;
end;
$$;

drop trigger if exists property_media_limit on public.property_media;
create trigger property_media_limit
  before insert on public.property_media
  for each row execute function public.enforce_property_media_limit();

drop trigger if exists property_media_set_updated_at on public.property_media;
create trigger property_media_set_updated_at
  before update on public.property_media
  for each row execute function public.set_updated_at();

drop policy if exists "property_media_select_authenticated" on public.property_media;
create policy "property_media_select_authenticated"
  on public.property_media for select
  to authenticated
  using (true);

drop policy if exists "property_media_insert_property_advisor" on public.property_media;
create policy "property_media_insert_property_advisor"
  on public.property_media for insert
  to authenticated
  with check (
    uploaded_by = auth.uid()
    and (public.is_property_advisor(property_id) or public.is_ocean_admin())
  );

drop policy if exists "property_media_update_property_advisor" on public.property_media;
create policy "property_media_update_property_advisor"
  on public.property_media for update
  to authenticated
  using (public.is_property_advisor(property_id) or public.is_ocean_admin())
  with check (public.is_property_advisor(property_id) or public.is_ocean_admin());

drop policy if exists "property_media_delete_property_advisor" on public.property_media;
create policy "property_media_delete_property_advisor"
  on public.property_media for delete
  to authenticated
  using (public.is_property_advisor(property_id) or public.is_ocean_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'property-images',
  'property-images',
  false,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
  set public = false,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "property_images_read_authenticated" on storage.objects;
create policy "property_images_read_authenticated"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'property-images');

drop policy if exists "property_images_insert_property_advisor" on storage.objects;
create policy "property_images_insert_property_advisor"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'property-images'
    and (
      public.is_property_advisor(public.property_id_from_storage_path(name))
      or public.is_ocean_admin()
    )
  );

drop policy if exists "property_images_update_property_advisor" on storage.objects;
create policy "property_images_update_property_advisor"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'property-images'
    and (
      public.is_property_advisor(public.property_id_from_storage_path(name))
      or public.is_ocean_admin()
    )
  )
  with check (
    bucket_id = 'property-images'
    and (
      public.is_property_advisor(public.property_id_from_storage_path(name))
      or public.is_ocean_admin()
    )
  );

drop policy if exists "property_images_delete_property_advisor" on storage.objects;
create policy "property_images_delete_property_advisor"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'property-images'
    and (
      public.is_property_advisor(public.property_id_from_storage_path(name))
      or public.is_ocean_admin()
    )
  );
