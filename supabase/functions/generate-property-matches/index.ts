import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

type MatchRequestBody = {
  property_id?: string;
  search_request_id?: string;
  dry_run?: boolean;
};

type PropertyRow = {
  id: string;
  advisor_id: string | null;
  title: string | null;
  property_type: string | null;
  usage_type: string | null;
  city: string | null;
  district: string | null;
  neighborhood: string | null;
  gross_area: number | null;
  net_area: number | null;
  asking_price: number | null;
  currency: string | null;
  status: string | null;
  is_public: boolean | null;
};

type SearchRequestRow = {
  id: string;
  advisor_id: string | null;
  client_id: string | null;
  request_type: string | null;
  city: string | null;
  districts: string[] | string | null;
  property_types: string[] | string | null;
  min_price: number | null;
  max_price: number | null;
  currency: string | null;
  min_area: number | null;
  max_area: number | null;
  rooms: string | null;
  commercial_or_residential: string | null;
  must_have_features: string[] | string | null;
  nice_to_have_features: string[] | string | null;
  urgency: string | null;
  financing_status: string | null;
  notes: string | null;
  status: string | null;
};

type ExistingMatchRow = {
  id: string;
  property_id: string | null;
  search_request_id: string | null;
  status: string | null;
  reviewed_at: string | null;
};

type MatchResult = {
  property_id: string;
  search_request_id: string;
  score: number;
  reasons: Record<string, string>;
};

const MATCH_THRESHOLD = 60;
const ACTIVE_STATUSES = ["active", "Aktif"];
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MUTABLE_MATCH_STATUSES = new Set(["new", "pending"]);
const LOCKED_MATCH_STATUSES = new Set(["viewed", "contacted", "accepted", "rejected", "deal_started", "closed"]);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return jsonResponse({ ok: false, error: "Method not allowed." }, 405);
  }

  try {
    const body = await readJsonBody(request);
    const propertyId = body.property_id?.trim();
    const searchRequestId = body.search_request_id?.trim();
    const dryRun = body.dry_run === true;

    if (propertyId && !UUID_PATTERN.test(propertyId)) {
      return jsonResponse({ ok: false, error: "Invalid property_id." }, 400);
    }

    if (searchRequestId && !UUID_PATTERN.test(searchRequestId)) {
      return jsonResponse({ ok: false, error: "Invalid search_request_id." }, 400);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")?.replace(/\/$/, "");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      return jsonResponse({ ok: false, error: "Supabase runtime environment is not configured." }, 500);
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false }
    });

    const [propertiesResult, requestsResult] = await Promise.all([
      loadProperties(supabase, propertyId),
      loadSearchRequests(supabase, searchRequestId)
    ]);

    if (propertiesResult.error) throw new Error(propertiesResult.error.message);
    if (requestsResult.error) throw new Error(requestsResult.error.message);

    const properties = propertiesResult.data ?? [];
    const searchRequests = requestsResult.data ?? [];
    const calculatedMatches = calculateMatches(properties, searchRequests);
    let created = 0;
    let updated = 0;
    let skipped = properties.length * searchRequests.length - calculatedMatches.length;

    if (!dryRun && calculatedMatches.length > 0) {
      const existingMatches = await loadExistingMatches(
        supabase,
        properties.map((property) => property.id),
        searchRequests.map((searchRequest) => searchRequest.id)
      );

      if (existingMatches.error) throw new Error(existingMatches.error.message);

      const existingByPair = new Map<string, ExistingMatchRow>();

      for (const match of existingMatches.data ?? []) {
        if (match.property_id && match.search_request_id) {
          existingByPair.set(pairKey(match.property_id, match.search_request_id), match);
        }
      }

      for (const match of calculatedMatches) {
        const property = properties.find((item) => item.id === match.property_id);
        const searchRequest = searchRequests.find((item) => item.id === match.search_request_id);

        if (!property || !searchRequest) {
          skipped += 1;
          continue;
        }

        const existing = existingByPair.get(pairKey(match.property_id, match.search_request_id));

        if (existing) {
          const status = normalize(existing.status);

          if (existing.reviewed_at || LOCKED_MATCH_STATUSES.has(status) || !MUTABLE_MATCH_STATUSES.has(status)) {
            skipped += 1;
            continue;
          }

          const { error } = await supabase
            .from("matches")
            .update({
              match_score: match.score,
              match_reasons: match.reasons as Record<string, JsonValue>,
              status: "new"
            })
            .eq("id", existing.id);

          if (error) throw new Error(error.message);
          updated += 1;
          continue;
        }

        const { error } = await supabase.from("matches").insert({
          property_id: match.property_id,
          search_request_id: match.search_request_id,
          property_advisor_id: property.advisor_id,
          request_advisor_id: searchRequest.advisor_id,
          match_score: match.score,
          match_reasons: match.reasons as Record<string, JsonValue>,
          status: "new",
          created_at: new Date().toISOString()
        });

        if (error) throw new Error(error.message);
        created += 1;
      }
    }

    return jsonResponse({
      ok: true,
      dry_run: dryRun,
      created,
      updated,
      skipped,
      matches: calculatedMatches
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected matching error.";
    return jsonResponse({ ok: false, error: message }, 500);
  }
});

async function readJsonBody(request: Request): Promise<MatchRequestBody> {
  if (!request.body) return {};

  try {
    return await request.json();
  } catch {
    return {};
  }
}

