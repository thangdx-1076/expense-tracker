'use client'

import { useEffect, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  createTransaction,
  updateTransaction,
} from '@/lib/actions/transactions'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { FormError } from '@/components/ui/FormError'
import type { Database } from '@/lib/types/database'

type Transaction = Database['public']['Tables']['transactions']['Row'] & {
  categories?: { name: string }
}
type Category = Database['public']['Tables']['categories']['Row']

const TransactionSchema = z.object({
  amount: z.string().refine(
    (val) => {
      const num = parseFloat(val)
      return !isNaN(num) && num > 0
    },
    { message: 'Amount must be a positive number' }
  ),
  date: z.string().date('Invalid date format'),
  description: z.string().min(1).max(255).trim(),
  type: z.enum(['income', 'expense']),
  category_id: z.string().uuid('Invalid category ID'),
})

type TransactionInput = z.infer<typeof TransactionSchema>

interface TransactionFormProps {
  categories: Category[]
  editingTransaction?: Transaction | null
  onSuccess: () => void
}

export function TransactionForm({
  categories,
  editingTransaction,
  onSuccess,
}: TransactionFormProps) {
  const [isPending, startTransition] = useTransition()
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    reset,
    watch,
  } = useForm<TransactionInput>({
    resolver: zodResolver(TransactionSchema),
    defaultValues: editingTransaction
      ? {
          amount: editingTransaction.amount.toString(),
          date: editingTransaction.date,
          description: editingTransaction.description,
          type: editingTransaction.type as 'income' | 'expense',
          category_id: editingTransaction.category_id,
        }
      : {
          type: 'expense',
          category_id: categories[0]?.id || '',
        },
  })

  const transactionType = watch('type')

  useEffect(() => {
    if (editingTransaction) {
      reset({
        amount: editingTransaction.amount.toString(),
        date: editingTransaction.date,
        description: editingTransaction.description,
        type: editingTransaction.type as 'income' | 'expense',
        category_id: editingTransaction.category_id,
      })
    }
  }, [editingTransaction, reset])

  const onSubmit = (data: TransactionInput) => {
    startTransition(async () => {
      const formData = new FormData()
      formData.append('amount', data.amount)
      formData.append('date', data.date)
      formData.append('description', data.description)
      formData.append('type', data.type)
      formData.append('category_id', data.category_id)

      const result = editingTransaction
        ? await updateTransaction(editingTransaction.id, formData)
        : await createTransaction(formData)

      if (!result.success) {
        if (result.error.fieldErrors) {
          Object.entries(result.error.fieldErrors).forEach(
            ([field, msgs]: [string, string[]]) => {
              setError(field as keyof TransactionInput, {
                type: 'server',
                message: msgs[0],
              })
            }
          )
        } else {
          setError('amount', {
            type: 'server',
            message: result.error.message,
          })
        }
      } else {
        reset()
        onSuccess()
      }
    })
  }

  if (categories.length === 0) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
        Create a category first before adding transactions.
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-white p-6 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900">
        {editingTransaction ? 'Edit Transaction' : 'New Transaction'}
      </h3>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="date" required>
            Date
          </Label>
          <Input
            id="date"
            type="date"
            error={errors.date?.message}
            {...register('date')}
          />
          {errors.date && (
            <FormError errors={[errors.date.message || '']} />
          )}
        </div>

        <div>
          <Label htmlFor="type" required>
            Type
          </Label>
          <select
            id="type"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            {...register('type')}
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </div>
      </div>

      <div>
        <Label htmlFor="amount" required>
          Amount
        </Label>
        <Input
          id="amount"
          type="number"
          placeholder="0.00"
          step="0.01"
          error={errors.amount?.message}
          {...register('amount')}
        />
        {errors.amount && (
          <FormError errors={[errors.amount.message || '']} />
        )}
      </div>

      <div>
        <Label htmlFor="category_id" required>
          Category
        </Label>
        <select
          id="category_id"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          {...register('category_id')}
        >
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        {errors.category_id && (
          <FormError errors={[errors.category_id.message || '']} />
        )}
      </div>

      <div>
        <Label htmlFor="description" required>
          Description
        </Label>
        <Input
          id="description"
          type="text"
          placeholder="e.g., Grocery shopping"
          error={errors.description?.message}
          {...register('description')}
        />
        {errors.description && (
          <FormError errors={[errors.description.message || '']} />
        )}
      </div>

      <Button
        type="submit"
        isLoading={isPending}
        className="w-full"
      >
        {editingTransaction ? 'Update Transaction' : 'Add Transaction'}
      </Button>
    </form>
  )
}
