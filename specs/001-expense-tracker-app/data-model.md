# Data Model: Expense Tracker App

**Phase**: 1 — Design
**Date**: 2026-04-19
**Source**: [spec.md](spec.md), [research.md](research.md)

---

## Entities

### 1. User

Managed entirely by **Supabase Auth** (`auth.users` table — Supabase-internal).
The application never creates or manages user records directly.

| Field | Type | Notes |
|-------|------|-------|
| `id` | `uuid` | Primary key — referenced as `user_id` FK in app tables |
| `email` | `text` | Managed by Supabase Auth |
| `created_at` | `timestamptz` | Managed by Supabase Auth |

No application migration creates or alters this table.

---

### 2. Category

A user-defined label for grouping transactions.

**Table**: `public.categories`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | `uuid` | PK, default `gen_random_uuid()` | |
| `user_id` | `uuid` | NOT NULL, FK → `auth.users(id)` ON DELETE CASCADE | RLS scope |
| `name` | `text` | NOT NULL | |
| `created_at` | `timestamptz` | NOT NULL, default `now()` | |
| `updated_at` | `timestamptz` | NOT NULL, default `now()` | Updated via trigger |

**Unique constraint**: `(user_id, name)` — category names are unique per user (FR-004, edge case).

**RLS policies**:
```sql
-- SELECT: users see only their own categories
CREATE POLICY "users_select_own_categories"
  ON categories FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT: users insert only for themselves
CREATE POLICY "users_insert_own_categories"
  ON categories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: users update only their own categories
CREATE POLICY "users_update_own_categories"
  ON categories FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE: users delete only their own categories
CREATE POLICY "users_delete_own_categories"
  ON categories FOR DELETE
  USING (auth.uid() = user_id);
```

**Deletion guard**: The application (Server Action) MUST check `count` of
`transactions` referencing this category before deletion and reject if count > 0
(FR-005). No DB-level `ON DELETE RESTRICT` is added so the error message can be
user-friendly rather than a raw constraint error.

**Relationships**:
- One category belongs to one user.
- One category has zero-to-many transactions.

---

### 3. Transaction

A single financial event (income or expense) recorded by the user.

**Table**: `public.transactions`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | `uuid` | PK, default `gen_random_uuid()` | |
| `user_id` | `uuid` | NOT NULL, FK → `auth.users(id)` ON DELETE CASCADE | RLS scope |
| `category_id` | `uuid` | NOT NULL, FK → `categories(id)` ON DELETE RESTRICT | Must reference a valid category |
| `type` | `text` | NOT NULL, CHECK `type IN ('income','expense')` | Transaction type |
| `amount` | `numeric(12,2)` | NOT NULL, CHECK `amount > 0` | Always positive; type determines sign |
| `date` | `date` | NOT NULL | Calendar date of the transaction |
| `description` | `text` | NOT NULL, CHECK `length(description) > 0` | Free-text label |
| `created_at` | `timestamptz` | NOT NULL, default `now()` | |
| `updated_at` | `timestamptz` | NOT NULL, default `now()` | Updated via trigger |

**RLS policies**:
```sql
-- SELECT
CREATE POLICY "users_select_own_transactions"
  ON transactions FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT
CREATE POLICY "users_insert_own_transactions"
  ON transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- UPDATE
CREATE POLICY "users_update_own_transactions"
  ON transactions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE
CREATE POLICY "users_delete_own_transactions"
  ON transactions FOR DELETE
  USING (auth.uid() = user_id);
```

**Indexes**:
- `(user_id, date DESC)` — supports default transaction list sort (FR-010) and date-range filters.
- `(user_id, category_id)` — supports category-filter queries and category deletion guard.

**Relationships**:
- One transaction belongs to one user.
- One transaction belongs to exactly one category.

---

## State Transitions

### Category lifecycle

```
Created → (renamed any number of times) → Deleted
         ^                                    |
         |__ only if transaction_count = 0 __|
```

### Transaction lifecycle

```
Created → Updated (any field) → Deleted
```

---

## Validation Rules (application-level, enforced via zod schemas)

### CategorySchema

```typescript
z.object({
  name: z.string().min(1).max(50).trim(),
})
```

### TransactionSchema

```typescript
z.object({
  amount:      z.number().positive(),                    // > 0
  date:        z.string().date(),                        // ISO date string YYYY-MM-DD
  description: z.string().min(1).max(255).trim(),
  type:        z.enum(['income', 'expense']),
  category_id: z.string().uuid(),
})
```

### FilterSchema (for list/export queries)

```typescript
z.object({
  from:        z.string().date().optional(),
  to:          z.string().date().optional(),
  category_id: z.string().uuid().optional(),
}).refine(
  (data) => !data.from || !data.to || data.from <= data.to,
  { message: 'Start date must not be after end date' }
)
```

---

## Database Migrations (file names)

```text
supabase/migrations/
├── 20260419000001_create_categories.sql
└── 20260419000002_create_transactions.sql
```

Each migration file includes:
1. `CREATE TABLE` statement
2. `ALTER TABLE ENABLE ROW LEVEL SECURITY`
3. All four RLS policies (`SELECT`, `INSERT`, `UPDATE`, `DELETE`)
4. Relevant indexes

---

## Generated TypeScript Types

Generated via `supabase gen types typescript --local > lib/types/database.ts`.

Key types (illustrative — actual output from codegen):

```typescript
export type Database = {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string
          user_id: string
          name: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['categories']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['categories']['Insert']>
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          category_id: string
          type: 'income' | 'expense'
          amount: number
          date: string
          description: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['transactions']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['transactions']['Insert']>
      }
    }
  }
}
```
