-- Safe OceanOS demo seed.
-- Demo records are attached to melihberkeyildiz@gmail.com when that auth user exists.
-- Existing RLS remains unchanged, so cross-user visibility depends on current policies.

create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid references auth.users(id) on delete cascade,
  portfolio_id uuid references public.portfolios(id) on delete cascade,
  property_id uuid references public.portfolios(id) on delete cascade,
  search_request_id uuid references public.search_requests(id) on delete cascade,
  match_score numeric,
  score numeric,
  status text not null default 'new',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.matches add column if not exists owner_user_id uuid references auth.users(id) on delete cascade;
alter table public.matches add column if not exists portfolio_id uuid references public.portfolios(id) on delete cascade;
alter table public.matches add column if not exists property_id uuid references public.portfolios(id) on delete cascade;
alter table public.matches add column if not exists search_request_id uuid references public.search_requests(id) on delete cascade;
alter table public.matches add column if not exists match_score numeric;
alter table public.matches add column if not exists score numeric;
alter table public.matches add column if not exists status text not null default 'new';
alter table public.matches add column if not exists created_at timestamptz not null default now();
alter table public.matches add column if not exists updated_at timestamptz not null default now();

alter table public.matches enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'matches'
      and policyname = 'Users can read own matches'
  ) then
    create policy "Users can read own matches"
      on public.matches for select
      using (auth.uid() = owner_user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'matches'
      and policyname = 'Users can insert own matches'
  ) then
    create policy "Users can insert own matches"
      on public.matches for insert
      with check (auth.uid() = owner_user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'matches'
      and policyname = 'Users can update own matches'
  ) then
    create policy "Users can update own matches"
      on public.matches for update
      using (auth.uid() = owner_user_id)
      with check (auth.uid() = owner_user_id);
  end if;
end
$$;

create index if not exists matches_owner_user_id_idx on public.matches(owner_user_id);
create index if not exists matches_portfolio_id_idx on public.matches(portfolio_id);
create index if not exists matches_search_request_id_idx on public.matches(search_request_id);

do $$
declare
  demo_user_id uuid;
