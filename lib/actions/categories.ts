'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { ActionResult } from '@/lib/types/actions'
import type { Database } from '@/lib/types/database'

type Category = Database['public']['Tables']['categories']['Row']

const CategorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name must be 50 characters or fewer').trim(),
})

async function getCurrentUser() {
  const supabase = createClient()
  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) return null
  return data.user
}

export async function createCategory(
  formData: FormData
): Promise<ActionResult<Category>> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return {
        success: false,
        error: { code: 'UNAUTHENTICATED', message: 'You must be signed in.' },
      }
    }

    const parsed = CategorySchema.safeParse({ name: formData.get('name') })
    if (!parsed.success) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
        },
      }
    }

    const supabase = createClient()
    const { data, error } = await supabase
      .from('categories')
      .insert({ user_id: user.id, name: parsed.data.name })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return {
          success: false,
          error: {
            code: 'DUPLICATE_NAME',
            message: 'A category with this name already exists.',
            fieldErrors: { name: ['A category with this name already exists.'] },
          },
        }
      }
      return {
        success: false,
        error: { code: 'DB_ERROR', message: 'Failed to create category.' },
      }
    }

    revalidatePath('/categories')
    revalidatePath('/transactions')
    return { success: true, data }
  } catch (err) {
    console.error('createCategory error:', err)
    return {
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred.' },
    }
  }
}

export async function updateCategory(
  id: string,
  formData: FormData
): Promise<ActionResult<Category>> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return {
        success: false,
        error: { code: 'UNAUTHENTICATED', message: 'You must be signed in.' },
      }
    }

    const parsed = CategorySchema.safeParse({ name: formData.get('name') })
    if (!parsed.success) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
        },
      }
    }

    const supabase = createClient()

    // Verify ownership
    const { data: existing, error: findError } = await supabase
      .from('categories')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (findError || !existing) {
      return {
        success: false,
        error: { code: 'NOT_FOUND', message: 'Category not found.' },
      }
    }

    const { data, error } = await supabase
      .from('categories')
      .update({ name: parsed.data.name })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return {
          success: false,
          error: {
            code: 'DUPLICATE_NAME',
            message: 'A category with this name already exists.',
            fieldErrors: { name: ['A category with this name already exists.'] },
          },
        }
      }
      return {
        success: false,
        error: { code: 'DB_ERROR', message: 'Failed to update category.' },
      }
    }

    revalidatePath('/categories')
    revalidatePath('/transactions')
    return { success: true, data }
  } catch (err) {
    console.error('updateCategory error:', err)
    return {
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred.' },
    }
  }
}

export async function deleteCategory(id: string): Promise<ActionResult<void>> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return {
        success: false,
        error: { code: 'UNAUTHENTICATED', message: 'You must be signed in.' },
      }
    }

    const supabase = createClient()

    // Verify ownership
    const { data: existing, error: findError } = await supabase
      .from('categories')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (findError || !existing) {
      return {
        success: false,
        error: { code: 'NOT_FOUND', message: 'Category not found.' },
      }
    }

    // Check for assigned transactions
    const { count, error: countError } = await supabase
      .from('transactions')
      .select('id', { count: 'exact', head: true })
      .eq('category_id', id)

    if (countError) {
      return {
        success: false,
        error: { code: 'DB_ERROR', message: 'Failed to check transactions.' },
      }
    }

    if (count && count > 0) {
      return {
        success: false,
        error: {
          code: 'HAS_TRANSACTIONS',
          message: `Cannot delete category — ${count} transaction(s) are assigned to it.`,
        },
      }
    }

    const { error } = await supabase.from('categories').delete().eq('id', id)

    if (error) {
      return {
        success: false,
        error: { code: 'DB_ERROR', message: 'Failed to delete category.' },
      }
    }

    revalidatePath('/categories')
    revalidatePath('/transactions')
    return { success: true, data: undefined }
  } catch (err) {
    console.error('deleteCategory error:', err)
    return {
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred.' },
    }
  }
}
