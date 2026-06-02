create table if not exists public.commission_rules (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  model text not null,
  advisor_percentage numeric not null,
  office_percentage numeric not null,
  referral_percentage numeric default 0,
  cap_enabled boolean not null default false,
  annual_cap_usd numeric,
  post_cap_own_office_percentage numeric,
  post_cap_office_generated_percentage numeric,
  is_active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint commission_rules_model_unique unique (model),
  constraint commission_rules_percentages_check check (
    advisor_percentage >= 0
    and office_percentage >= 0
    and coalesce(referral_percentage, 0) >= 0
  )
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references public.properties(id) on delete set null,
  advisor_id uuid references public.advisors(id) on delete set null,
  title text not null,
  transaction_type text not null default 'sale',
  status text not null default 'draft',
  transaction_amount numeric not null default 0,
  currency text not null default 'TRY',
  commission_rate numeric not null default 2,
  gross_commission numeric not null default 0,
  advisor_model text not null default 'core',
  source_type text,
  close_date date,
  notes text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint transactions_status_check check (status in ('draft', 'active', 'pending_collection', 'collected', 'paid_out', 'cancelled')),
  constraint transactions_type_check check (transaction_type in ('sale', 'rental', 'land_share', 'project_sale', 'referral', 'other')),
  constraint transactions_source_type_check check (source_type is null or source_type in ('advisor_generated', 'office_generated', 'referral_generated', 'project_generated')),
  constraint transactions_amount_check check (transaction_amount >= 0 and commission_rate >= 0 and gross_commission >= 0)
);

create table if not exists public.commission_splits (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid not null references public.transactions(id) on delete cascade,
  advisor_id uuid references public.advisors(id) on delete set null,
  split_type text not null,
  percentage numeric,
  amount numeric not null default 0,
  currency text not null default 'TRY',
  description text,
  created_at timestamptz not null default now(),
  constraint commission_splits_type_check check (split_type in ('advisor_share', 'office_share', 'referral_reward', 'cap_adjustment', 'bonus', 'deduction')),
  constraint commission_splits_amount_check check (amount >= 0)
);

create table if not exists public.advisor_cap_progress (
  id uuid primary key default gen_random_uuid(),
  advisor_id uuid not null references public.advisors(id) on delete cascade,
  year integer not null,
  cap_currency text not null default 'USD',
  cap_target numeric not null default 50000,
  accumulated_office_share_usd numeric not null default 0,
  cap_reached boolean not null default false,
  cap_reached_at timestamptz,
  updated_at timestamptz not null default now(),
  constraint advisor_cap_progress_unique unique(advisor_id, year)
);

create table if not exists public.payment_records (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid not null references public.transactions(id) on delete cascade,
  amount numeric not null,
  currency text not null default 'TRY',
  payment_type text not null,
  status text not null default 'recorded',
  paid_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  constraint payment_records_amount_check check (amount >= 0)
);

create index if not exists transactions_advisor_id_idx on public.transactions(advisor_id);
create index if not exists transactions_property_id_idx on public.transactions(property_id);
create index if not exists transactions_status_idx on public.transactions(status);
create index if not exists transactions_model_idx on public.transactions(advisor_model);
create index if not exists transactions_type_idx on public.transactions(transaction_type);
create index if not exists transactions_created_at_idx on public.transactions(created_at desc);
create index if not exists commission_splits_transaction_id_idx on public.commission_splits(transaction_id);
create index if not exists commission_splits_advisor_id_idx on public.commission_splits(advisor_id);
create index if not exists advisor_cap_progress_advisor_year_idx on public.advisor_cap_progress(advisor_id, year);
create index if not exists payment_records_transaction_id_idx on public.payment_records(transaction_id);

alter table public.transactions enable row level security;
alter table public.commission_splits enable row level security;
alter table public.commission_rules enable row level security;
alter table public.advisor_cap_progress enable row level security;
alter table public.payment_records enable row level security;

drop trigger if exists commission_rules_set_updated_at on public.commission_rules;
create trigger commission_rules_set_updated_at
  before update on public.commission_rules
  for each row execute function public.set_updated_at();

drop trigger if exists transactions_set_updated_at on public.transactions;
create trigger transactions_set_updated_at
  before update on public.transactions
  for each row execute function public.set_updated_at();

drop trigger if exists advisor_cap_progress_set_updated_at on public.advisor_cap_progress;
create trigger advisor_cap_progress_set_updated_at
  before update on public.advisor_cap_progress
  for each row execute function public.set_updated_at();

drop policy if exists "commission_rules_authenticated_select" on public.commission_rules;
create policy "commission_rules_authenticated_select"
  on public.commission_rules for select
  to authenticated
  using (is_active or public.is_ocean_admin());

drop policy if exists "commission_rules_admin_manage" on public.commission_rules;
create policy "commission_rules_admin_manage"
  on public.commission_rules for all
  to authenticated
  using (public.is_ocean_admin())
  with check (public.is_ocean_admin());

drop policy if exists "transactions_admin_manage" on public.transactions;
create policy "transactions_admin_manage"
  on public.transactions for all
  to authenticated
  using (public.is_ocean_admin())
  with check (public.is_ocean_admin());

