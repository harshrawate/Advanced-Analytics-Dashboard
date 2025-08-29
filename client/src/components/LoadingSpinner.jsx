const LoadingSpinner = () => {
  return (
    <div className="flex flex-col items-center justify-center h-64 sm:h-96 space-y-4">
      <div className="relative">
        <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin absolute top-0 left-0 animate-pulse"></div>
      </div>
      <div className="text-center">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">Loading Dashboard</h3>
        <p className="text-sm sm:text-base text-gray-500">Fetching the latest insights...</p>
      </div>
    </div>
  )
}

export default LoadingSpinner
