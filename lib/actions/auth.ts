'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { ActionResult, ActionError } from '@/lib/types/actions'

const AuthSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

type AuthInput = z.infer<typeof AuthSchema>

export async function signIn(formData: FormData): Promise<ActionResult<void>> {
  try {
    const raw = Object.fromEntries(formData)
    const parsed = AuthSchema.safeParse(raw)

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors as Record<
        string,
        string[]
      >
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          fieldErrors,
        },
      }
    }

    const { email, password } = parsed.data
    const supabase = await createClient()

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return {
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password.',
        },
      }
    }

    redirect('/dashboard')
  } catch (err) {
    console.error('Sign in error:', err)
    if (err instanceof Error && err.message.includes('NEXT_REDIRECT')) {
      throw err // Re-throw Next.js redirect errors
    }
    return {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
      },
    }
  }
}

export async function signUp(formData: FormData): Promise<ActionResult<void>> {
  try {
    const raw = Object.fromEntries(formData)
    const parsed = AuthSchema.safeParse(raw)

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors as Record<
        string,
        string[]
      >
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          fieldErrors,
        },
      }
    }

    const { email, password } = parsed.data
    const supabase = await createClient()

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (signUpError) {
      // Check if it's a duplicate account error
      if (
        signUpError.message.includes('already registered') ||
        signUpError.message.includes('already exists')
      ) {
        return {
          success: false,
          error: {
            code: 'EMAIL_IN_USE',
            message: 'An account with this email already exists.',
          },
        }
      }
      return {
        success: false,
        error: {
          code: 'SIGN_UP_ERROR',
          message: signUpError.message,
        },
      }
    }

    // Email confirmation is disabled for local dev, so redirect immediately
    redirect('/dashboard')
  } catch (err) {
    console.error('Sign up error:', err)
    if (err instanceof Error && err.message.includes('NEXT_REDIRECT')) {
      throw err // Re-throw Next.js redirect errors
    }
    return {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
      },
    }
  }
}

export async function signOut(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/sign-in')
}
