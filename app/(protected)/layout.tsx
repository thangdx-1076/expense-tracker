import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { NavBar } from '@/components/ui/NavBar'
import { ToastProvider } from '@/components/ui/Toast'

async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const { data, error } = await supabase.auth.getUser()

  if (error || !data?.user) {
    redirect('/sign-in')
  }

  return (
    <ToastProvider>
      <div className="min-h-screen bg-gray-50">
        <NavBar email={data.user.email ?? ''} />
        <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </ToastProvider>
  )
}

export default ProtectedLayout
