# Expense Tracker — User Guide

## Table of Contents

1. [Getting Started](#1-getting-started)
   - [Creating an Account](#11-creating-an-account)
   - [Signing In](#12-signing-in)
   - [Signing Out](#13-signing-out)
2. [Navigation](#2-navigation)
3. [Categories](#3-categories)
   - [Creating a Category](#31-creating-a-category)
   - [Renaming a Category](#32-renaming-a-category)
   - [Deleting a Category](#33-deleting-a-category)
4. [Transactions](#4-transactions)
   - [Adding a Transaction](#41-adding-a-transaction)
   - [Filtering Transactions](#42-filtering-transactions)
   - [Editing a Transaction](#43-editing-a-transaction)
   - [Deleting a Transaction](#44-deleting-a-transaction)
5. [Dashboard](#5-dashboard)
   - [Summary Cards](#51-summary-cards)
   - [Category Breakdown Chart](#52-category-breakdown-chart)
   - [Changing the Date Range](#53-changing-the-date-range)
6. [Exporting to CSV](#6-exporting-to-csv)
7. [Tips & Workflow](#7-tips--workflow)
8. [Troubleshooting](#8-troubleshooting)

---

## 1. Getting Started

### 1.1 Creating an Account

1. Open the app in your browser. You will land on the **Sign In** page.
2. Click **"Sign up"** (link below the sign-in form).
3. Enter your **email address** and a **password** (minimum 8 characters).
4. Click **Sign Up**. You are signed in immediately and redirected to the Dashboard.

> Your data is private to your account. No other user can see or modify it.

### 1.2 Signing In

1. Go to the app URL. You will be redirected to `/sign-in` if you are not authenticated.
2. Enter your **email** and **password**.
3. Click **Sign In**. You are redirected to the Dashboard.

### 1.3 Signing Out

- **Desktop**: Click **Sign Out** in the top-right corner of the navigation bar.
- **Mobile**: Open the hamburger menu (top-right ≡ icon), then tap **Sign Out** at the bottom of the menu.

---

## 2. Navigation

The navigation bar at the top of every page contains three links:

| Link | Page | Purpose |
|------|------|---------|
| **Dashboard** | `/dashboard` | Monthly spending summary and chart |
| **Transactions** | `/transactions` | Full transaction history, add/edit/delete |
| **Categories** | `/categories` | Manage your spending categories |

On **mobile** (screens narrower than `md` / ~768 px), the links are hidden behind a **hamburger menu** (☰). Tap it to open the menu. The current page is highlighted in blue.

---

## 3. Categories

Categories classify your transactions (e.g., *Groceries*, *Salary*, *Rent*). You must create at least one category before you can add a transaction.

Go to **Categories** in the navigation bar.

### 3.1 Creating a Category

1. Type a name in the **"Add a new category"** input at the top of the page.
2. Click **Add**.
3. The category appears in the list below and is immediately available in the transaction form.

> Category names must be unique (per account) and cannot exceed 50 characters.

### 3.2 Renaming a Category

1. Find the category in the list.
2. Click **Rename**.
3. Edit the name in the inline text field that appears.
4. Click **Save** to confirm, or **Cancel** to discard.

> All transactions previously assigned to this category automatically reflect the new name.

### 3.3 Deleting a Category

1. Find the category in the list.
2. Click **Delete**.
   - If the category has **no transactions**, it is deleted immediately.
   - If the category has **one or more transactions**, deletion is blocked. An inline error message shows how many transactions are assigned (e.g., *"Cannot delete: 3 transaction(s) are using this category"*). Reassign or delete those transactions first, then try again.

---

## 4. Transactions

A transaction is a single financial event — either **income** (money in) or **expense** (money out).

Go to **Transactions** in the navigation bar.

### 4.1 Adding a Transaction

1. Fill in the **Add Transaction** form at the top of the page:

   | Field | Description |
   |-------|-------------|
   | **Amount** | A positive number (e.g., `42.50`) |
   | **Date** | The date of the transaction |
   | **Description** | A short note (e.g., *"Weekly groceries"*) |
   | **Type** | `Income` or `Expense` |
   | **Category** | Select from your existing categories |

2. Click **Add Transaction**.
3. On success, a green toast notification confirms the addition and the transaction appears at the top of the history list (sorted by date, newest first).

> If any field is invalid, a red error message appears beneath it.

### 4.2 Filtering Transactions

The **filter bar** sits above the transaction history list. All three filters are optional and can be combined:

| Filter | How to use |
|--------|-----------|
| **From** | Show only transactions on or after this date |
| **To** | Show only transactions on or before this date |
| **Category** | Show only transactions in the selected category |

- Changing any filter instantly reloads the page with matching transactions.
- The **Export CSV** button (see §6) always exports the *currently filtered* view.
- Click **Clear filters** (appears when any filter is active) to reset all filters.

### 4.3 Editing a Transaction

1. Find the transaction in the list.
2. Click **Edit**.
3. An **Edit Transaction** modal opens, pre-filled with the current values.
4. Make your changes and click **Update Transaction**.
5. A toast confirms the update and the list refreshes.

### 4.4 Deleting a Transaction

1. Find the transaction in the list.
2. Click **Delete**.
3. Confirm the browser prompt.
4. A toast confirms the deletion and the transaction is removed from the list.

> Deletion is permanent. It also affects dashboard totals immediately on the next dashboard visit.

---

## 5. Dashboard

The Dashboard gives you a financial overview for any date range. It defaults to the **current calendar month** (first day of the month → today).

Go to **Dashboard** in the navigation bar.

### 5.1 Summary Cards

Three cards are displayed at the top:

| Card | Description |
|------|-------------|
| **Total Income** (green) | Sum of all income transactions in the selected date range |
| **Total Expenses** (red) | Sum of all expense transactions in the selected date range |
| **Net Balance** (green if ≥ 0, red if negative) | Total Income − Total Expenses |

All amounts are shown in USD. If there are no transactions in the date range, all cards show `$0.00`.

### 5.2 Category Breakdown Chart

A **donut pie chart** below the summary cards shows how expenses are distributed across your categories for the selected date range.

- Each slice represents one category's share of total expenses.
- Hover over a slice to see the category name and exact amount.
- The legend below the chart labels each colour.
- If there are no expense transactions in the range, an empty-state message is shown instead.

> Income transactions are **not** included in the category breakdown — only expenses.

### 5.3 Changing the Date Range

Use the **From** and **To** date pickers above the summary cards to change the period:

1. Click the **From** field and pick a start date.
2. Click the **To** field and pick an end date.
3. The page reloads automatically with updated totals and chart.

> The **From** date cannot be later than the **To** date — the filter prevents invalid ranges.

---

## 6. Exporting to CSV

You can download any filtered view of your transactions as a CSV file.

1. Go to **Transactions**.
2. Optionally apply **From**, **To**, or **Category** filters to narrow the export.
3. Click **Export CSV** (top-right of the Transaction History section).
4. A file named `transactions.csv` downloads to your device.

The CSV has the following columns:

```
Date,Description,Type,Category,Amount
```

**Example:**
```
Date,Description,Type,Category,Amount
2026-04-15,Weekly groceries,expense,Groceries,87.40
2026-04-14,Salary,income,Salary,3200.00
2026-04-10,Electricity bill,expense,Utilities,120.00
```

> Fields containing commas, quotes, or line breaks are automatically quoted and escaped.
> Removing all filters before exporting will export your **entire** transaction history.

---

## 7. Tips & Workflow

**Recommended setup steps:**
1. Go to **Categories** and create your spending categories first (e.g., *Housing*, *Food*, *Transport*, *Salary*, *Freelance*).
2. Go to **Transactions** and start recording your income and expenses.
3. Check the **Dashboard** at the end of each month to review your net balance and biggest spending categories.
4. Export to CSV monthly for your own records or to import into a spreadsheet.

**Keeping data clean:**
- Use consistent category names — you cannot merge categories after the fact.
- If you need to remove a category, first reassign its transactions to another category via the Edit button on each transaction.
- Use the description field to capture enough detail (merchant name, purpose) so the data is useful when exported.

**Date range tricks:**
- To see your **year-to-date** totals: set **From** to `YYYY-01-01` and **To** to today.
- To compare months: export each month separately using the date filter, then compare in a spreadsheet.

---

## 8. Troubleshooting

| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| Redirected to Sign In when visiting any page | Session expired or not signed in | Sign in again |
| "Cannot delete: N transaction(s) are using this category" | Category has transactions | Edit each transaction to use a different category, then delete |
| Category dropdown in transaction form is empty | No categories created yet | Go to **Categories** and add at least one |
| Export CSV downloads an empty file (header only) | Active filter matches no transactions | Check the current filter or clear all filters |
| Dashboard shows $0.00 for all cards | No transactions in the selected date range | Expand the date range or check **Transactions** to confirm data exists |
| Form shows field-level errors | Invalid or missing input | Read the red error message under each field and correct the value |
| Page shows "Something went wrong" | Unexpected server error | Click **Try again**; if it persists, sign out and back in |
| 404 page | Navigated to a non-existent URL | Click **Back to Dashboard** |
