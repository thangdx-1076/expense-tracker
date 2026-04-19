export const metadata = {
  title: 'Categories | Expense Tracker',
  description: 'Manage your transaction categories',
}

export default function CategoriesPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Categories</h1>
        <p className="text-gray-600">
          Create and manage your transaction categories.
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <p className="text-gray-600">
          Category management features coming in Phase 4. For now, head to{' '}
          <a href="/transactions" className="text-blue-600 hover:text-blue-700">
            Transactions
          </a>
          {' '}to get started.
        </p>
      </div>
    </div>
  )
}
