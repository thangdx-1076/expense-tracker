interface SummaryCardsProps {
  totalIncome: number
  totalExpenses: number
  netBalance: number
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export function SummaryCards({ totalIncome, totalExpenses, netBalance }: SummaryCardsProps) {
  const isZeroState = totalIncome === 0 && totalExpenses === 0

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <p className="text-sm font-medium text-gray-500 mb-1">Total Income</p>
        <p className={`text-2xl font-bold ${isZeroState ? 'text-gray-400' : 'text-green-600'}`}>
          {formatCurrency(totalIncome)}
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <p className="text-sm font-medium text-gray-500 mb-1">Total Expenses</p>
        <p className={`text-2xl font-bold ${isZeroState ? 'text-gray-400' : 'text-red-600'}`}>
          {formatCurrency(totalExpenses)}
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <p className="text-sm font-medium text-gray-500 mb-1">Net Balance</p>
        <p
          className={`text-2xl font-bold ${
            isZeroState
              ? 'text-gray-400'
              : netBalance >= 0
              ? 'text-green-600'
              : 'text-red-600'
          }`}
        >
          {formatCurrency(netBalance)}
        </p>
      </div>
    </div>
  )
}
