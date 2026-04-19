'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { ActionResult } from '@/lib/types/actions'
import type { Database } from '@/lib/types/database'

type Transaction = Database['public']['Tables']['transactions']['Row'] & {
  categories?: { name: string }
}

const TransactionSchema = z.object({
  amount: z.string().refine(
    (val) => {
      const num = parseFloat(val)
      return !isNaN(num) && num > 0
    },
    { message: 'Amount must be a positive number' }
  ),
  date: z.string().date('Invalid date format'),
  description: z.string().min(1).max(255).trim(),
  type: z.enum(['income', 'expense']),
  category_id: z.string().uuid('Invalid category ID'),
})

type TransactionInput = z.infer<typeof TransactionSchema>

async function getCurrentUser() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()

  if (error || !data?.user) {
    return null
  }

  return data.user
}

export async function createTransaction(
  formData: FormData
): Promise<ActionResult<Transaction>> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return {
        success: false,
        error: {
          code: 'UNAUTHENTICATED',
          message: 'You must be signed in to create a transaction',
        },
      }
    }

    const raw = Object.fromEntries(formData)
    const parsed = TransactionSchema.safeParse(raw)

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors as Record<
        string,
        string[]
      >
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          fieldErrors,
        },
      }
    }

    const { amount, date, description, type, category_id } = parsed.data
    const supabase = await createClient()

    // Verify category belongs to user
    const { data: categoryData, error: categoryError } = await supabase
      .from('categories')
      .select('id')
      .eq('id', category_id)
      .eq('user_id', user.id)
      .single()

    if (categoryError || !categoryData) {
      return {
        success: false,
        error: {
          code: 'INVALID_CATEGORY',
          message: 'Selected category does not exist.',
        },
      }
    }

    // Create transaction
    const { data, error } = await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        amount: parseFloat(amount),
        date,
        description,
        type: type as 'income' | 'expense',
        category_id,
      })
      .select(
        `
        *,
        categories:category_id (
          id,
          name
        )
      `
      )
      .single()

    if (error) {
      console.error('Transaction creation error:', error)
      return {
        success: false,
        error: {
          code: 'DB_ERROR',
          message: 'Failed to create transaction',
        },
      }
    }

    revalidatePath('/transactions')
    revalidatePath('/dashboard')

    return {
      success: true,
      data: data as Transaction,
    }
  } catch (err) {
    console.error('Create transaction error:', err)
    return {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
      },
    }
  }
}

export async function updateTransaction(
  id: string,
  formData: FormData
): Promise<ActionResult<Transaction>> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return {
        success: false,
        error: {
          code: 'UNAUTHENTICATED',
          message: 'You must be signed in to update a transaction',
        },
      }
    }

    const raw = Object.fromEntries(formData)
    const parsed = TransactionSchema.safeParse(raw)

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors as Record<
        string,
        string[]
      >
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          fieldErrors,
        },
      }
    }

    const { amount, date, description, type, category_id } = parsed.data
    const supabase = await createClient()

    // Verify transaction belongs to user
    const { data: transactionData, error: transactionError } = await supabase
      .from('transactions')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (transactionError || !transactionData) {
      return {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Transaction not found.',
        },
      }
    }

    // Verify category belongs to user
    const { data: categoryData, error: categoryError } = await supabase
      .from('categories')
      .select('id')
      .eq('id', category_id)
      .eq('user_id', user.id)
      .single()

    if (categoryError || !categoryData) {
      return {
        success: false,
        error: {
          code: 'INVALID_CATEGORY',
          message: 'Selected category does not exist.',
        },
      }
    }

    // Update transaction
    const { data, error } = await supabase
      .from('transactions')
      .update({
        amount: parseFloat(amount),
        date,
        description,
        type: type as 'income' | 'expense',
        category_id,
      })
      .eq('id', id)
      .select(
        `
        *,
        categories:category_id (
          id,
          name
        )
      `
      )
      .single()

    if (error) {
      console.error('Transaction update error:', error)
      return {
        success: false,
        error: {
          code: 'DB_ERROR',
          message: 'Failed to update transaction',
        },
      }
    }

    revalidatePath('/transactions')
    revalidatePath('/dashboard')

    return {
      success: true,
      data: data as Transaction,
    }
  } catch (err) {
    console.error('Update transaction error:', err)
    return {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
      },
    }
  }
}

export async function deleteTransaction(
  id: string
): Promise<ActionResult<void>> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return {
        success: false,
        error: {
          code: 'UNAUTHENTICATED',
          message: 'You must be signed in to delete a transaction',
        },
      }
    }

    const supabase = await createClient()

    // Verify transaction belongs to user
    const { data: transactionData, error: transactionError } = await supabase
      .from('transactions')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (transactionError || !transactionData) {
      return {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Transaction not found.',
        },
      }
    }

    // Delete transaction
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Transaction deletion error:', error)
      return {
        success: false,
        error: {
          code: 'DB_ERROR',
          message: 'Failed to delete transaction',
        },
      }
    }

    revalidatePath('/transactions')
    revalidatePath('/dashboard')

    return {
      success: true,
      data: undefined,
    }
  } catch (err) {
    console.error('Delete transaction error:', err)
    return {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
      },
    }
  }
}

const ExportFilterSchema = z
  .object({
    from: z.string().date().optional(),
    to: z.string().date().optional(),
    category_id: z.string().uuid().optional(),
  })
  .refine(
    (data) => !data.from || !data.to || data.from <= data.to,
    { message: 'Start date must not be after end date' }
  )

export type ExportFilters = z.infer<typeof ExportFilterSchema>

function escapeCsvField(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export async function exportTransactionsCsv(
  filters: ExportFilters
): Promise<ActionResult<string>> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return {
        success: false,
        error: {
          code: 'UNAUTHENTICATED',
          message: 'You must be signed in to export transactions',
        },
      }
    }

    const parsed = ExportFilterSchema.safeParse(filters)
    if (!parsed.success) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: parsed.error.issues[0]?.message ?? 'Invalid filters',
        },
      }
    }

    const { from, to, category_id } = parsed.data
    const supabase = await createClient()

    let query = supabase
      .from('transactions')
      .select(`
        date,
        description,
        type,
        amount,
        categories:category_id (
          name
        )
      `)
      .eq('user_id', user.id)
      .order('date', { ascending: false })

    if (from) query = query.gte('date', from)
    if (to) query = query.lte('date', to)
    if (category_id) query = query.eq('category_id', category_id)

    const { data: rows, error } = await query

    if (error) {
      return {
        success: false,
        error: { code: 'DB_ERROR', message: 'Failed to fetch transactions.' },
      }
    }

    const lines: string[] = ['Date,Description,Type,Category,Amount']

    for (const row of rows ?? []) {
      const categoryName = (row.categories as unknown as { name: string } | null)?.name ?? 'Uncategorized'
      lines.push(
        [
          escapeCsvField(row.date),
          escapeCsvField(row.description),
          escapeCsvField(row.type),
          escapeCsvField(categoryName),
          String(row.amount),
        ].join(',')
      )
    }

    return { success: true, data: lines.join('\n') }
  } catch (err) {
    console.error('exportTransactionsCsv error:', err)
    return {
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred.' },
    }
  }
}
