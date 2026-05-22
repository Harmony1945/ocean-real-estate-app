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

The app currently does not require production environment variables. Do not commit real `.env` files or production secrets. If future integrations require secrets, add placeholder names to `.env.example` and configure the real values in Vercel Project Settings.
