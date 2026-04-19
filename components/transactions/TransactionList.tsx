'use client'

import { TransactionRow } from './TransactionRow'
import type { Database } from '@/lib/types/database'

type Transaction = Database['public']['Tables']['transactions']['Row'] & {
  categories?: { name: string }
}

interface TransactionListProps {
  transactions: Transaction[]
  onEdit: (transaction: Transaction) => void
  onDeleteSuccess: () => void
}

export function TransactionList({
  transactions,
  onEdit,
  onDeleteSuccess,
}: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No transactions yet.</p>
        <p className="text-sm text-gray-500 mt-1">
          Create your first transaction to get started.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {transactions.map((transaction) => (
        <TransactionRow
          key={transaction.id}
          transaction={transaction}
          onEdit={onEdit}
          onDeleteSuccess={onDeleteSuccess}
        />
      ))}
    </div>
  )
}