function loadProperties(supabase: ReturnType<typeof createClient>, propertyId?: string) {
  let query = supabase
    .from("properties")
    .select("id,advisor_id,title,property_type,usage_type,city,district,neighborhood,gross_area,net_area,asking_price,currency,status,is_public")
    .eq("is_public", true)
    .in("status", ACTIVE_STATUSES);

  if (propertyId) query = query.eq("id", propertyId);

  return query.returns<PropertyRow[]>();
}

function loadSearchRequests(supabase: ReturnType<typeof createClient>, searchRequestId?: string) {
  let query = supabase
    .from("search_requests")
    .select("id,advisor_id,client_id,request_type,city,districts,property_types,min_price,max_price,currency,min_area,max_area,rooms,commercial_or_residential,must_have_features,nice_to_have_features,urgency,financing_status,notes,status")
    .in("status", ACTIVE_STATUSES);

  if (searchRequestId) query = query.eq("id", searchRequestId);

  return query.returns<SearchRequestRow[]>();
}

function loadExistingMatches(
  supabase: ReturnType<typeof createClient>,
  propertyIds: string[],
  searchRequestIds: string[]
) {
  if (!propertyIds.length || !searchRequestIds.length) {
    return Promise.resolve({ data: [], error: null });
  }

  return supabase
    .from("matches")
    .select("id,property_id,search_request_id,status,reviewed_at")
    .in("property_id", propertyIds)
    .in("search_request_id", searchRequestIds)
    .returns<ExistingMatchRow[]>();
}

function calculateMatches(properties: PropertyRow[], searchRequests: SearchRequestRow[]) {
  const matches: MatchResult[] = [];

  for (const property of properties) {
    for (const searchRequest of searchRequests) {
      const match = scoreMatch(property, searchRequest);

      if (match.score >= MATCH_THRESHOLD) {
        matches.push({
          property_id: property.id,
          search_request_id: searchRequest.id,
          score: match.score,
          reasons: match.reasons
        });
      }
    }
  }

  return matches;
}

function scoreMatch(property: PropertyRow, searchRequest: SearchRequestRow) {
  let score = 0;
  const reasons: Record<string, string> = {};
  const sameCity = normalize(property.city) && normalize(property.city) === normalize(searchRequest.city);

  if (sameCity) {
    score += 15;
    reasons.city = `${property.city} uyumu`;
  }

  const districts = toTextArray(searchRequest.districts);

  if (districts.length > 0 && includesNormalized(districts, property.district)) {
    score += 25;
    reasons.district = `${property.district} bölgesi arayışla uyumlu`;
  } else if (districts.length === 0 && sameCity) {
    score += 10;
    reasons.district = "İlçe belirtilmediği için şehir uyumu kullanıldı";
  }

  const propertyTypes = toTextArray(searchRequest.property_types);

  if (propertyTypes.length > 0 && includesNormalized(propertyTypes, property.property_type)) {
    score += 20;
    reasons.type = `${property.property_type} tipi arayışla uyumlu`;
  }

  const priceScore = scorePrice(property.asking_price, searchRequest.min_price, searchRequest.max_price);

  if (priceScore > 0) {
    score += priceScore;
    reasons.price = priceScore === 25 ? "Fiyat bütçe aralığında" : "Fiyat bütçe beklentisiyle uyumlu";
  }

  if (isAreaCompatible(property.net_area ?? property.gross_area, searchRequest.min_area, searchRequest.max_area)) {
    score += 10;
    reasons.area = "Alan beklenti aralığında";
  }

  if (hasKeywordOverlap(property, searchRequest)) {
    score += 5;
    reasons.features = "Özellik ve notlarda ortak ifadeler var";
  }

  return { score: Math.min(score, 100), reasons };
}

function scorePrice(price: number | null, minPrice: number | null, maxPrice: number | null) {
  if (!price) return 0;
  if (minPrice && maxPrice && price >= minPrice && price <= maxPrice) return 25;
  if (!minPrice && maxPrice && price <= maxPrice) return 15;
  if (minPrice && !maxPrice && price >= minPrice) return 10;
  return 0;
}

function isAreaCompatible(area: number | null, minArea: number | null, maxArea: number | null) {
  if (!area) return false;
  if (minArea && maxArea) return area >= minArea && area <= maxArea;
  if (!minArea && maxArea) return area <= maxArea;
  if (minArea && !maxArea) return area >= minArea;
  return false;
}

function hasKeywordOverlap(property: PropertyRow, searchRequest: SearchRequestRow) {
  const propertyTokens = tokenize([
    property.title,
    property.property_type,
    property.usage_type,
    property.city,
    property.district,
    property.neighborhood
  ]);
  const requestTokens = tokenize([
    searchRequest.must_have_features,
    searchRequest.nice_to_have_features,
    searchRequest.notes,
    searchRequest.request_type,
    searchRequest.commercial_or_residential,
    searchRequest.rooms
  ]);

  return requestTokens.some((token) => propertyTokens.has(token));
}

function tokenize(values: Array<string | string[] | null>) {
  const tokens = new Set<string>();

  for (const value of values.flatMap(toTextArray)) {
    for (const token of normalize(value).split(/\s+/)) {
      if (token.length >= 3) tokens.add(token);
    }
  }

  return tokens;
}

function toTextArray(value: string | string[] | null) {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function includesNormalized(values: string[], expected: string | null) {
  const normalizedExpected = normalize(expected);
  if (!normalizedExpected) return false;
  return values.some((value) => normalize(value) === normalizedExpected);
}

function normalize(value: string | null | undefined) {
  return (value ?? "").trim().toLocaleLowerCase("tr-TR");
}

function pairKey(propertyId: string, searchRequestId: string) {
  return `${propertyId}:${searchRequestId}`;
}

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json"
    }
  });
}
