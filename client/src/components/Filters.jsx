"use client"

import { useState, useCallback } from "react"
import { FunnelIcon, XMarkIcon, AdjustmentsHorizontalIcon, ChartBarIcon } from "@heroicons/react/24/outline"

const Filters = ({ filters, filterOptions, onFilterChange, dataCount }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleFilterChange = useCallback(
    (field, value) => {
      onFilterChange({
        ...filters,
        [field]: value,
      })
    },
    [filters, onFilterChange],
  )

  const clearFilters = useCallback(() => {
    onFilterChange({})
  }, [onFilterChange])

  const clearSingleFilter = useCallback(
    (field) => {
      const newFilters = { ...filters }
      delete newFilters[field]
      onFilterChange(newFilters)
    },
    [filters, onFilterChange],
  )

  const activeFiltersCount = Object.values(filters).filter(Boolean).length

  const filterFields = [
    { key: "end_year", label: "End Year", options: filterOptions.endYears || [] },
    { key: "topic", label: "Topic", options: filterOptions.topics || [] },
    { key: "sector", label: "Sector", options: filterOptions.sectors || [] },
    { key: "region", label: "Region", options: filterOptions.regions || [] },
    { key: "pestle", label: "PEST", options: filterOptions.pestles || [] },
    { key: "source", label: "Source", options: filterOptions.sources || [] },
    { key: "country", label: "Country", options: filterOptions.countries || [] },
    { key: "city", label: "City", options: filterOptions.cities || [] },
  ]

  return (
    <div className="bg-white/90 backdrop-blur-sm border border-white/30 rounded-xl sm:rounded-2xl shadow-xl mb-6 sm:mb-8 overflow-visible relative z-50">
      {/* Filter Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FunnelIcon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Smart Filters</h3>
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-xs sm:text-sm text-gray-600">
                <span>
                  {activeFiltersCount > 0
                    ? `${activeFiltersCount} filter${activeFiltersCount > 1 ? "s" : ""} active`
                    : "No filters applied"}
                </span>
                <div className="flex items-center space-x-1 mt-1 sm:mt-0">
                  <ChartBarIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="font-medium">{dataCount.toLocaleString()} records</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-3">
            {activeFiltersCount > 0 && (
              <button
                onClick={clearFilters}
                className="flex items-center space-x-1 sm:space-x-2 bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 transform hover:scale-105"
              >
                <XMarkIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>Clear All</span>
              </button>
            )}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center space-x-1 sm:space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200"
            >
              <AdjustmentsHorizontalIcon className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>{isExpanded ? "Hide" : "Show"} Filters</span>
            </button>
          </div>
        </div>

        {/* Active Filters Display */}
        {activeFiltersCount > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {Object.entries(filters).map(([key, value]) => {
              if (!value) return null
              const field = filterFields.find((f) => f.key === key)
              return (
                <div
                  key={key}
                  className="flex items-center space-x-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-xs"
                >
                  <span className="font-medium">{field?.label}:</span>
                  <span>{value}</span>
                  <button onClick={() => clearSingleFilter(key)} className="ml-1 hover:bg-blue-200 rounded-full p-0.5">
                    <XMarkIcon className="h-3 w-3" />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Filter Content */}
      <div
        className={`transition-all duration-300 ease-in-out ${
          isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        } overflow-visible`}
      >
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filterFields.map(({ key, label, options }) => (
              <div key={key} className="space-y-2 relative">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">{label}</label>
                <select
                  value={filters[key] || ""}
                  onChange={(e) => handleFilterChange(key, e.target.value)}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white hover:border-blue-400 transition-colors"
                >
                  <option value="">Select {label.toLowerCase()}...</option>
                  {options.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Filters
