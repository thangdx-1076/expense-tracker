---
description: "Task list for Expense Tracker App implementation"
---

# Tasks: Expense Tracker App

**Input**: Design documents from `specs/001-expense-tracker-app/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/server-actions.md ✅, quickstart.md ✅

**Tests**: Not requested — test tasks are omitted per constitution (tests are optional).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (US1–US4)
- Exact file paths are included in each description

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize the Next.js + Supabase project, tooling, and environment.

- [ ] T001 Initialize Next.js 14 project with TypeScript, Tailwind CSS, and App Router via `npx create-next-app@latest` at repository root
- [ ] T002 Install dependencies: `@supabase/ssr`, `@supabase/supabase-js`, `react-hook-form`, `zod`, `@hookform/resolvers`, `recharts`
- [ ] T003 Install dev dependencies: `vitest`, `@vitejs/plugin-react`, `playwright`, `@playwright/test`
- [ ] T004 [P] Configure `tsconfig.json` with `strict: true` and path aliases (`@/*` → `./`)
- [ ] T005 [P] Configure `vitest.config.ts` with jsdom environment and `@vitejs/plugin-react`
- [ ] T006 [P] Configure `playwright.config.ts` with base URL `http://localhost:3000` and test directory `tests/e2e/`
- [ ] T007 [P] Add npm scripts in `package.json`: `test`, `test:watch`, `test:e2e`, `test:e2e:ui`, `lint`, `format`
- [ ] T008 [P] Create `.env.local.example` with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` placeholders
- [ ] T009 [P] Add `.env.local` to `.gitignore`
- [ ] T010 [P] Create `.nvmrc` pinned to Node.js 20

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that ALL user stories depend on. Must be complete before any US phase begins.

**CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T011 Initialize Supabase project locally with `supabase init` and configure `supabase/config.toml` (disable email confirmation for local dev)
- [ ] T012 Create migration `supabase/migrations/20260419000001_create_categories.sql` with `categories` table, `(user_id, name)` unique constraint, RLS enabled, and all four RLS policies (`SELECT`, `INSERT`, `UPDATE`, `DELETE`) as specified in `data-model.md`
- [ ] T013 Create migration `supabase/migrations/20260419000002_create_transactions.sql` with `transactions` table, indexes on `(user_id, date DESC)` and `(user_id, category_id)`, RLS enabled, and all four RLS policies as specified in `data-model.md`
- [ ] T014 Create `supabase/seed.sql` with seed data: 2 test users (via `auth.users` insert), 3 categories per user, 5 transactions per user across multiple categories and date ranges
- [ ] T015 [P] Create `lib/supabase/server.ts` — server-side Supabase client using `createServerClient` from `@supabase/ssr`, reading/writing cookies via `next/headers`
- [ ] T016 [P] Create `lib/supabase/client.ts` — browser Supabase client using `createBrowserClient` from `@supabase/ssr` (singleton pattern)
- [ ] T017 Create `middleware.ts` at repository root — calls `supabase.auth.getUser()` on every request to refresh session; redirects unauthenticated users from `/(protected)/*` routes to `/sign-in`
- [ ] T018 Create `lib/types/actions.ts` — `ActionResult<T>`, `ActionError` shared types as defined in `contracts/server-actions.md`
- [ ] T019 Run `npx supabase gen types typescript --local > lib/types/database.ts` after migrations are applied (requires local Supabase running)
- [ ] T020 [P] Create `app/layout.tsx` — root layout with Tailwind CSS base styles, Inter font, and viewport meta tag
- [ ] T021 [P] Create `app/page.tsx` — root redirect: if session exists redirect to `/dashboard`, else redirect to `/sign-in`

**Checkpoint**: Foundation ready — `supabase start` works, migrations applied, types generated, middleware in place. User story implementation can now begin.

---

## Phase 3: User Story 1 — Record and Manage Transactions (Priority: P1) MVP

**Goal**: Signed-in users can create, view, edit, and delete their own transactions. Unauthenticated users are redirected to sign-in.

**Independent Test**: Sign in → Add 3 transactions (mixed income/expense) → Verify list sorted by date descending → Edit one transaction → Verify updated values in list → Delete one → Verify removal. Sign out → Visit `/transactions` → Verify redirect to `/sign-in`.

### Auth prerequisite (needed by US1 to sign in)

- [ ] T022 Create `lib/actions/auth.ts` — `signIn`, `signUp`, `signOut` Server Actions as specified in `contracts/server-actions.md`; use `zod` for input validation; call `supabase.auth.signInWithPassword`, `signUp`, `signOut` from server client
- [ ] T023 [P] Create `app/(auth)/sign-in/page.tsx` — sign-in page that renders `SignInForm` Client Component
- [ ] T024 [P] Create `app/(auth)/sign-up/page.tsx` — sign-up page that renders `SignUpForm` Client Component
- [ ] T025 [P] Create `components/ui/Button.tsx`, `components/ui/Input.tsx`, `components/ui/Label.tsx`, `components/ui/FormError.tsx` — Tailwind-styled base UI components with typed props
- [ ] T026 Create `components/auth/SignInForm.tsx` — `"use client"` form using `react-hook-form` + `zod`; calls `signIn` Server Action; displays field-level errors; redirects to `/dashboard` on success
- [ ] T027 Create `components/auth/SignUpForm.tsx` — `"use client"` form using `react-hook-form` + `zod`; calls `signUp` Server Action; displays errors; links to sign-in page

### Protected layout

- [ ] T028 Create `app/(protected)/layout.tsx` — Server Component; calls `supabase.auth.getUser()`; redirects to `/sign-in` if no session; renders navigation bar with links to `/dashboard`, `/transactions`, `/categories` and a sign-out button

### Transactions Server Action

- [ ] T029 Create `lib/actions/transactions.ts` — `createTransaction`, `updateTransaction`, `deleteTransaction` Server Actions as specified in `contracts/server-actions.md`; validate session; validate input with `TransactionSchema`; perform Supabase queries; return `ActionResult<Transaction>`

### Transactions page and components

- [ ] T030 Create `app/(protected)/transactions/page.tsx` — Server Component; reads `searchParams` for `from`, `to`, `category_id` filter params; queries Supabase for user's transactions with filters applied and `order('date', { ascending: false })`; renders `TransactionList` and `TransactionForm`
- [ ] T031 [P] [US1] Create `components/transactions/TransactionRow.tsx` — displays single transaction row (date, description, type badge, category name, amount); includes Edit and Delete action buttons
- [ ] T032 [P] [US1] Create `components/transactions/TransactionList.tsx` — renders list of `TransactionRow` components; shows empty-state message when no transactions
- [ ] T033 [US1] Create `components/transactions/TransactionForm.tsx` — `"use client"` form using `react-hook-form` + `zod` (`TransactionSchema`); fields: amount, date, description, type select, category select; calls `createTransaction` or `updateTransaction`; displays field-level errors; resets form on success
- [ ] T034 [US1] Create `components/ui/Modal.tsx` — `"use client"` accessible modal wrapper (focus trap, Escape key close, backdrop click close) used by `TransactionForm` in edit mode
- [ ] T035 [US1] Wire delete button in `components/transactions/TransactionRow.tsx` to call `deleteTransaction` Server Action with `useTransition` + `startTransition` for optimistic UI feedback

**Checkpoint**: US1 fully functional — user can sign up, sign in, add/edit/delete transactions, see list sorted by date. Independently testable.

---

## Phase 4: User Story 2 — Manage Categories (Priority: P2)

**Goal**: Signed-in users can create, rename, and delete their own categories. Deletion is blocked when transactions are assigned.

**Independent Test**: Navigate to `/categories` → Create 3 categories → Verify they appear in transaction form dropdown → Rename one → Create a transaction assigned to a category → Attempt to delete that category → Verify blocking message with count → Delete a category with no transactions → Verify removal.

### Categories Server Action

- [ ] T036 [US2] Create `lib/actions/categories.ts` — `createCategory`, `updateCategory`, `deleteCategory` Server Actions as specified in `contracts/server-actions.md`; `deleteCategory` MUST query count of transactions with matching `category_id` and return `HAS_TRANSACTIONS` error if count > 0; validate session and input with `CategorySchema`; return `ActionResult<Category>` or `ActionResult<void>`

### Categories page and components

- [ ] T037 [US2] Create `app/(protected)/categories/page.tsx` — Server Component; queries user's categories from Supabase; renders `CategoryList`
- [ ] T038 [P] [US2] Create `components/categories/CategoryRow.tsx` — displays category name; includes Rename (inline edit input) and Delete buttons; shows `HAS_TRANSACTIONS` error inline when delete is blocked
- [ ] T039 [US2] Create `components/categories/CategoryList.tsx` — renders list of `CategoryRow` components; includes inline `CategoryForm` for creating new category; shows empty-state message when no categories
- [ ] T040 [US2] Create `components/categories/CategoryForm.tsx` — `"use client"` controlled input using `react-hook-form` + `zod` (`CategorySchema`); calls `createCategory`; shows field-level error for duplicate name; resets on success
- [ ] T041 [US2] Update `components/transactions/TransactionForm.tsx` to accept a `categories` prop (array of `{ id: string; name: string }`) for populating the category `<select>` — categories fetched by the parent Server Component

**Checkpoint**: US2 fully functional — category management works independently. Category select in transaction form uses real data. Independently testable.

---

## Phase 5: User Story 3 — View Spending Dashboard (Priority: P3)

**Goal**: Signed-in users see a monthly summary (total income, total expenses, net balance, per-category chart) with a configurable date range.

**Independent Test**: Add transactions across 3 categories in current month → Visit `/dashboard` → Verify totals match manual sum → Select previous month (no data) → Verify zero-state. Change date range to span both months → Verify totals update correctly.

### Dashboard data query

- [ ] T042 [US3] Create `lib/actions/dashboard.ts` — `getDashboardSummary(filters)` Server Action; validates session; validates filters with `FilterSchema`; queries `transactions` for the given date range; computes `totalIncome`, `totalExpenses`, `netBalance`, and `categoryBreakdown` (array of `{ categoryName: string; total: number }` for expenses only); returns typed result

### Dashboard page and components

- [ ] T043 [US3] Create `app/(protected)/dashboard/page.tsx` — Server Component; reads `from`/`to` from `searchParams` defaulting to first day of current month and today; calls `getDashboardSummary`; renders `SummaryCards`, `CategoryBreakdownChart`, and `DateRangeFilter`
- [ ] T044 [P] [US3] Create `components/dashboard/SummaryCards.tsx` — displays three stat cards: Total Income (green), Total Expenses (red), Net Balance (sign-dependent color); typed props; shows zero-state when all values are 0
- [ ] T045 [US3] Create `components/dashboard/CategoryBreakdownChart.tsx` — `"use client"` component using Recharts `PieChart` with `Pie`, `Cell`, `Tooltip`, `Legend`; accepts `data: { categoryName: string; total: number }[]`; renders empty-state message when data array is empty
- [ ] T046 [US3] Create `components/dashboard/DateRangeFilter.tsx` — `"use client"` component with from/to date inputs; on change calls `router.replace` with updated URL search params; validates `from <= to` before navigating; pre-populated from current URL params

**Checkpoint**: US3 fully functional — dashboard shows correct monthly totals and category chart. Date range changes update all figures. Independently testable.

---

## Phase 6: User Story 4 — Export Transactions to CSV (Priority: P4)

**Goal**: Signed-in users can download their visible (filtered) transactions as a CSV file.

**Independent Test**: Add 5+ transactions → Apply a date range filter → Click Export CSV → Verify downloaded file has header row and exactly the filtered rows with columns `Date,Description,Type,Category,Amount` → Remove filter → Export again → Verify all transactions are present.

### CSV export Server Action

- [ ] T047 [US4] Add `exportTransactionsCsv(filters: ExportFilters): Promise<ActionResult<string>>` to `lib/actions/transactions.ts` — validate session; validate filters with `FilterSchema`; query transactions joining `categories.name`; serialize rows as CSV string with header `Date,Description,Type,Category,Amount`; return `ActionResult<string>`

### CSV export UI

- [ ] T048 [US4] Create `components/transactions/ExportCsvButton.tsx` — `"use client"` button; reads current URL search params as export filters; calls `exportTransactionsCsv`; on success creates `Blob` with `text/csv` mime type, triggers download via hidden `<a download="transactions.csv">`, revokes object URL; shows loading state during export
- [ ] T049 [US4] Add `ExportCsvButton` to `app/(protected)/transactions/page.tsx` positioned above the transaction list; passes active URL search params as filter props

**Checkpoint**: US4 fully functional — export button downloads CSV matching the active filter. Independently testable.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Responsive layout, filter UI, error handling, and production readiness.

- [ ] T050 [P] Add mobile-responsive navigation to `app/(protected)/layout.tsx` — hamburger menu toggling on mobile (`md:` breakpoint) using `useState`; active link highlighted with Tailwind
- [ ] T051 [P] Add transaction filter UI to `app/(protected)/transactions/page.tsx` — `DateRangeFilter` (reuse US3 component) and a category filter `<select>` as Client Components updating URL search params; applies to list display and CSV export
- [ ] T052 [P] Create `components/ui/Toast.tsx` — `"use client"` notification component for success/error feedback (auto-dismiss after 3 s); use in form submit callbacks and delete confirmations
- [ ] T053 [P] Create `app/error.tsx` — global error boundary catching unexpected render errors; displays "Something went wrong" with retry button
- [ ] T054 [P] Create `app/(protected)/transactions/loading.tsx` and `app/(protected)/dashboard/loading.tsx` — Next.js loading convention with Tailwind `animate-pulse` skeleton blocks
- [ ] T055 [P] Create `app/not-found.tsx` — custom 404 page with link back to `/dashboard`
- [ ] T056 Audit `lib/actions/auth.ts`, `lib/actions/transactions.ts`, `lib/actions/categories.ts`, `lib/actions/dashboard.ts` — verify every Server Action calls `supabase.auth.getUser()` and handles unauthenticated state before any DB operation
- [ ] T057 [P] Run `npx tsc --noEmit` and resolve all TypeScript strict-mode errors across the codebase
- [ ] T058 [P] Run `npm run lint` and fix all ESLint errors and warnings
- [ ] T059 [P] Verify Tailwind responsive layout on `/transactions`, `/dashboard`, and `/categories` at 375 px and 1280 px viewport widths

---

## Dependencies (Story Completion Order)

```
Phase 1 (Setup: T001–T010)
    ↓
Phase 2 (Foundation: T011–T021)
    ↓
Phase 3 (US1 — Auth + Transactions: T022–T035)  ← MVP
    ↓
Phase 4 (US2 — Categories: T036–T041)
    ↓
Phase 5 (US3 — Dashboard: T042–T046) ─┐  (can run in parallel)
Phase 6 (US4 — CSV Export: T047–T049) ─┘
    ↓
Phase 7 (Polish: T050–T059)
```

**US3 and US4 have no dependency on each other** — both depend only on US1 being complete and can be implemented in parallel.

---

## Parallel Execution Examples

### Within Phase 3 (US1):
```
T022 auth actions
  → T026 SignInForm
  → T027 SignUpForm
T025 UI base components  [P — different files]
T028 protected layout    [P — different files]
T031 TransactionRow      [P — different files]
T032 TransactionList     [P — different files]
T029 transactions actions → T030 transactions page → T033 TransactionForm → T034 Modal → T035 delete wiring
```

### Within Phase 5+6 (US3 + US4 in parallel):
```
T042 dashboard action → T043 dashboard page → T044 SummaryCards [P]
                                             → T045 Chart [US3]
                                             → T046 DateRangeFilter [US3]
T047 exportCsv action → T048 ExportCsvButton → T049 wire to page  [US4]
```

---

## Implementation Strategy

**MVP Scope** (deliver first): **Phase 1 + Phase 2 + Phase 3** (T001–T035)
A fully working expense tracker: sign up, sign in, add/edit/delete transactions. Demonstrable independently.

**Increment 2**: **Phase 4** (T036–T041) — adds category management
**Increment 3**: **Phase 5 + 6 in parallel** (T042–T049) — dashboard and CSV export
**Final**: **Phase 7** (T050–T059) — polish and production hardening
