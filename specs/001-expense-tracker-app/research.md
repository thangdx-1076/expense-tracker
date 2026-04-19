# Research: Expense Tracker App

**Phase**: 0 — Pre-design research
**Date**: 2026-04-19
**Resolves unknowns from**: [plan.md](plan.md) Technical Context

---

## 1. Next.js App Router + Supabase SSR Integration

**Decision**: Use `@supabase/ssr` with cookie-based session management via Next.js middleware.

**Rationale**: `@supabase/ssr` is the official Supabase package for Next.js App Router.
It creates server-side Supabase clients that read/write the session from HTTP-only
cookies — enabling Server Components and Server Actions to access the authenticated
user without client-side JavaScript. The `@supabase/auth-helpers-nextjs` package is
the deprecated predecessor; `@supabase/ssr` supersedes it.

**Pattern**:
1. `lib/supabase/server.ts` — creates a server client using `createServerClient` from
   `@supabase/ssr`, reading/writing cookies via `next/headers`.
2. `lib/supabase/client.ts` — creates a browser client using `createBrowserClient`
   from `@supabase/ssr` for Client Components (e.g., `AuthProvider`).
3. `middleware.ts` — calls `supabase.auth.getUser()` on every request to refresh the
   session token; protected routes redirect to `/sign-in` if no session.

**Alternatives considered**:
- `@supabase/auth-helpers-nextjs`: Deprecated — rejected.
- Manual JWT validation in middleware: More complex, error-prone, no benefit over
  `@supabase/ssr` — rejected.

---

## 2. Authentication Strategy

**Decision**: Supabase built-in email/password authentication via `auth.signInWithPassword()` and `auth.signUp()`.

**Rationale**: The spec states "email and password via the application's auth provider;
no social login required for v1." Supabase Auth natively supports email/password with
email confirmation. No third-party auth library is needed, which aligns with
Constitution Principle II.

**Pattern**:
- Sign-up: `supabase.auth.signUp({ email, password })` from a Server Action.
- Sign-in: `supabase.auth.signInWithPassword({ email, password })` from a Server Action.
- Sign-out: `supabase.auth.signOut()` from a Server Action.
- Session check in middleware: `supabase.auth.getUser()` — preferred over `getSession()`
  because it validates the JWT with the Supabase server, preventing forged tokens.
- Route protection: Next.js `middleware.ts` redirects unauthenticated users from
  `/(protected)/*` routes to `/sign-in`.

**Alternatives considered**:
- NextAuth.js: Third-party; violates Constitution Principle II — rejected.
- Supabase `getSession()` in middleware: Can be spoofed on the server; `getUser()` is
  the secure alternative — rejected for session validation.

---

## 3. CSV Export Strategy

**Decision**: Server Action that queries filtered transactions from Supabase and returns a CSV string; browser triggers file download via `Blob` + `URL.createObjectURL`.

**Rationale**: Generating CSV on the server (Server Action) avoids loading all
transaction data into the browser just to serialize it. The Server Action receives the
active filter state (date range, category ID), queries Supabase with those filters,
and serializes the result. The Client Component receives the CSV string and triggers
the native download.

**Pattern**:
```
Server Action: exportTransactionsCsv(filters) → Promise<string>
  1. Validate session
  2. Query transactions with filters (RLS enforces user scope)
  3. Map rows → CSV lines (manual string join — no library needed for simple schema)
  4. Return CSV string

Client Component:
  1. Call Server Action
  2. Create Blob('text/csv'), URL.createObjectURL
  3. Programmatically click a hidden <a download> element
  4. Revoke object URL
```

CSV columns: `Date,Description,Type,Category,Amount` (per FR-008).

**Alternatives considered**:
- `papaparse` for serialization: Adds a dependency for trivial column mapping; manual
  join sufficient for 5 fixed columns — rejected.
- API Route Handler returning a streaming response: More complex; Server Action
  returning a string is simpler and aligns with Principle V — rejected for v1.

---

## 4. Dashboard Chart Library

**Decision**: Recharts for the per-category expense breakdown chart (PieChart or BarChart).

**Rationale**: Recharts is the most widely adopted React charting library (built on
D3), has first-class TypeScript types, renders cleanly with Tailwind-adjacent styling,
and requires zero configuration for a simple pie/bar chart. It is lightweight (~100 KB
gzipped) and tree-shakeable.

**Pattern**: A single `CategoryBreakdownChart` Client Component (`"use client"`) wraps
a Recharts `PieChart` with `data` prop passed from the Server Component that fetched
the aggregated totals. The chart is the only reason for a Client Component on the
dashboard — all data fetching remains in Server Components.

**Alternatives considered**:
- Chart.js / react-chartjs-2: Larger bundle, less idiomatic with React — rejected.
- Victory: Less maintained, larger — rejected.
- CSS-only bar chart: Accessible but cannot render interactive tooltips required by
  the spec — rejected.

---

## 5. Date Range Filter State Management

**Decision**: URL search parameters (`?from=YYYY-MM-DD&to=YYYY-MM-DD&categoryId=<uuid>`) managed via Next.js `useRouter` / `useSearchParams` in Client Components; Server Components read params via `searchParams` prop.

**Rationale**: URL state for filters is the idiomatic Next.js App Router approach. It
makes the filtered view shareable, bookmarkable, and compatible with browser history.
No additional state management library (Zustand, Redux) is needed.

**Pattern**:
- `DateRangeFilter` and `CategoryFilter` are Client Components that update the URL on
  change using `router.push` / `router.replace`.
- The `transactions/page.tsx` and `dashboard/page.tsx` Server Components destructure
  `searchParams` to pass filter values into Supabase query calls in Server Actions or
  direct server-side queries.
- Default filter on dashboard: `from` = first day of current month, `to` = today.

**Alternatives considered**:
- React Context / Zustand for filter state: Loses shareability, adds unnecessary
  client-side complexity — rejected.
- Server-side session storage for filters: Non-idiomatic in App Router, harder to test
  — rejected.

---

## 6. Form Handling & Validation

**Decision**: React controlled forms with `react-hook-form` + `zod` for validation; Server Actions for submission.

**Rationale**: `react-hook-form` provides performant controlled inputs with minimal
re-renders. `zod` provides type-safe schema validation that can be shared between
client-side (immediate feedback) and server-side (Server Action input validation)
contexts. This dual validation aligns with FR-011 and prevents any malformed data
from reaching Supabase.

**Pattern**:
- Define a `zod` schema for each form (TransactionSchema, CategorySchema).
- Client-side: `resolver: zodResolver(schema)` in `useForm` — shows errors without a
  round trip.
- Server-side: Server Action calls `schema.safeParse(formData)` before any DB
  operation. Returns typed errors if invalid.

**Alternatives considered**:
- Native HTML validation only: Cannot cover business rules (e.g., non-zero amount,
  unique category name check) — rejected.
- `yup`: Less TypeScript-idiomatic than `zod` — rejected.

---

## Summary of Technology Decisions

| Concern | Decision | Rationale |
|---------|----------|-----------|
| Supabase + Next.js SSR | `@supabase/ssr` | Official, cookie-based, App Router native |
| Auth | Supabase email/password | Built-in, no third-party needed |
| CSV export | Server Action → string → Blob | Simple, no library dependency |
| Charts | Recharts | Lightweight, TypeScript-friendly, React-native |
| Filter state | URL search params | Shareable, idiomatic App Router pattern |
| Forms | react-hook-form + zod | Type-safe, dual client+server validation |

**All NEEDS CLARIFICATION markers resolved. Phase 1 may proceed.**
