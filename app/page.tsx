import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function HomePage() {
  const supabase = createClient()

  const { data } = await supabase.auth.getUser()

  if (data.user) {
    redirect('/dashboard')
  } else {
    redirect('/sign-in')
  }
}
