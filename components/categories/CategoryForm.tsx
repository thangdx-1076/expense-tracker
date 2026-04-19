'use client'

import { useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createCategory } from '@/lib/actions/categories'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { FormError } from '@/components/ui/FormError'

const CategorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name must be 50 characters or fewer').trim(),
})
type CategoryInput = z.infer<typeof CategorySchema>

interface CategoryFormProps {
  onSuccess: () => void
}

export function CategoryForm({ onSuccess }: CategoryFormProps) {
  const [isPending, startTransition] = useTransition()
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    reset,
  } = useForm<CategoryInput>({
    resolver: zodResolver(CategorySchema),
  })

  const onSubmit = (data: CategoryInput) => {
    startTransition(async () => {
      const formData = new FormData()
      formData.append('name', data.name)
      const result = await createCategory(formData)
      if (result.success) {
        reset()
        onSuccess()
      } else {
        if (result.error.fieldErrors) {
          setError('name', {
            type: 'server',
            message: result.error.fieldErrors.name?.[0],
          })
        } else {
          setError('name', { type: 'server', message: result.error.message })
        }
      }
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2">
      <Label htmlFor="category-name" required>
        New Category Name
      </Label>
      <div className="flex gap-2">
        <Input
          id="category-name"
          placeholder="e.g., Groceries"
          error={errors.name?.message}
          {...register('name')}
          className="flex-1"
        />
        <Button type="submit" isLoading={isPending}>
          Add Category
        </Button>
      </div>
      {errors.name && <FormError errors={[errors.name.message || '']} />}
    </form>
  )
}
