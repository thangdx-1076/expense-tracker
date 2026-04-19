'use client'

import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { updateCategory, deleteCategory } from '@/lib/actions/categories'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { FormError } from '@/components/ui/FormError'
import type { Database } from '@/lib/types/database'

type Category = Database['public']['Tables']['categories']['Row']

const RenameSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name must be 50 characters or fewer').trim(),
})
type RenameInput = z.infer<typeof RenameSchema>

interface CategoryRowProps {
  category: Category
  onMutate: () => void
}

export function CategoryRow({ category, onMutate }: CategoryRowProps) {
  const [isRenaming, setIsRenaming] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [isDeleting, startDeleteTransition] = useTransition()
  const [isUpdating, startUpdateTransition] = useTransition()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    reset,
  } = useForm<RenameInput>({
    resolver: zodResolver(RenameSchema),
    defaultValues: { name: category.name },
  })

  const handleRename = (data: RenameInput) => {
    startUpdateTransition(async () => {
      const formData = new FormData()
      formData.append('name', data.name)
      const result = await updateCategory(category.id, formData)
      if (result.success) {
        setIsRenaming(false)
        onMutate()
      } else {
        if (result.error.fieldErrors) {
          setError('name', { type: 'server', message: result.error.fieldErrors.name?.[0] })
        } else {
          setError('name', { type: 'server', message: result.error.message })
        }
      }
    })
  }

  const handleDelete = () => {
    setDeleteError(null)
    startDeleteTransition(async () => {
      const result = await deleteCategory(category.id)
      if (result.success) {
        onMutate()
      } else {
        setDeleteError(result.error.message)
      }
    })
  }

  const handleCancelRename = () => {
    setIsRenaming(false)
    reset({ name: category.name })
  }

  if (isRenaming) {
    return (
      <div className="flex flex-col gap-2 bg-white p-4 rounded-lg border border-blue-300">
        <form onSubmit={handleSubmit(handleRename)} className="flex items-center gap-2">
          <Input
            autoFocus
            error={errors.name?.message}
            {...register('name')}
            className="flex-1"
          />
          <Button type="submit" size="sm" isLoading={isUpdating}>
            Save
          </Button>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={handleCancelRename}
            disabled={isUpdating}
          >
            Cancel
          </Button>
        </form>
        {errors.name && <FormError errors={[errors.name.message || '']} />}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-gray-200 hover:shadow-sm transition">
        <span className="font-medium text-gray-900">{category.name}</span>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => { setDeleteError(null); setIsRenaming(true) }}
            disabled={isDeleting}
          >
            Rename
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={handleDelete}
            isLoading={isDeleting}
            disabled={isDeleting}
          >
            Delete
          </Button>
        </div>
      </div>
      {deleteError && (
        <p className="text-sm text-red-600 px-1">{deleteError}</p>
      )}
    </div>
  )
}
