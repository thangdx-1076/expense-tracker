export default function TransactionsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Page header skeleton */}
      <div>
        <div className="h-9 bg-gray-200 rounded w-48 mb-2" />
        <div className="h-4 bg-gray-100 rounded w-72" />
      </div>

      {/* Filter bar skeleton */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex gap-4">
          <div className="flex-1 h-10 bg-gray-100 rounded" />
          <div className="flex-1 h-10 bg-gray-100 rounded" />
          <div className="flex-1 h-10 bg-gray-100 rounded" />
        </div>
      </div>

      {/* Add transaction form skeleton */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <div className="h-6 bg-gray-200 rounded w-40" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-10 bg-gray-100 rounded" />
          <div className="h-10 bg-gray-100 rounded" />
          <div className="h-10 bg-gray-100 rounded" />
          <div className="h-10 bg-gray-100 rounded" />
        </div>
        <div className="h-10 bg-gray-100 rounded" />
        <div className="h-10 bg-blue-100 rounded w-28" />
      </div>

      {/* List skeleton */}
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-lg border border-gray-200 p-4 flex items-center justify-between"
          >
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-gray-200 rounded w-48" />
              <div className="h-3 bg-gray-100 rounded w-32" />
            </div>
            <div className="flex gap-2">
              <div className="h-8 bg-gray-100 rounded w-16" />
              <div className="h-8 bg-gray-100 rounded w-16" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
