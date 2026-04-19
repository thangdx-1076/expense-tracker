'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Label } from '@/components/ui/Label'
import { Input } from '@/components/ui/Input'

interface TransactionFiltersProps {
  from: string
  to: string
  categoryId: string
  categories: { id: string; name: string }[]
}

export function TransactionFilters({
  from,
  to,
  categoryId,
  categories,
}: TransactionFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  const update = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }

    // Validate from <= to
    const newFrom = key === 'from' ? value : params.get('from') ?? ''
    const newTo = key === 'to' ? value : params.get('to') ?? ''
    if (newFrom && newTo && newFrom > newTo) return

    router.replace(`${pathname}?${params.toString()}`)
  }

  const hasFilters = from || to || categoryId

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-32">
          <Label htmlFor="tx-from">From</Label>
          <Input
            id="tx-from"
            type="date"
            value={from}
            onChange={(e) => update('from', e.target.value)}
            max={to || undefined}
          />
        </div>

        <div className="flex-1 min-w-32">
          <Label htmlFor="tx-to">To</Label>
          <Input
            id="tx-to"
            type="date"
            value={to}
            onChange={(e) => update('to', e.target.value)}
            min={from || undefined}
          />
        </div>

        <div className="flex-1 min-w-40">
          <Label htmlFor="tx-category">Category</Label>
          <select
            id="tx-category"
            value={categoryId}
            onChange={(e) => update('category_id', e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {hasFilters && (
          <button
            onClick={() => router.replace(pathname)}
            className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 underline transition whitespace-nowrap"
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  )
}
