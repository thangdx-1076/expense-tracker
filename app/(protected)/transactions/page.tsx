import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { TransactionsPageContent } from '@/components/transactions/TransactionsPageContent'
import { TransactionFilters } from '@/components/transactions/TransactionFilters'

export const metadata = {
  title: 'Transactions | Expense Tracker',
  description: 'Manage your transactions',
}

interface TransactionsPageProps {
  searchParams: Promise<{
    from?: string
    to?: string
    category_id?: string
  }>
}

export default async function TransactionsPage({ searchParams }: TransactionsPageProps) {
  const params = await searchParams
  const from = params.from ?? ''
  const to = params.to ?? ''
  const category_id = params.category_id ?? ''

  const supabase = createClient()

  // Get current user
  const { data: userData } = await supabase.auth.getUser()
  const userId = userData?.user?.id

  if (!userId) {
    return <div>Not authenticated</div>
  }

  // Fetch categories
  const { data: categoriesData } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', userId)
    .order('name')
  const categories = categoriesData ?? []

  // Fetch transactions with optional filters
  let query = supabase
    .from('transactions')
    .select(
      `
      *,
      categories:category_id (
        id,
        name
      )
    `
    )
    .eq('user_id', userId)
    .order('date', { ascending: false })

  if (from) query = query.gte('date', from)
  if (to) query = query.lte('date', to)
  if (category_id) query = query.eq('category_id', category_id)

  const { data: transactionsData } = await query
  const transactions = transactionsData ?? []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Transactions</h1>
        <p className="text-gray-600">
          Record, manage, and track all your financial transactions.
        </p>
      </div>

      <Suspense>
        <TransactionFilters
          from={from}
          to={to}
          categoryId={category_id}
          categories={categories}
        />
      </Suspense>

      <TransactionsPageContent
        initialTransactions={transactions}
        categories={categories}
      />
    </div>
  )
}
