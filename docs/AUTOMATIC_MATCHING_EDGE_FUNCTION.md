# Automatic Matching Edge Function

## Purpose

`generate-property-matches` compares active public `properties` with active `search_requests` and creates or updates rows in `matches` when the calculated score is at least 60.

The function is intended for server-side Supabase execution. It uses `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` from the Supabase Edge Function runtime and does not expose the service role key to the frontend.

## Deployment

```bash
supabase functions deploy generate-property-matches
```

## Local Test

```bash
supabase functions serve generate-property-matches --env-file .env.local
```

Do not commit local env files or service role keys.

## Dry Run Example

```bash
curl -X POST "$SUPABASE_URL/functions/v1/generate-property-matches" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"dry_run":true}'
```

## Targeted Run Example

```bash
curl -X POST "$SUPABASE_URL/functions/v1/generate-property-matches" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"property_id":"10000000-0000-4000-8000-000000000101","dry_run":false}'
```

Optional request body:

```json
{
  "property_id": "optional uuid",
  "search_request_id": "optional uuid",
  "dry_run": false
}
```

## Scoring

The score is capped at 100 and uses these V1 criteria:

* Same city: +15
* District match: +25
* City fallback when no districts are provided: +10
* Property type match: +20
* Price compatibility: +25 for full budget range, +15 for max-only, +10 for min-only
* Area compatibility: +10
* Simple keyword overlap: +5

## Write Behavior

* Matches below 60 are not inserted.
* Existing `new` or `pending` matches are updated with the latest score and reasons.
* Reviewed, closed, rejected, accepted, contacted, viewed, or deal-started matches are skipped.
* `reviewed_at` is never overwritten.
* The function checks existing rows before inserting so it does not intentionally create duplicate `property_id` and `search_request_id` pairs.

## Production Safety Notes

* The function reads opportunity data only from active public properties and active search requests.
* It does not create deals or commissions.
* It does not change RLS policies.
* It does not expose private client identity fields in the response.
* `dry_run: true` returns calculated matches without writing to the database.
