# Implementation Plan: Expense Tracker App

**Branch**: `001-expense-tracker-app` | **Date**: 2026-04-19 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `specs/001-expense-tracker-app/spec.md`

## Summary

Build a full-stack personal expense tracker web application using Next.js 14 (App
Router) and Supabase. Users authenticate with email/password, record income and
expense transactions assigned to custom categories, view a filterable spending
dashboard with per-category breakdown, and export transactions to CSV. All user data
is strictly isolated via Supabase Row-Level Security. The application is deployed on
Vercel with Supabase Cloud as the backend.

## Technical Context

**Language/Version**: TypeScript 5.x / Node.js 20 LTS  
**Primary Dependencies**: Next.js 14+ (App Router), `@supabase/ssr`, `@supabase/supabase-js`, Tailwind CSS, Recharts, Vitest, Playwright  
**Storage**: Supabase PostgreSQL — `categories` and `transactions` tables, RLS on both  
**Testing**: Vitest (unit + integration) + Playwright (E2E)  
**Target Platform**: Web (Vercel); modern browsers — last 2 major versions of Chrome, Firefox, Safari, Edge  
**Project Type**: Full-stack web application (Next.js monorepo — single project)  
**Performance Goals**: Dashboard load < 3 s; CSV export of 1,000 rows begins downloading < 10 s; transaction record UX < 30 s end-to-end  
**Constraints**: Auth-required for all routes; RLS `auth.uid() = user_id` on every user-data table; mobile-responsive (Tailwind); single currency; no bulk import; no recurring transactions in v1  
**Scale/Scope**: Multi-user (isolated per RLS), ~4 primary screens, ~2 core tables, v1 single-tenant deployment

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design — see bottom of plan.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Next.js App Router First | ✅ PASS | All routes in `app/`; Server Components by default; Client Components only for interactive forms and real-time updates |
| II. Supabase as Single Backend | ✅ PASS | `@supabase/ssr` + `@supabase/supabase-js` only; no ORM, no alternate auth libraries |
| III. Authentication-First Data Isolation | ✅ PASS | RLS `auth.uid() = user_id` on `categories` and `transactions`; every Server Action validates session before DB operation |
| IV. TypeScript Strict Mode | ✅ PASS | `strict: true` in tsconfig; database types from `supabase gen types typescript`; no implicit `any` |
| V. Simplicity & Incremental Delivery | ✅ PASS | 4 independently deliverable user stories; no speculative features; YAGNI enforced |

**Pre-design result: ALL GATES PASS — proceed to Phase 0**

## Project Structure

### Documentation (this feature)

```text
specs/001-expense-tracker-app/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── server-actions.md
└── tasks.md             # Phase 2 output (/speckit.tasks — NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
app/
├── (auth)/
│   ├── sign-in/
│   │   └── page.tsx
│   └── sign-up/
│       └── page.tsx
├── (protected)/
│   ├── layout.tsx              # Session guard — redirects unauthenticated users
│   ├── dashboard/
│   │   └── page.tsx
│   ├── transactions/
│   │   └── page.tsx
│   └── categories/
│       └── page.tsx
├── layout.tsx                  # Root layout (fonts, Tailwind, Supabase provider)
└── page.tsx                    # Root redirect → /dashboard or /sign-in

components/
├── ui/                         # Generic: Button, Input, Modal, Select, DateRangePicker
├── transactions/               # TransactionList, TransactionForm, TransactionRow
├── categories/                 # CategoryList, CategoryForm
└── dashboard/                  # SummaryCards, CategoryBreakdownChart, DateRangeFilter

lib/
├── supabase/
│   ├── client.ts               # Browser Supabase client (singleton)
│   ├── server.ts               # Server Supabase client (cookie-based, per-request)
│   └── middleware.ts           # Session refresh helper for Next.js middleware
├── actions/
│   ├── transactions.ts         # Server Actions: createTransaction, updateTransaction, deleteTransaction, exportTransactionsCsv
│   └── categories.ts           # Server Actions: createCategory, updateCategory, deleteCategory
└── types/
    └── database.ts             # Auto-generated from `supabase gen types typescript`

middleware.ts                   # Next.js root middleware — session refresh on every request

supabase/
├── migrations/
│   ├── 20260419000001_create_categories.sql
│   └── 20260419000002_create_transactions.sql
└── seed.sql                    # Development seed data

tests/
├── unit/                       # Vitest unit tests (lib/actions, data transforms)
├── integration/                # Vitest integration tests (Server Actions with test DB)
└── e2e/                        # Playwright E2E tests (full user journeys)
```

**Structure Decision**: Single Next.js project (monorepo) at repository root. Next.js
handles both the frontend UI (React Server Components + Client Components) and the
server-side logic (Server Actions, middleware). Supabase is the external BaaS — there
is no separate backend service. This keeps the repository simple and aligns with
Principle V (Simplicity). The `(auth)` and `(protected)` route groups are Next.js App
Router conventions for layout segmentation — not separate applications.

## Complexity Tracking

> No Constitution Check violations — this section intentionally left empty.

---

## Constitution Check — Post-Design Re-evaluation

*Re-evaluated after Phase 1 artifacts: data-model.md, contracts/server-actions.md, quickstart.md*

| Principle | Status | Design Evidence |
|-----------|--------|-----------------|
| I. Next.js App Router First | ✅ PASS | All routes in `app/(auth)/` and `app/(protected)/`; `CategoryBreakdownChart` is the only Client Component on the dashboard — justified by Recharts requirement; all data fetching in Server Components/Actions |
| II. Supabase as Single Backend | ✅ PASS | Only `@supabase/ssr` and `@supabase/supabase-js`; `react-hook-form`, `zod`, `recharts` are UI/validation libraries — not backend providers; no ORM, no alternate DB |
| III. Authentication-First Data Isolation | ✅ PASS | RLS policies defined on both `categories` and `transactions` in data-model.md; every Server Action in contracts validates session via server client before any DB call; `auth.uid() = user_id` enforced at DB level |
| IV. TypeScript Strict Mode | ✅ PASS | Types generated from Supabase schema; `ActionResult<T>` typed return; `zod` schemas provide runtime + compile-time type safety; `FilterSchema` includes `refine` for cross-field validation |
| V. Simplicity & Incremental Delivery | ✅ PASS | No repository pattern, no caching layer, no message queues; Server Actions call Supabase directly; CSV serialized manually without library; 4 user stories independently deliverable |

**Post-design result: ALL GATES PASS — no violations, no complexity justifications required**