drop policy if exists "transactions_advisor_select" on public.transactions;
create policy "transactions_advisor_select"
  on public.transactions for select
  to authenticated
  using (
    exists (
      select 1
      from public.advisors a
      where a.id = transactions.advisor_id
        and a.profile_id = auth.uid()
    )
  );

drop policy if exists "transactions_advisor_insert" on public.transactions;
create policy "transactions_advisor_insert"
  on public.transactions for insert
  to authenticated
  with check (
    created_by = auth.uid()
    and exists (
      select 1
      from public.advisors a
      where a.id = transactions.advisor_id
        and a.profile_id = auth.uid()
    )
  );

drop policy if exists "transactions_advisor_update" on public.transactions;
create policy "transactions_advisor_update"
  on public.transactions for update
  to authenticated
  using (
    exists (
      select 1
      from public.advisors a
      where a.id = transactions.advisor_id
        and a.profile_id = auth.uid()
    )
  )
  with check (
    created_by = auth.uid()
    and exists (
      select 1
      from public.advisors a
      where a.id = transactions.advisor_id
        and a.profile_id = auth.uid()
    )
  );

drop policy if exists "commission_splits_admin_manage" on public.commission_splits;
create policy "commission_splits_admin_manage"
  on public.commission_splits for all
  to authenticated
  using (public.is_ocean_admin())
  with check (public.is_ocean_admin());

drop policy if exists "commission_splits_advisor_select" on public.commission_splits;
create policy "commission_splits_advisor_select"
  on public.commission_splits for select
  to authenticated
  using (
    exists (
      select 1
      from public.transactions t
      join public.advisors a on a.id = t.advisor_id
      where t.id = commission_splits.transaction_id
        and a.profile_id = auth.uid()
    )
  );

drop policy if exists "commission_splits_advisor_insert" on public.commission_splits;
create policy "commission_splits_advisor_insert"
  on public.commission_splits for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.transactions t
      join public.advisors a on a.id = t.advisor_id
      where t.id = commission_splits.transaction_id
        and a.profile_id = auth.uid()
    )
  );

drop policy if exists "advisor_cap_progress_admin_manage" on public.advisor_cap_progress;
create policy "advisor_cap_progress_admin_manage"
  on public.advisor_cap_progress for all
  to authenticated
  using (public.is_ocean_admin())
  with check (public.is_ocean_admin());

drop policy if exists "advisor_cap_progress_advisor_select" on public.advisor_cap_progress;
create policy "advisor_cap_progress_advisor_select"
  on public.advisor_cap_progress for select
  to authenticated
  using (
    exists (
      select 1
      from public.advisors a
      where a.id = advisor_cap_progress.advisor_id
        and a.profile_id = auth.uid()
    )
  );

drop policy if exists "payment_records_admin_manage" on public.payment_records;
create policy "payment_records_admin_manage"
  on public.payment_records for all
  to authenticated
  using (public.is_ocean_admin())
  with check (public.is_ocean_admin());

drop policy if exists "payment_records_advisor_select" on public.payment_records;
create policy "payment_records_advisor_select"
  on public.payment_records for select
  to authenticated
  using (
    exists (
      select 1
      from public.transactions t
      join public.advisors a on a.id = t.advisor_id
      where t.id = payment_records.transaction_id
        and a.profile_id = auth.uid()
    )
  );

insert into public.commission_rules (
  name,
  model,
  advisor_percentage,
  office_percentage,
  referral_percentage,
  cap_enabled,
  annual_cap_usd,
  post_cap_own_office_percentage,
  post_cap_office_generated_percentage,
  metadata
) values
  (
    'Ocean Core',
    'core',
    50,
    50,
    10,
    false,
    null,
    null,
    null,
    '{"description":"Ocean Core danışman ve ofis payı"}'::jsonb
  ),
  (
    'Ocean Elite',
    'elite',
    80,
    20,
    10,
    true,
    50000,
    0,
    5,
    '{"description":"Ocean Elite tavanlı danışman modeli"}'::jsonb
  )
on conflict (model) do update
  set name = excluded.name,
      advisor_percentage = excluded.advisor_percentage,
      office_percentage = excluded.office_percentage,
      referral_percentage = excluded.referral_percentage,
      cap_enabled = excluded.cap_enabled,
      annual_cap_usd = excluded.annual_cap_usd,
      post_cap_own_office_percentage = excluded.post_cap_own_office_percentage,
      post_cap_office_generated_percentage = excluded.post_cap_office_generated_percentage,
      is_active = true,
      updated_at = now();

revoke all on public.transactions from anon;
revoke all on public.commission_splits from anon;
revoke all on public.commission_rules from anon;
revoke all on public.advisor_cap_progress from anon;
revoke all on public.payment_records from anon;

grant select, insert, update, delete on public.transactions to authenticated;
grant select, insert, update, delete on public.commission_splits to authenticated;
grant select, insert, update, delete on public.commission_rules to authenticated;
grant select, insert, update, delete on public.advisor_cap_progress to authenticated;
grant select, insert, update, delete on public.payment_records to authenticated;
