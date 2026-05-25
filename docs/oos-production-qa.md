# OOS Production QA

## Auth Flow

- Sign up with email/password and complete the advisor profile.
- Log out and log back in.
- Confirm Google OAuth still starts when configured.

## Dashboard

- Confirm the Supabase setup card appears only when env vars or tables are missing.
- Confirm real users with no rows see zero metrics and empty states.
- Confirm demo data appears only when Supabase is not configured.

## Portfolios

- Create a portfolio with a title.
- Edit the portfolio.
- Delete the portfolio.
- Confirm blank title records are blocked.

## Requests

- Create a request with title and location.
- Edit the request.
- Close and delete the request.
- Confirm blank title/location records are blocked.

## Tasks

- Create a task.
- Toggle done.
- Delete the task.

## Payments

- Open `/menu/payments`.
- Confirm Ocean Elite shows 6.000 TL + KDV, 1.200 TL KDV, and 7.200 TL total.
- Click `Ödeme Seç` and confirm only the iyzico pending notice appears.
- Confirm no card data is submitted or stored.

## Map

- Open `/menu/map`.
- Confirm the map loads or the fallback list appears.
- Confirm portfolios with missing coordinates appear under `Konumu eksik portföyler`.
- Confirm approximate district locations are labeled.

## Theme

- Toggle light/dark mode on auth, dashboard, menu, map, and payments.
- Confirm dark mode stays black/near-black.

## Mobile Navigation

- Confirm bottom navigation remains Ana Sayfa, Portföyler, Arayışlar, Menü.
- Confirm menu routes open real pages.

## Supabase Setup

- Confirm Vercel env vars are set.
- Confirm migrations are applied.
- Confirm RLS policies are active.

## Vercel Deployment

- Redeploy after env var or migration changes.
- Smoke test auth, dashboard, portfolios, requests, tasks, map, and payments on the deployed URL.
