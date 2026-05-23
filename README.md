# ocean-real-estate-app

Mobile-first real estate operating system for Ocean Real Estate advisors, portfolios, client requests, matching, CRM, and deal management.

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

Ocean uses a free-tier-friendly foundation: Vercel free tier for hosting and Supabase free tier for Auth, Postgres, and advisor profile records. No paid auth, CRM, analytics, realtime, storage, or background job services are included in this stage.

### 1. Create Supabase Project

Create a project in Supabase and keep it on the free tier while the app is early-stage. This PR only uses Supabase Auth and a lean `profiles` table.

### 2. Environment Variables

Create `.env.local` locally and add the same variables in Vercel Project Settings:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

`.env.example` contains placeholders only. Do not commit real values.

### 3. Run Migration

Apply `supabase/migrations/202605230001_create_profiles.sql` in Supabase. It creates the `profiles` table, enables RLS, allows authenticated users to read/insert/update only their own profile, and creates a trigger for new Supabase Auth users.

### 4. Enable Google OAuth

In Supabase Dashboard, go to Authentication → Providers → Google, then add the Google Client ID and Secret from Google Cloud Console. Do not hardcode Google credentials in this repo.

Add redirect URLs for local and production, for example:

```text
http://localhost:3000
http://127.0.0.1:3030
https://your-vercel-domain.vercel.app
```

Also add the matching Supabase callback URL in Google Cloud Console.

### 5. Free-Tier Sustainability Notes

This foundation intentionally stays lean:

- no portfolio database yet
- no matching engine database yet
- no CRM database yet
- no admin panel yet
- no realtime subscriptions yet
- no paid services yet
- no storage or file upload changes yet

The auth gate is intentionally isolated so future paid growth can add role-based permissions, advisor profile management, and database-backed portfolios without rewriting the app shell.
