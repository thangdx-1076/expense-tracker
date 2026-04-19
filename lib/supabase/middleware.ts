import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // This refreshes a user's session in case it has expired.
  // It runs on every request.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protect /(protected) routes
  if (request.nextUrl.pathname.startsWith('/protected')) {
    if (!user) {
      return NextResponse.redirect(new URL('/sign-in', request.url))
    }
  }

  // Redirect authenticated users from /sign-in and /sign-up to /dashboard
  if ((request.nextUrl.pathname === '/sign-in' || request.nextUrl.pathname === '/sign-up') && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}
