export const metadata = {
  title: 'Dashboard | Expense Tracker',
  description: 'View your expense summary and insights',
}

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">
          View your spending summary and insights.
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <p className="text-gray-600">
          Dashboard features coming in Phase 5. For now, head to{' '}
          <a href="/transactions" className="text-blue-600 hover:text-blue-700">
            Transactions
          </a>
          {' '}to get started.
        </p>
      </div>
    </div>
  )
}
