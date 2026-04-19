'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { signUp } from '@/lib/actions/auth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { FormError } from '@/components/ui/FormError'

const SignUpSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

type SignUpInput = z.infer<typeof SignUpSchema>

export function SignUpForm() {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<SignUpInput>({
    resolver: zodResolver(SignUpSchema),
  })

  const onSubmit = (data: SignUpInput) => {
    startTransition(async () => {
      const formData = new FormData()
      formData.append('email', data.email)
      formData.append('password', data.password)

      const result = await signUp(formData)

      if (!result.success) {
        if (result.error.fieldErrors) {
          Object.entries(result.error.fieldErrors).forEach(([field, msgs]) => {
            setError(field as keyof SignUpInput, {
              type: 'server',
              message: msgs[0],
            })
          })
        } else {
          setError('email', {
            type: 'server',
            message: result.error.message,
          })
        }
      }
    })
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-900">Sign Up</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="email" required>
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            {...register('email')}
          />
          {errors.email && (
            <FormError errors={[errors.email.message || '']} />
          )}
        </div>

        <div>
          <Label htmlFor="password" required>
            Password
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password')}
          />
          {errors.password && (
            <FormError errors={[errors.password.message || '']} />
          )}
        </div>

        <Button
          type="submit"
          size="md"
          isLoading={isPending}
          className="w-full"
        >
          Sign Up
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-600">
        Already have an account?{' '}
        <Link href="/sign-in" className="text-blue-600 hover:text-blue-700">
          Sign in
        </Link>
      </p>
    </div>
  )
}
