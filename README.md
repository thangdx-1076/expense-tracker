# Expense Tracker

A full-stack personal finance web app built with **Next.js 14** and **Supabase**. Track income and expenses, organise by category, visualise monthly spending, and export transactions to CSV — all behind email/password authentication with per-user data isolation.

---

## Features

- **Authentication** — Sign up / sign in / sign out with email and password
- **Transactions** — Create, view, edit, and delete income & expense records
- **Categories** — Custom categories with rename and safe-delete (blocks if transactions exist)
- **Dashboard** — Monthly summary cards (income, expenses, net balance) + category breakdown donut chart with configurable date range
- **CSV Export** — Download any filtered transaction view as a CSV file
- **Filters** — Filter transactions by date range and category; filters apply to both the list and the CSV export
- **Responsive UI** — Mobile-first layout with hamburger navigation
- **Toast notifications** — In-app feedback for all create/update/delete actions

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Next.js 14](https://nextjs.org) (App Router, Server Components, Server Actions) |
| Language | TypeScript 5 (strict mode) |
| Database & Auth | [Supabase](https://supabase.com) (PostgreSQL + Row-Level Security) |
| Supabase client | `@supabase/ssr` + `@supabase/supabase-js` |
| Styling | Tailwind CSS |
| Forms | `react-hook-form` + `zod` + `@hookform/resolvers` |
| Charts | Recharts |
| Testing | Vitest + Playwright |

---

## Project Structure

```
app/
├── (auth)/               # Public routes (sign-in, sign-up)
├── (protected)/          # Authenticated routes (dashboard, transactions, categories)
├── error.tsx             # Global error boundary
├── not-found.tsx         # Custom 404 page
├── layout.tsx            # Root layout (Inter font, Tailwind base)
└── page.tsx              # Root redirect (/ → /dashboard or /sign-in)

components/
├── auth/                 # SignInForm, SignUpForm
├── categories/           # CategoryList, CategoryRow, CategoryForm
├── dashboard/            # SummaryCards, CategoryBreakdownChart, DateRangeFilter
├── transactions/         # TransactionList, TransactionRow, TransactionForm,
│                         # TransactionFilters, ExportCsvButton, TransactionsPageContent
└── ui/                   # Button, Input, Label, FormError, Modal, Toast, NavBar

lib/
├── actions/              # Server Actions: auth, transactions, categories, dashboard
├── supabase/             # server.ts (SSR client), client.ts (browser client)
└── types/                # ActionResult<T>, ActionError, database.ts (generated)

supabase/
├── migrations/           # SQL migrations: categories, transactions tables + RLS
└── seed.sql              # Dev seed: 2 test users, categories, transactions

middleware.ts             # Session refresh + route protection
```

---

## Getting Started

### Prerequisites

| Tool | Version |
|------|---------|
| Node.js | 20 LTS (`cat .nvmrc`) |
| npm | 10+ |
| Supabase CLI | latest (`brew install supabase/tap/supabase`) |
| Docker Desktop | latest (required by Supabase local stack) |

### 1. Clone and install

```bash
git clone https://github.com/thangdx-1076/expense-tracker.git
cd expense-tracker
npm install
```

### 2. Start Supabase locally

```bash
npx supabase start
```

On first run this pulls Docker images — takes a few minutes. When ready, the CLI prints local service URLs and keys:

```
API URL:  http://127.0.0.1:54321
anon key: eyJh...
DB URL:   postgresql://postgres:postgres@127.0.0.1:54322/postgres
```

### 3. Apply migrations and seed data

```bash
npx supabase db reset
```

This drops, recreates, applies all migrations, and runs `supabase/seed.sql` (2 test users, sample categories and transactions).

### 4. Configure environment variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with the values from step 2:

```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key from step 2>
```

> `.env.local` is in `.gitignore` — never commit it.

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You will be redirected to `/sign-in`.

**Seed test accounts:**

| Email | Password |
|-------|----------|
| `user1@example.com` | `password123` |
| `user2@example.com` | `password456` |

---

## Available Scripts

```bash
npm run dev        # Start Next.js dev server (http://localhost:3000)
npm run build      # Production build
npm run start      # Start production server
npm run lint       # ESLint
npm run format     # Prettier (write)
npm run test       # Vitest (unit tests)
```

---

## Database Schema

### `categories`

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` | Primary key |
| `user_id` | `uuid` | References `auth.users`, RLS-filtered |
| `name` | `text` | Unique per user, max 50 chars |
| `created_at` | `timestamptz` | Auto-set |

### `transactions`

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` | Primary key |
| `user_id` | `uuid` | References `auth.users`, RLS-filtered |
| `category_id` | `uuid` | References `categories` |
| `amount` | `numeric(12,2)` | Positive |
| `date` | `date` | Transaction date |
| `description` | `text` | Max 255 chars |
| `type` | `text` | `'income'` or `'expense'` |
| `created_at` | `timestamptz` | Auto-set |

Row-Level Security is enabled on both tables with `auth.uid() = user_id` policies for all four operations (SELECT, INSERT, UPDATE, DELETE).

---

## Architecture Notes

- **Server Components by default** — pages are Server Components that fetch data server-side.
- **Client Components** only where interactivity requires it: forms, modals, filters, charts, toasts.
- **Server Actions** (`'use server'`) handle all mutations; each validates the session with `supabase.auth.getUser()` before any DB operation.
- **`ActionResult<T>` pattern** — all Server Actions return `{ success: true; data: T } | { success: false; error: ActionError }` for type-safe error handling without throwing.
- **Supabase SSR client** (`lib/supabase/server.ts`) is synchronous and reads/writes cookies via `next/headers`.

---

## Regenerating Database Types

After any schema change:

```bash
npx supabase gen types typescript --local > lib/types/database.ts
```

Do not manually edit `lib/types/database.ts` — it is overwritten on each run.

---

## User Guide

See [USER_GUIDE.md](USER_GUIDE.md) for end-user documentation covering sign-up, categories, transactions, the dashboard, CSV export, and troubleshooting.

---

## License

MIT
