"use client"

import { useState, useMemo, useCallback } from "react"
import { AnimatePresence, motion } from "framer-motion"
import StatsGrid from "./StatsGrid"
import IntensityChart from "./charts/IntensityChart"
import LikelihoodChart from "./charts/LikelihoodChart"
import RelevanceChart from "./charts/RelevanceChart"
import YearlyTrendChart from "./charts/YearlyTrendChart"
import CountryMap from "./charts/CountryMap"
import TopicCloud from "./charts/TopicCloud"
import SectorDistribution from "./charts/SectorDistribution"
import RegionalInsights from "./charts/RegionalInsights"
import ImpactAnalysis from "./charts/ImpactAnalysis"
import CorrelationMatrix from "./charts/CorrelationMatrix"
import TimeSeriesChart from "./charts/TimeSeriesChart"
import RealTimeMetrics from "./RealTimeMetrics"
import PredictiveAnalytics from "./PredictiveAnalytics"
import InsightCards from "./InsightCards"
import DataTable from "./DataTable"
import { ChevronDownIcon, ChevronUpIcon, EyeIcon, TableCellsIcon, FunnelIcon } from "@heroicons/react/24/outline"

const Dashboard = ({ data, onLoadMore, hasMore, loading }) => {
  const [selectedFilters, setSelectedFilters] = useState({})
  const [activeChart, setActiveChart] = useState(null)
  const [viewMode, setViewMode] = useState("charts")
  const [expandedSections, setExpandedSections] = useState({
    insights: true,
    primary: true,
    secondary: false,
    advanced: false,
    predictive: false,
  })

  // Optimized data processing with chunking for large datasets
  const processedData = useMemo(() => {
    if (!data || data.length === 0) return {}

    // Apply filters
    let filteredData = data
    if (Object.keys(selectedFilters).length > 0) {
      filteredData = data.filter((item) => {
        return Object.entries(selectedFilters).every(([key, value]) => {
          if (!value) return true
          return item[key]?.toString().toLowerCase().includes(value.toLowerCase())
        })
      })
    }

    // Process data in chunks to avoid blocking UI
    const processDataByField = (field, valueField, limit = 15) => {
      const grouped = filteredData
        .filter((d) => d[field] && d[valueField] !== null && d[valueField] !== undefined && d[valueField] !== "")
        .reduce((acc, item) => {
          const key = item[field]
          if (!acc[key]) {
            acc[key] = { total: 0, count: 0, items: [] }
          }
          acc[key].total += Number(item[valueField]) || 0
          acc[key].count += 1
          acc[key].items.push(item)
          return acc
        }, {})

      return Object.entries(grouped)
        .map(([key, data]) => ({
          _id: key,
          avgIntensity: valueField === "intensity" ? data.total / data.count : undefined,
          avgLikelihood: valueField === "likelihood" ? data.total / data.count : undefined,
          avgRelevance: valueField === "relevance" ? data.total / data.count : undefined,
          avgImpact: valueField === "impact" ? data.total / data.count : undefined,
          count: data.count,
          total: data.total,
          items: data.items,
          percentage: (data.count / filteredData.length) * 100,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, limit)
    }

    // Time series data processing with date validation
    const timeSeriesData = filteredData
      .filter((d) => {
        const hasDate = d.published || d.added
        const hasMetrics = d.intensity || d.likelihood || d.relevance
        return hasDate && hasMetrics
      })
      .map((d) => {
        const dateStr = d.published || d.added
        let date
        try {
          date = new Date(dateStr)
          if (isNaN(date.getTime())) {
            return null
          }
        } catch {
          return null
        }

        return {
          date,
          intensity: Number(d.intensity) || 0,
          likelihood: Number(d.likelihood) || 0,
          relevance: Number(d.relevance) || 0,
          impact: Number(d.impact) || 0,
          ...d,
        }
      })
      .filter(Boolean)
      .sort((a, b) => a.date - b.date)

    return {
      filteredData,
      intensity: processDataByField("sector", "intensity", 10),
      likelihood: processDataByField("region", "likelihood", 12),
      relevance: processDataByField("topic", "relevance", 15),
      yearly: processDataByField("end_year", "intensity", 10).filter((d) => d._id && d._id !== ""),
      sectors: processDataByField("sector", "intensity", 8),
      regions: processDataByField("region", "intensity", 10),
      impact: processDataByField("pestle", "impact", 8),
      timeSeriesData,
    }
  }, [data, selectedFilters])

  const handleChartInteraction = useCallback((chartType, data) => {
    setActiveChart({ type: chartType, data })
    if (data.filters) {
      setSelectedFilters((prev) => ({ ...prev, ...data.filters }))
    }
  }, [])

  const toggleSection = useCallback((section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }, [])

  const clearFilters = useCallback(() => {
    setSelectedFilters({})
    setActiveChart(null)
  }, [])

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 sm:h-96">
        <div className="text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">No Data Available</h3>
          <p className="text-sm sm:text-base text-gray-500">Try adjusting your filters or check your data source.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Interactive Controls */}
      <div className="bg-white/95 backdrop-blur-sm border border-white/30 rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="flex items-center space-x-2">
              <FunnelIcon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
              <span className="text-xs sm:text-sm font-medium text-gray-700">
                {Object.keys(selectedFilters).length} Active Filters
              </span>
            </div>
            {Object.keys(selectedFilters).length > 0 && (
              <button
                onClick={clearFilters}
                className="px-2 py-1 sm:px-3 sm:py-1 bg-red-100 text-red-700 rounded-lg text-xs sm:text-sm hover:bg-red-200 transition-colors"
              >
                Clear All
              </button>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode("charts")}
              className={`flex items-center space-x-1 sm:space-x-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg transition-colors text-xs sm:text-sm ${
                viewMode === "charts" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <EyeIcon className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Charts</span>
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`flex items-center space-x-1 sm:space-x-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg transition-colors text-xs sm:text-sm ${
                viewMode === "table" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <TableCellsIcon className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Table</span>
            </button>
          </div>
        </div>
      </div>

      {viewMode === "table" ? (
        <DataTable data={data} onLoadMore={onLoadMore} hasMore={hasMore} loading={loading} />
      ) : (
        <>
          {/* Enhanced Stats Grid */}
          <StatsGrid data={processedData.filteredData || []} onStatsClick={handleChartInteraction} />

          {/* Real-time Metrics */}
          <RealTimeMetrics data={processedData.filteredData || []} onMetricClick={handleChartInteraction} />

          {/* AI Insights Section */}
          <div>
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">AI-Powered Insights</h2>
              <button
                onClick={() => toggleSection("insights")}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 p-1"
              >
                {expandedSections.insights ? (
                  <ChevronUpIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                ) : (
                  <ChevronDownIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                )}
              </button>
            </div>

            <AnimatePresence>
              {expandedSections.insights && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <InsightCards data={processedData.filteredData || []} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Primary Charts Section */}
          <div>
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Primary Analytics</h2>
              <button
                onClick={() => toggleSection("primary")}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 p-1"
              >
                {expandedSections.primary ? (
                  <ChevronUpIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                ) : (
                  <ChevronDownIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                )}
              </button>
            </div>

            <AnimatePresence>
              {expandedSections.primary && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6"
                >
                  <IntensityChart
                    data={processedData.intensity || []}
                    onInteraction={handleChartInteraction}
                    isActive={activeChart?.type === "intensity"}
                  />
                  <LikelihoodChart
                    data={processedData.likelihood || []}
                    onInteraction={handleChartInteraction}
                    isActive={activeChart?.type === "likelihood"}
                  />
                  <RelevanceChart
                    data={processedData.relevance || []}
                    onInteraction={handleChartInteraction}
                    isActive={activeChart?.type === "relevance"}
                  />
                  <YearlyTrendChart
                    data={processedData.yearly || []}
                    onInteraction={handleChartInteraction}
                    isActive={activeChart?.type === "yearly"}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Secondary Charts Section */}
          <div>
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Geographic & Sector Analysis</h2>
              <button
                onClick={() => toggleSection("secondary")}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 p-1"
              >
                {expandedSections.secondary ? (
                  <ChevronUpIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                ) : (
                  <ChevronDownIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                )}
              </button>
            </div>

            <AnimatePresence>
              {expandedSections.secondary && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
                >
                  <CountryMap data={processedData.filteredData || []} />
                  <TopicCloud data={processedData.filteredData || []} />
                  <SectorDistribution data={processedData.sectors || []} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Advanced Analytics Section */}
          <div>
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Advanced Analytics</h2>
              <button
                onClick={() => toggleSection("advanced")}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 p-1"
              >
                {expandedSections.advanced ? (
                  <ChevronUpIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                ) : (
                  <ChevronDownIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                )}
              </button>
            </div>

            <AnimatePresence>
              {expandedSections.advanced && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6"
                >
                  <RegionalInsights data={processedData.regions || []} />
                  <ImpactAnalysis data={processedData.impact || []} />
                  <CorrelationMatrix data={processedData.filteredData || []} />
                  <TimeSeriesChart data={processedData.timeSeriesData || []} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Predictive Analytics Section */}
          <div>
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Predictive Insights</h2>
              <button
                onClick={() => toggleSection("predictive")}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 p-1"
              >
                {expandedSections.predictive ? (
                  <ChevronUpIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                ) : (
                  <ChevronDownIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                )}
              </button>
            </div>

            <AnimatePresence>
              {expandedSections.predictive && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <PredictiveAnalytics
                    data={processedData.timeSeriesData || []}
                    onInteraction={handleChartInteraction}
                    isActive={activeChart?.type === "predictive"}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Load More Button */}
          {hasMore && (
            <div className="text-center py-4 sm:py-6">
              <button
                onClick={onLoadMore}
                disabled={loading}
                className="bg-blue-500 text-white px-6 py-2 sm:px-8 sm:py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base"
              >
                {loading ? "Loading More..." : "Load More Data"}
              </button>
            </div>
          )}
        </>
      )}

      {/* Active Chart Details - Mobile Optimized */}
      <AnimatePresence>
        {activeChart && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed bottom-4 right-4 left-4 sm:left-auto sm:max-w-md bg-white rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-6 z-50 border border-gray-200"
          >
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Chart Details</h3>
              <button
                onClick={() => setActiveChart(null)}
                className="text-gray-400 hover:text-gray-600 text-xl sm:text-2xl p-1"
              >
                ×
              </button>
            </div>
            <div className="space-y-2 text-xs sm:text-sm text-gray-600">
              <p>
                <strong>Type:</strong> {activeChart.type}
              </p>
              <p>
                <strong>Data Points:</strong> {activeChart.data?.count || "N/A"}
              </p>
              {activeChart.data?.value && (
                <p>
                  <strong>Value:</strong> {activeChart.data.value}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Dashboard
