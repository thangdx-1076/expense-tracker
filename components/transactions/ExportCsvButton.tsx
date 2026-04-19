'use client'

import { useTransition, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { exportTransactionsCsv, ExportFilters } from '@/lib/actions/transactions'
import { Button } from '@/components/ui/Button'

export function ExportCsvButton() {
  const [isPending, startTransition] = useTransition()
  const searchParams = useSearchParams()
  const anchorRef = useRef<HTMLAnchorElement>(null)

  const handleExport = () => {
    startTransition(async () => {
      const filters: ExportFilters = {
        from: searchParams.get('from') ?? undefined,
        to: searchParams.get('to') ?? undefined,
        category_id: searchParams.get('category_id') ?? undefined,
      }

      const result = await exportTransactionsCsv(filters)

      if (!result.success) {
        alert(`Export failed: ${result.error.message}`)
        return
      }

      const blob = new Blob([result.data], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)

      const anchor = anchorRef.current
      if (anchor) {
        anchor.href = url
        anchor.download = 'transactions.csv'
        anchor.click()
      }

      URL.revokeObjectURL(url)
    })
  }

  return (
    <>
      {/* Hidden anchor for triggering the download */}
      {/* eslint-disable-next-line jsx-a11y/anchor-has-content */}
      <a ref={anchorRef} className="hidden" aria-hidden="true" />
      <Button
        variant="secondary"
        size="sm"
        isLoading={isPending}
        onClick={handleExport}
      >
        Export CSV
      </Button>
    </>
  )
}
