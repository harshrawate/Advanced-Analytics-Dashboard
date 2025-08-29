"use client"

import { useState, useMemo } from "react"
import { ChevronUpIcon, ChevronDownIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline"

const DataTable = ({ data, onLoadMore, hasMore, loading }) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" })
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(25)

  const columns = [
    { key: "title", label: "Title", sortable: true },
    { key: "sector", label: "Sector", sortable: true },
    { key: "topic", label: "Topic", sortable: true },
    { key: "region", label: "Region", sortable: true },
    { key: "country", label: "Country", sortable: true },
    { key: "intensity", label: "Intensity", sortable: true },
    { key: "likelihood", label: "Likelihood", sortable: true },
    { key: "relevance", label: "Relevance", sortable: true },
    { key: "published", label: "Published", sortable: true },
  ]

  const filteredAndSortedData = useMemo(() => {
    const filtered = data.filter((item) =>
      Object.values(item).some((value) => value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())),
    )

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key] || ""
        const bValue = b[sortConfig.key] || ""

        if (typeof aValue === "number" && typeof bValue === "number") {
          return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue
        }

        const aStr = aValue.toString().toLowerCase()
        const bStr = bValue.toString().toLowerCase()

        if (sortConfig.direction === "asc") {
          return aStr < bStr ? -1 : aStr > bStr ? 1 : 0
        } else {
          return aStr > bStr ? -1 : aStr < bStr ? 1 : 0
        }
      })
    }

    return filtered
  }, [data, searchTerm, sortConfig])

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredAndSortedData.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredAndSortedData, currentPage, itemsPerPage])

  const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage)

  const handleSort = (key) => {
    setSortConfig((prevConfig) => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === "asc" ? "desc" : "asc",
    }))
  }

  const formatValue = (value, key) => {
    if (!value) return "-"

    if (key === "published" || key === "added") {
      try {
        return new Date(value).toLocaleDateString()
      } catch {
        return value
      }
    }

    if (typeof value === "number") {
      return value.toFixed(1)
    }

    if (typeof value === "string" && value.length > 30) {
      return value.substring(0, 30) + "..."
    }

    return value
  }

  return (
    <div className="bg-white/95 backdrop-blur-sm border border-white/30 rounded-xl sm:rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900">Data Table</h3>

          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search data..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 sm:pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-64 text-sm"
            />
          </div>
        </div>

        <div className="mt-3 sm:mt-4 text-xs sm:text-sm text-gray-600">
          Showing {paginatedData.length} of {filteredAndSortedData.length} records
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-full">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.sortable ? "cursor-pointer hover:bg-gray-100" : ""
                  }`}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.label}</span>
                    {column.sortable &&
                      sortConfig.key === column.key &&
                      (sortConfig.direction === "asc" ? (
                        <ChevronUpIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                      ) : (
                        <ChevronDownIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                      ))}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.map((item, index) => (
              <tr key={item._id || index} className="hover:bg-gray-50 transition-colors">
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900"
                  >
                    {formatValue(item[column.key], column.key)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="text-xs sm:text-sm text-gray-600">
          Page {currentPage} of {totalPages}
        </div>

        <div className="flex items-center justify-center sm:justify-end space-x-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-2 sm:px-3 py-1 border border-gray-300 rounded text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Previous
          </button>

          <div className="flex items-center space-x-1">
            {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
              const page = i + Math.max(1, currentPage - 1)
              if (page > totalPages) return null
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded ${
                    currentPage === page ? "bg-blue-500 text-white" : "border border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {page}
                </button>
              )
            })}
          </div>

          <button
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="px-2 sm:px-3 py-1 border border-gray-300 rounded text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      </div>

      {/* Load More */}
      {hasMore && (
        <div className="p-3 sm:p-4 border-t border-gray-200 text-center">
          <button
            onClick={onLoadMore}
            disabled={loading}
            className="bg-blue-500 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {loading ? "Loading..." : "Load More Data"}
          </button>
        </div>
      )}
    </div>
  )
}

export default DataTable
