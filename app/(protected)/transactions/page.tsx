import { createClient } from '@/lib/supabase/server'
import { TransactionsPageContent } from '@/components/transactions/TransactionsPageContent'

export const metadata = {
  title: 'Transactions | Expense Tracker',
  description: 'Manage your transactions',
}

export default async function TransactionsPage() {
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

  // Fetch transactions with category info
  const { data: transactionsData } = await supabase
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
  const transactions = transactionsData ?? []

  return (
    <TransactionsPageContent
      initialTransactions={transactions}
      categories={categories}
    />
  )
}
