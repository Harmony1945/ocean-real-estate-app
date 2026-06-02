alter table public.properties
  add column if not exists latitude numeric,
  add column if not exists longitude numeric;
