'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Label } from '@/components/ui/Label'
import { Input } from '@/components/ui/Input'

interface DateRangeFilterProps {
  from: string
  to: string
}

export function DateRangeFilter({ from, to }: DateRangeFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleChange = (field: 'from' | 'to', value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(field, value)
    } else {
      params.delete(field)
    }

    const newFrom = field === 'from' ? value : params.get('from') ?? ''
    const newTo = field === 'to' ? value : params.get('to') ?? ''

    // Validate from <= to before navigating
    if (newFrom && newTo && newFrom > newTo) return

    router.replace(`/dashboard?${params.toString()}`)
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-36">
          <Label htmlFor="from">From</Label>
          <Input
            id="from"
            type="date"
            value={from}
            onChange={(e) => handleChange('from', e.target.value)}
            max={to || undefined}
          />
        </div>
        <div className="flex-1 min-w-36">
          <Label htmlFor="to">To</Label>
          <Input
            id="to"
            type="date"
            value={to}
            onChange={(e) => handleChange('to', e.target.value)}
            min={from || undefined}
          />
        </div>
      </div>
    </div>
  )
}
