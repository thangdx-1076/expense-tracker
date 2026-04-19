import { createServerClient } from '@/lib/supabase/server'
import { TransactionsPageContent } from '@/components/transactions/TransactionsPageContent'

export const metadata = {
  title: 'Transactions | Expense Tracker',
  description: 'Manage your transactions',
}

export default async function TransactionsPage() {
  const supabase = await createServerClient()

  // Get current user
  const { data: userData } = await supabase.auth.getUser()
  const userId = userData?.user?.id

  if (!userId) {
    return <div>Not authenticated</div>
  }

  // Fetch categories
  const { data: categories = [] } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', userId)
    .order('name')

  // Fetch transactions with category info
  const { data: transactions = [] } = await supabase
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

  return (
    <TransactionsPageContent
      initialTransactions={transactions}
      categories={categories}
    />
  )
}
