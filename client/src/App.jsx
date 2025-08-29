"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import axios from "axios"
import Dashboard from "./components/Dashboard"
import Filters from "./components/Filters"
import LoadingSpinner from "./components/LoadingSpinner"
import "./index.css"

function App() {
  const [data, setData] = useState([])
  const [filters, setFilters] = useState({})
  const [filterOptions, setFilterOptions] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 100,
    total: 0,
    hasMore: true,
  })

  // Debounced filter change to prevent excessive API calls
  const [debouncedFilters, setDebouncedFilters] = useState({})

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters(filters)
    }, 300)

    return () => clearTimeout(timer)
  }, [filters])

  useEffect(() => {
    fetchData(1, false)
  }, [debouncedFilters])

  useEffect(() => {
    fetchFilterOptions()
  }, [])

  const fetchData = useCallback(
    async (page = 1, append = false) => {
      try {
        setLoading(true)
        setError(null)

        const queryParams = new URLSearchParams({
          ...debouncedFilters,
          page: page.toString(),
          limit: pagination.limit.toString(),
        })

        const response = await axios.get(`http://localhost:5000/api/data?${queryParams}`)

        let responseData = []
        if (response.data && response.data.success) {
          responseData = Array.isArray(response.data.data) ? response.data.data : []
        } else if (Array.isArray(response.data)) {
          responseData = response.data
        }

        if (append && page > 1) {
          setData((prev) => {
            const existingIds = new Set(prev.map((item) => item._id))
            const newItems = responseData.filter((item) => !existingIds.has(item._id))
            return [...prev, ...newItems]
          })
        } else {
          setData(responseData)
        }

        setPagination((prev) => ({
          ...prev,
          page,
          total: responseData.length,
          hasMore: responseData.length === prev.limit,
        }))
      } catch (error) {
        console.error("Error fetching data:", error)
        setError("Failed to load data. Please check if the server is running.")
        setData([])
      } finally {
        setLoading(false)
      }
    },
    [debouncedFilters, pagination.limit],
  )

  const fetchFilterOptions = async () => {
    try {
      setError(null)
      const response = await axios.get("http://localhost:5000/api/filters")

      let responseData = {}
      if (response.data && response.data.success) {
        responseData = response.data.filters || {}
      } else {
        responseData = response.data || {}
      }

      setFilterOptions(responseData)
    } catch (error) {
      console.error("Error fetching filter options:", error)
      setError("Failed to load filter options. Some features may not work properly.")
      setFilterOptions({})
    }
  }

  // Optimized filtered data with memoization
  const filteredData = useMemo(() => {
    if (!Array.isArray(data)) {
      return []
    }

    if (Object.keys(filters).length === 0) {
      return data
    }

    return data.filter((item) => {
      return Object.entries(filters).every(([key, value]) => {
        if (!value || value.trim() === "") return true
        const itemValue = item[key]
        if (!itemValue) return false
        return itemValue.toString().toLowerCase().includes(value.toLowerCase())
      })
    })
  }, [data, filters])

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters)
    setPagination((prev) => ({ ...prev, page: 1 }))
  }, [])

  const handleLoadMore = useCallback(() => {
    if (pagination.hasMore && !loading) {
      fetchData(pagination.page + 1, true)
    }
  }, [fetchData, pagination.hasMore, pagination.page, loading])

  const retryFetch = useCallback(() => {
    setError(null)
    fetchData(1, false)
    fetchFilterOptions()
  }, [fetchData])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold mb-2 sm:mb-4 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
              Advanced Analytics Dashboard
            </h1>
            <p className="text-sm sm:text-base lg:text-xl text-blue-100 max-w-3xl mx-auto mb-4 sm:mb-6">
              Real-time insights with intelligent data processing and AI-powered analytics
            </p>
            <div className="flex flex-wrap justify-center gap-2 sm:gap-4 text-xs sm:text-sm">
              <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 sm:px-4 sm:py-2">
                <span className="font-semibold">{filteredData.length}</span> Records
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 sm:px-4 sm:py-2">
                Interactive Charts
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 sm:px-4 sm:py-2">AI Insights</div>
              <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 sm:px-4 sm:py-2">
                Real-time Filtering
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Error Display */}
        {error && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
              <button
                onClick={retryFetch}
                className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700 transition-colors w-full sm:w-auto"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        <Filters
          filters={filters}
          filterOptions={filterOptions}
          onFilterChange={handleFilterChange}
          dataCount={filteredData.length}
        />

        {loading && pagination.page === 1 ? (
          <LoadingSpinner />
        ) : (
          <Dashboard data={filteredData} onLoadMore={handleLoadMore} hasMore={pagination.hasMore} loading={loading} />
        )}
      </div>
    </div>
  )
}

export default App
