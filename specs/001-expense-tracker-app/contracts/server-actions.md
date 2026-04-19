# Server Action Contracts: Expense Tracker App

**Phase**: 1 — Design
**Date**: 2026-04-19
**Source**: [spec.md](../spec.md), [data-model.md](../data-model.md)

This document defines the Server Action interface contracts — the boundary between
Client Components (browser) and server-side logic. All actions are async functions
marked with `"use server"` in `lib/actions/`.

---

## Auth Actions

### `signIn(formData: FormData): Promise<ActionResult<void>>`

**File**: `lib/actions/auth.ts`
**Description**: Authenticate an existing user with email and password.

**Input** (FormData fields):
| Field | Type | Validation |
|-------|------|------------|
| `email` | `string` | Valid email format |
| `password` | `string` | min 8 characters |

**Success**: Redirects to `/dashboard` (via `redirect()`).

**Error responses**:
| Code | Message |
|------|---------|
| `INVALID_CREDENTIALS` | "Invalid email or password." |
| `VALIDATION_ERROR` | Field-level zod errors |

---

### `signUp(formData: FormData): Promise<ActionResult<void>>`

**File**: `lib/actions/auth.ts`
**Description**: Register a new user account.

**Input** (FormData fields):
| Field | Type | Validation |
|-------|------|------------|
| `email` | `string` | Valid email format |
| `password` | `string` | min 8 characters |

**Success**: Redirects to `/dashboard` (email confirmation disabled for v1) or shows
"check your email" message if confirmation is enabled.

**Error responses**:
| Code | Message |
|------|---------|
| `EMAIL_IN_USE` | "An account with this email already exists." |
| `VALIDATION_ERROR` | Field-level zod errors |

---

### `signOut(): Promise<void>`

**File**: `lib/actions/auth.ts`
**Description**: Sign out the current user and redirect to `/sign-in`.
**Requires**: Active session (no-op if already signed out).

---

## Category Actions

### `createCategory(formData: FormData): Promise<ActionResult<Category>>`

**File**: `lib/actions/categories.ts`
**Description**: Create a new category for the authenticated user.

**Input** (FormData fields):
| Field | Type | Validation |
|-------|------|------------|
| `name` | `string` | 1–50 chars, trimmed |

**Success**: Returns the created `Category` row.

**Error responses**:
| Code | Message |
|------|---------|
| `DUPLICATE_NAME` | "A category with this name already exists." |
| `VALIDATION_ERROR` | Field-level zod errors |
| `UNAUTHENTICATED` | Redirects to `/sign-in` |

---

### `updateCategory(id: string, formData: FormData): Promise<ActionResult<Category>>`

**File**: `lib/actions/categories.ts`
**Description**: Rename an existing category owned by the authenticated user.

**Input**:
| Param | Type | Validation |
|-------|------|------------|
| `id` | `string` | Valid UUID |
| `name` (FormData) | `string` | 1–50 chars, trimmed |

**Success**: Returns the updated `Category` row.

**Error responses**:
| Code | Message |
|------|---------|
| `NOT_FOUND` | "Category not found." |
| `DUPLICATE_NAME` | "A category with this name already exists." |
| `VALIDATION_ERROR` | Field-level zod errors |
| `UNAUTHENTICATED` | Redirects to `/sign-in` |

---

### `deleteCategory(id: string): Promise<ActionResult<void>>`

**File**: `lib/actions/categories.ts`
**Description**: Delete a category owned by the authenticated user. Blocked if the
category has assigned transactions.

**Input**:
| Param | Type | Validation |
|-------|------|------------|
| `id` | `string` | Valid UUID |

**Success**: Category is deleted, returns void.

**Error responses**:
| Code | Message |
|------|---------|
| `HAS_TRANSACTIONS` | "Cannot delete category — {count} transaction(s) are assigned to it." |
| `NOT_FOUND` | "Category not found." |
| `UNAUTHENTICATED` | Redirects to `/sign-in` |

---

## Transaction Actions

### `createTransaction(formData: FormData): Promise<ActionResult<Transaction>>`

**File**: `lib/actions/transactions.ts`
**Description**: Record a new transaction for the authenticated user.

**Input** (FormData fields):
| Field | Type | Validation |
|-------|------|------------|
| `amount` | `string` (parsed to number) | > 0, up to 2 decimal places |
| `date` | `string` | ISO date format `YYYY-MM-DD` |
| `description` | `string` | 1–255 chars, trimmed |
| `type` | `string` | `"income"` or `"expense"` |
| `category_id` | `string` | Valid UUID, must belong to user |

**Success**: Returns the created `Transaction` row (including joined `category.name`).

**Error responses**:
| Code | Message |
|------|---------|
| `INVALID_CATEGORY` | "Selected category does not exist." |
| `VALIDATION_ERROR` | Field-level zod errors |
| `UNAUTHENTICATED` | Redirects to `/sign-in` |

---

### `updateTransaction(id: string, formData: FormData): Promise<ActionResult<Transaction>>`

**File**: `lib/actions/transactions.ts`
**Description**: Edit an existing transaction owned by the authenticated user.

**Input**:
| Param | Type | Validation |
|-------|------|------------|
| `id` | `string` | Valid UUID |
| All FormData fields | same as `createTransaction` | Same validation |

**Success**: Returns the updated `Transaction` row.

**Error responses**: Same as `createTransaction`, plus `NOT_FOUND`.

---

### `deleteTransaction(id: string): Promise<ActionResult<void>>`

**File**: `lib/actions/transactions.ts`
**Description**: Delete a transaction owned by the authenticated user.

**Input**:
| Param | Type | Validation |
|-------|------|------------|
| `id` | `string` | Valid UUID |

**Success**: Transaction is deleted, returns void.

**Error responses**:
| Code | Message |
|------|---------|
| `NOT_FOUND` | "Transaction not found." |
| `UNAUTHENTICATED` | Redirects to `/sign-in` |

---

### `exportTransactionsCsv(filters: ExportFilters): Promise<ActionResult<string>>`

**File**: `lib/actions/transactions.ts`
**Description**: Export the authenticated user's transactions (optionally filtered) as
a CSV string.

**Input**:
```typescript
type ExportFilters = {
  from?: string         // ISO date YYYY-MM-DD
  to?: string           // ISO date YYYY-MM-DD
  category_id?: string  // UUID
}
```

**Validation**: `FilterSchema` (from data-model.md) — `from <= to` if both provided.

**Success**: Returns a CSV string. Column order: `Date,Description,Type,Category,Amount`.
Dates are formatted as `YYYY-MM-DD`. Amounts are formatted as plain decimal numbers.

**Error responses**:
| Code | Message |
|------|---------|
| `VALIDATION_ERROR` | Filter validation errors |
| `UNAUTHENTICATED` | Redirects to `/sign-in` |

**Note**: An empty result set returns a CSV with only the header row (no error).

---

## Shared Types

```typescript
// lib/types/actions.ts

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: ActionError }

export type ActionError = {
  code: string
  message: string
  fieldErrors?: Record<string, string[]>  // zod field-level errors
}
```

All Server Actions return `ActionResult<T>`. Actions that redirect (auth flows) do not
return — they call Next.js `redirect()` which throws internally.
