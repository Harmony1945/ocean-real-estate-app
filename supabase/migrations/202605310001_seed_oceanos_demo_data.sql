-- Safe OceanOS production demo seed.
-- Uses the production tables: properties, search_requests, matches, profiles.
-- Demo records are attached to the profile with email melihberkeyildiz@gmail.com.
-- Existing RLS is not changed.

do $$
declare
  demo_advisor_id uuid;
begin
  select id
    into demo_advisor_id
    from public.profiles
    where lower(email) = 'melihberkeyildiz@gmail.com'
    limit 1;

  if demo_advisor_id is null then
    raise notice 'OceanOS demo seed skipped: profile melihberkeyildiz@gmail.com not found.';
    return;
  end if;

  delete from public.matches
  where id = '30000000-0000-4000-8000-000000000301'
     or property_id in (
       '10000000-0000-4000-8000-000000000101',
       '10000000-0000-4000-8000-000000000102',
       '10000000-0000-4000-8000-000000000103',
       '10000000-0000-4000-8000-000000000104'
     )
     or search_request_id in (
       '20000000-0000-4000-8000-000000000201',
       '20000000-0000-4000-8000-000000000202',
       '20000000-0000-4000-8000-000000000203',
       '20000000-0000-4000-8000-000000000204'
     );

  delete from public.search_requests
  where id in (
       '20000000-0000-4000-8000-000000000201',
       '20000000-0000-4000-8000-000000000202',
       '20000000-0000-4000-8000-000000000203',
       '20000000-0000-4000-8000-000000000204'
     )
     or notes in (
       'OceanOS Demo: Beykoz 4+1 Villa Arayışı',
       'OceanOS Demo: Boğaz Manzaralı Daire Arayışı',
       'OceanOS Demo: Etiler Yatırımlık Daire Arayışı',
       'OceanOS Demo: Sarıyer Arsa Arayışı'
     );

  delete from public.properties
  where id in (
       '10000000-0000-4000-8000-000000000101',
       '10000000-0000-4000-8000-000000000102',
       '10000000-0000-4000-8000-000000000103',
       '10000000-0000-4000-8000-000000000104'
     )
     or title in (
       'Acarkent B Tipi Villa',
       'Çubuklu Deniz Manzaralı Daire',
       'Etiler Yatırımlık Daire',
       'Sarıyer Yatırımlık Arsa'
     );

  insert into public.properties (
    id,
    advisor_id,
    title,
    property_type,
    usage_type,
    city,
    district,
    neighborhood,
    gross_area,
    net_area,
    asking_price,
    currency,
    status,
    is_public,
    created_at,
    updated_at
  )
  values
    (
      '10000000-0000-4000-8000-000000000101',
      demo_advisor_id,
      'Acarkent B Tipi Villa',
      'Villa',
      'Konut',
      'İstanbul',
      'Beykoz',
      'Acarkent',
      420,
      360,
      125000000,
      'TRY',
      'active',
      true,
      now(),
      now()
    ),
    (
      '10000000-0000-4000-8000-000000000102',
      demo_advisor_id,
      'Çubuklu Deniz Manzaralı Daire',
      'Daire',
      'Konut',
      'İstanbul',
      'Beykoz',
      'Çubuklu',
      210,
      185,
      68000000,
      'TRY',
      'active',
      true,
      now(),
      now()
    ),
    (
      '10000000-0000-4000-8000-000000000103',
      demo_advisor_id,
      'Etiler Yatırımlık Daire',
      'Daire',
      'Konut',
      'İstanbul',
      'Beşiktaş',
      'Etiler',
      145,
      125,
      42000000,
      'TRY',
      'active',
      true,
      now(),
      now()
    ),
    (
      '10000000-0000-4000-8000-000000000104',
      demo_advisor_id,
      'Sarıyer Yatırımlık Arsa',
      'Arsa',
      'Yatırım',
      'İstanbul',
      'Sarıyer',
      'Zekeriyaköy',
      1250,
      1250,
      95000000,
      'TRY',
      'active',
      true,
      now(),
      now()
    );

  insert into public.search_requests (
    id,
    advisor_id,
    client_id,
    request_type,
    city,
    min_price,
    max_price,
    currency,
    min_area,
    max_area,
    rooms,
    commercial_or_residential,
    urgency,
    financing_status,
    notes,
    status,
    created_at
  )
  values
    (
      '20000000-0000-4000-8000-000000000201',
      demo_advisor_id,
      null,
      'Satın Alma',
      'İstanbul',
      90000000,
      140000000,
      'TRY',
      300,
      550,
      '4+1',
      'Konut',
      'Acil',
      'Hazır',
      'OceanOS Demo: Beykoz 4+1 Villa Arayışı',
      'active',
      now()
    ),
    (
      '20000000-0000-4000-8000-000000000202',
      demo_advisor_id,
      null,
      'Satın Alma',
      'İstanbul',
      45000000,
      75000000,
      'TRY',
      160,
      260,
      '3+1',
      'Konut',
      'Normal',
      'Hazır',
      'OceanOS Demo: Boğaz Manzaralı Daire Arayışı',
      'active',
      now()
    ),
    (
      '20000000-0000-4000-8000-000000000203',
      demo_advisor_id,
      null,
      'Yatırım',
      'İstanbul',
      30000000,
      50000000,
      'TRY',
      100,
      180,
      '2+1',
      'Konut',
      'Normal',
      'Hazır',
      'OceanOS Demo: Etiler Yatırımlık Daire Arayışı',
      'active',
      now()
    ),
    (
      '20000000-0000-4000-8000-000000000204',
      demo_advisor_id,
      null,
      'Yatırım',
      'İstanbul',
      70000000,
      120000000,
      'TRY',
      800,
      1800,
      'Arsa',
      'Arsa',
      'Düşük',
      'Hazır',
      'OceanOS Demo: Sarıyer Arsa Arayışı',
      'active',
      now()
    );

  insert into public.matches (
    id,
    property_id,
    search_request_id,
    property_advisor_id,
    request_advisor_id,
    match_score,
    status,
    created_at,
    reviewed_at
  )
  values (
    '30000000-0000-4000-8000-000000000301',
    '10000000-0000-4000-8000-000000000101',
    '20000000-0000-4000-8000-000000000201',
    demo_advisor_id,
    demo_advisor_id,
    92,
    'new',
    now(),
    null
  );
end
$$;
