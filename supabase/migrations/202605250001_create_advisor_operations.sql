create table if not exists public.portfolios (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  location text,
  district text,
  owner text,
  value numeric,
  stage text,
  contract_type text,
  next_move text,
  risk text,
  commission_rate numeric,
  commission numeric,
  listing_id text,
  property_type text,
  area text,
  rooms text,
  description text,
  latitude numeric,
  longitude numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.search_requests (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  location text,
  property_type text,
  min_price numeric,
  max_price numeric,
  currency text,
  min_bedrooms integer,
  min_area numeric,
  max_area numeric,
  rooms text,
  purpose text,
  urgency text,
  notes text,
  status text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  portfolio_id uuid null references public.portfolios(id) on delete cascade,
  title text not null,
  done boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.portfolios enable row level security;
alter table public.search_requests enable row level security;
alter table public.tasks enable row level security;

create policy "Users can read own portfolios"
  on public.portfolios for select
  using (auth.uid() = owner_user_id);

create policy "Users can insert own portfolios"
  on public.portfolios for insert
  with check (auth.uid() = owner_user_id);

create policy "Users can update own portfolios"
  on public.portfolios for update
  using (auth.uid() = owner_user_id)
  with check (auth.uid() = owner_user_id);

create policy "Users can delete own portfolios"
  on public.portfolios for delete
  using (auth.uid() = owner_user_id);

create policy "Users can read own search requests"
  on public.search_requests for select
  using (auth.uid() = owner_user_id);

create policy "Users can insert own search requests"
  on public.search_requests for insert
  with check (auth.uid() = owner_user_id);

create policy "Users can update own search requests"
  on public.search_requests for update
  using (auth.uid() = owner_user_id)
  with check (auth.uid() = owner_user_id);

create policy "Users can delete own search requests"
  on public.search_requests for delete
  using (auth.uid() = owner_user_id);

create policy "Users can read own tasks"
  on public.tasks for select
  using (auth.uid() = owner_user_id);

create policy "Users can insert own tasks"
  on public.tasks for insert
  with check (auth.uid() = owner_user_id);

create policy "Users can update own tasks"
  on public.tasks for update
  using (auth.uid() = owner_user_id)
  with check (auth.uid() = owner_user_id);

create policy "Users can delete own tasks"
  on public.tasks for delete
  using (auth.uid() = owner_user_id);

create index if not exists portfolios_owner_user_id_idx on public.portfolios(owner_user_id);
create index if not exists search_requests_owner_user_id_idx on public.search_requests(owner_user_id);
create index if not exists tasks_owner_user_id_idx on public.tasks(owner_user_id);
create index if not exists tasks_portfolio_id_idx on public.tasks(portfolio_id);
