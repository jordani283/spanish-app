# Camino B2 Web App

Next.js PWA frontend for Spanish B1->B2 training.

## Features

- Email magic link auth with Supabase
- Vocabulary capture with AI enrichment
- Date-range review sessions with retry-until-correct behavior
- Grammar drills with typed answers and hint escalation
- Dashboard metrics for progress, retention, and weak areas

## Environment

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Required variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `OPENAI_API_KEY` (optional but needed for AI enrichment)

## Run locally

```bash
npm install
npm run dev
```

## Deploy

1. Create a Supabase project.
2. Run SQL from `../supabase/migrations/001_initial_schema.sql`.
3. Deploy `web/` to Vercel.
4. Add environment variables in Vercel project settings.
5. Open deployed URL on iPhone Safari and use **Add to Home Screen**.

## Seed the 500 verbs into your account

1. Ensure `../verbs1-500-spain-final.csv` exists.
2. Set environment values locally (`.env.local`) including `SUPABASE_SERVICE_ROLE_KEY`.
3. Run one of:

```bash
# by email (recommended)
npm run seed:verbs -- --email "you@example.com"

# or by user id
npm run seed:verbs -- --user-id "YOUR_SUPABASE_USER_ID"
```

By default it replaces prior seeded rows (`source_context = seed_b1_b2_core`) for that user.
Add `--append` to keep existing seeded rows and add on top.
