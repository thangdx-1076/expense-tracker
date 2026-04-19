'use client'

import { useState, useCallback, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { TransactionForm } from '@/components/transactions/TransactionForm'
import { TransactionList } from '@/components/transactions/TransactionList'
import { ExportCsvButton } from '@/components/transactions/ExportCsvButton'
import { Modal } from '@/components/ui/Modal'
import type { Database } from '@/lib/types/database'

type Transaction = Database['public']['Tables']['transactions']['Row'] & {
  categories?: { name: string }
}
type Category = Database['public']['Tables']['categories']['Row']

interface TransactionsPageProps {
  initialTransactions: Transaction[]
  categories: Category[]
}

export function TransactionsPageContent({
  initialTransactions,
  categories,
}: TransactionsPageProps) {
  const [transactions, setTransactions] = useState(initialTransactions)
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const router = useRouter()

  const handleEdit = useCallback((transaction: Transaction) => {
    setEditingTransaction(transaction)
    setIsModalOpen(true)
  }, [])

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false)
    setEditingTransaction(null)
  }, [])

  const handleFormSuccess = useCallback(() => {
    handleCloseModal()
    router.refresh()
  }, [handleCloseModal, router])

  const handleDeleteSuccess = useCallback(() => {
    router.refresh()
  }, [router])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Transactions</h1>
        <p className="text-gray-600">
          Record, manage, and track all your financial transactions.
        </p>
      </div>

      <TransactionForm
        categories={categories}
        editingTransaction={editingTransaction}
        onSuccess={handleFormSuccess}
      />

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Transaction History
          </h2>
          <Suspense>
            <ExportCsvButton />
          </Suspense>
        </div>
        <TransactionList
          transactions={transactions}
          onEdit={handleEdit}
          onDeleteSuccess={handleDeleteSuccess}
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Edit Transaction"
      >
        <TransactionForm
          categories={categories}
          editingTransaction={editingTransaction}
          onSuccess={handleFormSuccess}
        />
      </Modal>
    </div>
  )
}