begin
  select id
    into demo_user_id
    from auth.users
    where lower(email) = 'melihberkeyildiz@gmail.com'
    limit 1;

  if demo_user_id is null then
    raise notice 'OceanOS demo seed skipped: melihberkeyildiz@gmail.com auth user not found.';
    return;
  end if;

  insert into public.portfolios (
    id,
    owner_user_id,
    title,
    location,
    district,
    owner,
    value,
    stage,
    contract_type,
    next_move,
    risk,
    commission_rate,
    commission,
    property_type,
    area,
    rooms,
    description,
    latitude,
    longitude
  )
  values
    (
      '10000000-0000-4000-8000-000000000101',
      demo_user_id,
      'Acarkent B Tipi Villa',
      'Beykoz / Acarkent',
      'Beykoz',
      'OceanOS Demo',
      125000000,
      'Yeni',
      'Satışa Aracılık',
      'Yetki ve lokasyon teyidi',
      'Düşük',
      2,
      2500000,
      'Villa',
      '420',
      '4+1',
      'Demo kayıt: Beykoz villa arayışları için güvenli örnek portföy.',
      41.1323,
      29.0924
    ),
    (
      '10000000-0000-4000-8000-000000000102',
      demo_user_id,
      'Çubuklu Deniz Manzaralı Daire',
      'Beykoz / Çubuklu',
      'Beykoz',
      'OceanOS Demo',
      68000000,
      'Yeni',
      'Satışa Aracılık',
      'Sunum dosyası hazırlanacak',
      'Orta',
      2,
      1360000,
      'Daire',
      '210',
      '3+1',
      'Demo kayıt: Boğaz manzaralı daire arayışları için örnek fırsat.',
      41.1081,
      29.0803
    ),
    (
      '10000000-0000-4000-8000-000000000103',
      demo_user_id,
      'Etiler Yatırımlık Daire',
      'Beşiktaş / Etiler',
      'Beşiktaş',
      'OceanOS Demo',
      42000000,
      'Yeni',
      'Satışa Aracılık',
      'Kira getirisi analizi',
      'Düşük',
      2,
      840000,
      'Daire',
      '145',
      '2+1',
      'Demo kayıt: yatırım amaçlı Etiler talepleri için örnek portföy.',
      41.0871,
      29.0355
    ),
    (
      '10000000-0000-4000-8000-000000000104',
      demo_user_id,
      'Sarıyer Yatırımlık Arsa',
      'Sarıyer / Zekeriyaköy',
      'Sarıyer',
      'OceanOS Demo',
      95000000,
      'Yeni',
      'Satışa Aracılık',
      'İmar notları kontrolü',
      'Orta',
      2,
      1900000,
      'Arsa',
      '1250',
      'Arsa',
      'Demo kayıt: Sarıyer arsa arayışları için örnek yatırım fırsatı.',
      41.1663,
      29.0501
    )
  on conflict (id) do update
    set owner_user_id = excluded.owner_user_id,
        title = excluded.title,
        location = excluded.location,
        district = excluded.district,
        owner = excluded.owner,
        value = excluded.value,
        stage = excluded.stage,
        contract_type = excluded.contract_type,
        next_move = excluded.next_move,
        risk = excluded.risk,
        commission_rate = excluded.commission_rate,
        commission = excluded.commission,
        property_type = excluded.property_type,
        area = excluded.area,
        rooms = excluded.rooms,
        description = excluded.description,
        latitude = excluded.latitude,
        longitude = excluded.longitude,
        updated_at = now();

  insert into public.search_requests (
    id,
    owner_user_id,
    title,
    location,
    property_type,
    min_price,
    max_price,
    currency,
    min_bedrooms,
    min_area,
    max_area,
    rooms,
    purpose,
    urgency,
    notes,
    status
  )
  values
    (
      '20000000-0000-4000-8000-000000000201',
      demo_user_id,
      'Beykoz 4+1 Villa Arayışı',
      'Beykoz',
      'Villa',
      90000000,
      140000000,
      'TRY',
      4,
      300,
      550,
      '4+1',
      'Satın Alma',
      'Acil',
      'Demo kayıt: müşteri kimliği içermeyen güvenli arayış özeti.',
      'Aktif'
    ),
    (
      '20000000-0000-4000-8000-000000000202',
      demo_user_id,
      'Boğaz Manzaralı Daire Arayışı',
      'Beykoz',
      'Daire',
      45000000,
      75000000,
      'TRY',
      3,
      160,
      260,
      '3+1',
      'Satın Alma',
      'Normal',
      'Demo kayıt: deniz manzarası öncelikli daire arayışı.',
      'Aktif'
    ),
    (
      '20000000-0000-4000-8000-000000000203',
      demo_user_id,
      'Etiler Yatırımlık Daire Arayışı',
      'Etiler',
      'Daire',
      30000000,
      50000000,
      'TRY',
      2,
      100,
      180,
      '2+1',
      'Yatırım',
      'Normal',
      'Demo kayıt: kira getirisi odaklı yatırım arayışı.',
      'Aktif'
    ),
    (
      '20000000-0000-4000-8000-000000000204',
      demo_user_id,
      'Sarıyer Arsa Arayışı',
      'Sarıyer',
      'Arsa',
      70000000,
      120000000,
      'TRY',
      0,
      800,
      1800,
      'Arsa',
      'Yatırım',
      'Düşük',
      'Demo kayıt: imar potansiyeli olan arsa arayışı.',
      'Aktif'
    )
  on conflict (id) do update
    set owner_user_id = excluded.owner_user_id,
        title = excluded.title,
        location = excluded.location,
        property_type = excluded.property_type,
        min_price = excluded.min_price,
        max_price = excluded.max_price,
        currency = excluded.currency,
        min_bedrooms = excluded.min_bedrooms,
        min_area = excluded.min_area,
        max_area = excluded.max_area,
        rooms = excluded.rooms,
        purpose = excluded.purpose,
        urgency = excluded.urgency,
        notes = excluded.notes,
        status = excluded.status,
        updated_at = now();

  insert into public.matches (
    id,
    owner_user_id,
    portfolio_id,
    property_id,
    search_request_id,
    match_score,
    score,
    status
  )
  values (
    '30000000-0000-4000-8000-000000000301',
    demo_user_id,
    '10000000-0000-4000-8000-000000000101',
    '10000000-0000-4000-8000-000000000101',
    '20000000-0000-4000-8000-000000000201',
    92,
    92,
    'new'
  )
  on conflict (id) do update
    set owner_user_id = excluded.owner_user_id,
        portfolio_id = excluded.portfolio_id,
        property_id = excluded.property_id,
        search_request_id = excluded.search_request_id,
        match_score = excluded.match_score,
        score = excluded.score,
        status = excluded.status,
        updated_at = now();
end
$$;
