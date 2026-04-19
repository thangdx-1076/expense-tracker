'use client'

import { useState, useTransition } from 'react'
import { deleteTransaction } from '@/lib/actions/transactions'
import { Button } from '@/components/ui/Button'
import type { Database } from '@/lib/types/database'

type Transaction = Database['public']['Tables']['transactions']['Row'] & {
  categories?: { name: string }
}

interface TransactionRowProps {
  transaction: Transaction
  onEdit: (transaction: Transaction) => void
  onDeleteSuccess: () => void
}

export function TransactionRow({
  transaction,
  onEdit,
  onDeleteSuccess,
}: TransactionRowProps) {
  const [isPending, startTransition] = useTransition()
  const categoryName = (transaction.categories as any)?.name || 'Uncategorized'
  const formattedDate = new Date(transaction.date).toLocaleDateString()
  const typeColor = transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
  const typeLabel = transaction.type === 'income' ? 'Income' : 'Expense'

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this transaction?')) {
      startTransition(async () => {
        const result = await deleteTransaction(transaction.id)
        if (result.success) {
          onDeleteSuccess()
        }
      })
    }
  }

  return (
    <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-gray-200 hover:shadow-sm transition">
      <div className="flex-1">
        <div className="flex items-center gap-4">
          <div>
            <p className="font-medium text-gray-900">{transaction.description}</p>
            <p className="text-sm text-gray-600">{formattedDate}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-sm font-medium ${typeColor}`}>{typeLabel}</span>
            <span className="text-sm text-gray-600">{categoryName}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="font-semibold text-gray-900 min-w-24 text-right">
          ${transaction.amount.toFixed(2)}
        </span>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => onEdit(transaction)}
          disabled={isPending}
        >
          Edit
        </Button>
        <Button
          size="sm"
          variant="danger"
          onClick={handleDelete}
          isLoading={isPending}
          disabled={isPending}
        >
          Delete
        </Button>
      </div>
    </div>
  )
}
