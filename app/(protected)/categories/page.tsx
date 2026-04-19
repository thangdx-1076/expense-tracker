import { createClient } from '@/lib/supabase/server'
import { CategoryList } from '@/components/categories/CategoryList'

export const metadata = {
  title: 'Categories | Expense Tracker',
  description: 'Manage your transaction categories',
}

export default async function CategoriesPage() {
  const supabase = createClient()
  const { data: userData } = await supabase.auth.getUser()
  const userId = userData?.user?.id

  if (!userId) return <div>Not authenticated</div>

  const { data: categoriesData } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', userId)
    .order('name')
  const categories = categoriesData ?? []

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Categories</h1>
        <p className="text-gray-600">
          Create and manage your transaction categories.
        </p>
      </div>

      <CategoryList categories={categories} />
    </div>
  )
}

