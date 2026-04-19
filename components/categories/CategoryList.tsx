'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { CategoryRow } from './CategoryRow'
import { CategoryForm } from './CategoryForm'
import type { Database } from '@/lib/types/database'

type Category = Database['public']['Tables']['categories']['Row']

interface CategoryListProps {
  categories: Category[]
}

export function CategoryList({ categories }: CategoryListProps) {
  const router = useRouter()

  const handleMutate = useCallback(() => {
    router.refresh()
  }, [router])

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <CategoryForm onSuccess={handleMutate} />
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">No categories yet.</p>
          <p className="text-sm text-gray-500 mt-1">
            Create your first category above to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {categories.map((category) => (
            <CategoryRow
              key={category.id}
              category={category}
              onMutate={handleMutate}
            />
          ))}
        </div>
      )}
    </div>
  )
}
