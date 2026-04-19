# Quickstart: Expense Tracker App (Local Development)

**Date**: 2026-04-19
**Target**: Developer setting up the project locally for the first time.

---

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | 20 LTS | [nodejs.org](https://nodejs.org) or `nvm install 20` |
| npm | 10+ | Bundled with Node.js |
| Supabase CLI | latest | `brew install supabase/tap/supabase` |
| Docker Desktop | latest | Required by Supabase local stack |
| Git | any | Pre-installed on macOS/Linux |

---

## 1. Clone & Install

```bash
git clone <repo-url> expense-tracker
cd expense-tracker
npm install
```

---

## 2. Start Supabase Locally

```bash
supabase start
```

This starts a local Supabase stack (PostgreSQL, Auth, Storage, Studio) via Docker.
On first run, Docker images are pulled — this may take a few minutes.

When ready, the CLI prints the local service URLs and keys:
```
API URL:    http://127.0.0.1:54321
anon key:   eyJh...
service_role key: eyJh...
DB URL:     postgresql://postgres:postgres@127.0.0.1:54322/postgres
Studio URL: http://127.0.0.1:54323
```

**Keep these values — you'll need them for the `.env.local` file.**

---

## 3. Apply Migrations & Seed

```bash
supabase db reset
```

`db reset` drops, re-creates, applies all migrations in `supabase/migrations/` in
order, and runs `supabase/seed.sql`. Run this any time you want a clean local DB.

To apply only new migrations without resetting:
```bash
supabase db push
```

---

## 4. Generate TypeScript Types

```bash
npx supabase gen types typescript --local > lib/types/database.ts
```

Re-run this command whenever you change the database schema. The generated file
**must not** be manually edited — it is overwritten on each run.

---

## 5. Configure Environment Variables

Copy the example env file and fill in the values from Step 2:

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key from step 2>
```

> **Never commit `.env.local`** — it is in `.gitignore`.

---

## 6. Start the Dev Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You will be redirected to
`/sign-in`. Create an account using the sign-up form — the local Supabase Auth
instance does not send real emails, so email confirmation is automatically confirmed
in local mode (or can be disabled in `supabase/config.toml`).

---

## 7. Run Tests

```bash
# Unit + integration tests (Vitest)
npm run test

# Watch mode
npm run test:watch

# E2E tests (Playwright) — requires dev server running
npm run test:e2e

# Type check
npx tsc --noEmit
```

---

## 8. Common Local Development Commands

| Task | Command |
|------|---------|
| Reset local DB | `supabase db reset` |
| Open Supabase Studio | `open http://localhost:54323` |
| Regenerate DB types | `npx supabase gen types typescript --local > lib/types/database.ts` |
| Stop Supabase stack | `supabase stop` |
| View Supabase logs | `supabase logs` |
| Lint | `npm run lint` |
| Format | `npm run format` |

---

## 9. Project Scripts (`package.json`)

| Script | Purpose |
|--------|---------|
| `dev` | Start Next.js dev server on port 3000 |
| `build` | Production build |
| `start` | Start production server (after build) |
| `lint` | ESLint |
| `format` | Prettier |
| `test` | Vitest run |
| `test:watch` | Vitest watch |
| `test:e2e` | Playwright E2E |
| `test:e2e:ui` | Playwright with UI mode |

---

## 10. Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase project URL (public) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase anon/public API key (public) |

> **Note**: The service role key (`SUPABASE_SERVICE_ROLE_KEY`) is NOT used by the
> application. All operations use the anon key + RLS for security. Do not add the
> service role key to the app environment.

---

## 11. Deploying to Vercel + Supabase Cloud

1. Create a Supabase project at [supabase.com](https://supabase.com).
2. Push migrations: `supabase db push --project-ref <project-ref>`.
3. Import the project into Vercel from GitHub.
4. Add the two environment variables (`NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`) in the Vercel dashboard under Project → Settings
   → Environment Variables.
5. Deploy — Vercel auto-deploys on pushes to `main`.
