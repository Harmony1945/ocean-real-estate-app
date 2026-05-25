# OOS

OOS means Ocean Operating System: a mobile-first real estate operating system for advisors, portfolios, client requests, matching, commissions, and deal management.

## Requirements

- Node.js 20 or newer
- npm with the committed `package-lock.json`

## Local Development

Install dependencies:

```bash
npm ci
```

Run the development server:

```bash
npm run dev
```

Run validation before opening or merging a PR:

```bash
npm run check
npm run build
```

Run the production server after building:

```bash
npm run start
```

## Vercel Deployment

This app is a standard Next.js app and can be deployed with the Vercel Next.js framework preset.

Recommended Vercel project settings:

- Framework Preset: `Next.js`
- Node.js Version: `20.x`
- Install Command: `npm ci`
- Build Command: `npm run build`
- Output Directory: leave empty / Vercel default
- Development Command: `npm run dev`

Do not commit real `.env` files or production secrets. Configure real environment variables in Vercel Project Settings.

## Free-Tier Supabase Auth Setup

OOS uses a free-tier-friendly foundation: Vercel free tier for hosting and Supabase free tier for Auth, Postgres, and advisor profile records. No paid auth, CRM, analytics, realtime, storage, or background job services are included in this stage.

### 1. Create Supabase Project

Create a project in Supabase and keep it on the free tier while the product is early-stage. This setup only uses Supabase Auth and a lean `profiles` table.

### 2. Environment Variables

Create `.env.local` locally and add the same variables in Vercel Project Settings:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

`.env.example` contains placeholders only. Do not commit real values.

### 3. Run Migration

Apply `supabase/migrations/202605230001_create_profiles.sql` in Supabase. It creates the `profiles` table, enables RLS, allows authenticated users to read/insert/update only their own profile, and creates a trigger for new Supabase Auth users.

Then apply `supabase/migrations/202605230002_lock_profile_role_updates.sql`. It keeps `profiles.role` database-controlled so advisors can complete their own profile without promoting themselves.

Then apply `supabase/migrations/202605250001_create_advisor_operations.sql`. It creates `portfolios`, `search_requests`, and `tasks` with RLS so authenticated advisors can only read, create, update, and delete their own rows.

### 4. Enable Google OAuth

In Supabase Dashboard, go to Authentication → Providers → Google, then add the Google Client ID and Secret from Google Cloud Console. Do not hardcode Google credentials in this repo.

Add redirect URLs for local and production, for example:

```text
http://localhost:3000
http://127.0.0.1:3030
https://your-vercel-domain.vercel.app
https://your-custom-domain.com
```

Also add the matching Supabase callback URL in Google Cloud Console.

### 5. Route-Backed Navigation Foundation

The mobile OOS shell uses four route-backed destinations:

- `/` → Ana Sayfa
- `/portfolios` → Portföyler
- `/requests` → Arayışlar
- `/menu` → Menü

The rightmost mobile item is now Menü. The previous rightmost notification function is preserved inside the menu as Bildirimler.

### 6. Production Auth Verification

Use this checklist after deploying auth changes:

1. In Supabase Dashboard, open Authentication → Users and confirm the new advisor appears after signup.
2. If email confirmation is enabled, confirm the advisor receives the authorization email and can log in after confirming.
3. Open Table Editor → profiles and confirm a row exists with the same `id` as the Supabase Auth user.
4. If the profile row does not appear, confirm both profile migrations were applied, then log in again and complete the in-app profile card. The app also performs a best-effort profile upsert after login/signup.
5. In Vercel Project Settings → Environment Variables, confirm `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` exist for the deployed environment, then redeploy if they were added after the latest deployment.
6. Google OAuth is optional for now. Email/password auth can run first; configure Google later in Supabase Authentication → Providers → Google.

### 7. Production Domain Checklist

Before switching the public domain to production:

1. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel.
2. Apply the Supabase profile migrations listed above.
3. Merge the production PR into `main` and let Vercel deploy from `main`.
4. Add the custom domain in Vercel Project Settings → Domains.
5. Configure DNS with the records Vercel provides.
6. Add the custom domain to Supabase Auth redirect URLs and any Google OAuth allowed redirect/origin settings.

### 8. OOS Operations Modules

- Portfolios, client requests, and tasks persist in Supabase when the public Supabase env vars are configured and the operation migration has been applied.
- If Supabase is not configured, the app keeps a mock-safe demo mode for local UI review.
- If Supabase is configured but the operation tables are missing, the UI shows a setup message instead of crashing.
- `/menu/payments` contains a mock-safe Ocean Elite card payment UI. It does not process or store card data; iyzico checkout integration is pending.
- `/menu/map` uses Leaflet with OpenStreetMap tiles as the free map foundation and falls back to approximate Istanbul district coordinates when exact portfolio coordinates are missing.
- Vercel must define `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`; no secrets should be committed.

### 9. Free-Tier Sustainability Notes

This foundation intentionally stays lean:

- no matching engine database yet
- no CRM database yet
- no admin panel yet
- no realtime subscriptions yet
- no paid services yet
- no storage or file upload changes yet

The auth and navigation shell are intentionally isolated so future growth can add role-based permissions, advisor profile management, and database-backed portfolios without rewriting the app shell.
