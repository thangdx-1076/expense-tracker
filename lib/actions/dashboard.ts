'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { ActionResult } from '@/lib/types/actions'

const FilterSchema = z
  .object({
    from: z.string().date().optional(),
    to: z.string().date().optional(),
    category_id: z.string().uuid().optional(),
  })
  .refine(
    (data) => !data.from || !data.to || data.from <= data.to,
    { message: 'Start date must not be after end date' }
  )

export type DashboardFilters = z.infer<typeof FilterSchema>

export type CategoryBreakdownItem = {
  categoryName: string
  total: number
}

export type DashboardSummary = {
  totalIncome: number
  totalExpenses: number
  netBalance: number
  categoryBreakdown: CategoryBreakdownItem[]
}

export async function getDashboardSummary(
  filters: DashboardFilters
): Promise<ActionResult<DashboardSummary>> {
  try {
    const supabase = createClient()
    const { data: userData, error: authError } = await supabase.auth.getUser()

    if (authError || !userData?.user) {
      return {
        success: false,
        error: { code: 'UNAUTHENTICATED', message: 'You must be signed in.' },
      }
    }

    const parsed = FilterSchema.safeParse(filters)
    if (!parsed.success) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: parsed.error.issues[0]?.message ?? 'Invalid filters',
        },
      }
    }

    const { from, to } = parsed.data
    const userId = userData.user.id

    // Build transaction query
    let query = supabase
      .from('transactions')
      .select(`
        type,
        amount,
        categories:category_id (
          name
        )
      `)
      .eq('user_id', userId)

    if (from) query = query.gte('date', from)
    if (to) query = query.lte('date', to)

    const { data: transactions, error: txError } = await query

    if (txError) {
      return {
        success: false,
        error: { code: 'DB_ERROR', message: 'Failed to fetch transactions.' },
      }
    }

    let totalIncome = 0
    let totalExpenses = 0
    const categoryTotals: Record<string, number> = {}

    for (const tx of transactions ?? []) {
      const amount = Number(tx.amount)
      if (tx.type === 'income') {
        totalIncome += amount
      } else {
        totalExpenses += amount
        const categoryName = (tx.categories as unknown as { name: string } | null)?.name ?? 'Uncategorized'
        categoryTotals[categoryName] = (categoryTotals[categoryName] ?? 0) + amount
      }
    }

    const categoryBreakdown: CategoryBreakdownItem[] = Object.entries(categoryTotals)
      .map(([categoryName, total]) => ({ categoryName, total }))
      .sort((a, b) => b.total - a.total)

    return {
      success: true,
      data: {
        totalIncome,
        totalExpenses,
        netBalance: totalIncome - totalExpenses,
        categoryBreakdown,
      },
    }
  } catch (err) {
    console.error('getDashboardSummary error:', err)
    return {
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred.' },
    }
  }
}
