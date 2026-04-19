import { getDashboardSummary } from '@/lib/actions/dashboard'
import { SummaryCards } from '@/components/dashboard/SummaryCards'
import { CategoryBreakdownChart } from '@/components/dashboard/CategoryBreakdownChart'
import { DateRangeFilter } from '@/components/dashboard/DateRangeFilter'
import { Suspense } from 'react'

export const metadata = {
  title: 'Dashboard | Expense Tracker',
  description: 'View your spending summary and insights',
}

function getDefaultDateRange() {
  const today = new Date()
  const from = new Date(today.getFullYear(), today.getMonth(), 1)
    .toISOString()
    .slice(0, 10)
  const to = today.toISOString().slice(0, 10)
  return { from, to }
}

interface DashboardPageProps {
  searchParams: Promise<{ from?: string; to?: string }>
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = await searchParams
  const defaults = getDefaultDateRange()
  const from = params.from ?? defaults.from
  const to = params.to ?? defaults.to

  const result = await getDashboardSummary({ from, to })

  const summary = result.success
    ? result.data
    : { totalIncome: 0, totalExpenses: 0, netBalance: 0, categoryBreakdown: [] }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Monthly spending summary and insights.</p>
      </div>

      <Suspense>
        <DateRangeFilter from={from} to={to} />
      </Suspense>

      <SummaryCards
        totalIncome={summary.totalIncome}
        totalExpenses={summary.totalExpenses}
        netBalance={summary.netBalance}
      />

      <CategoryBreakdownChart data={summary.categoryBreakdown} />
    </div>
  )
}

