"use client"

import { useState, useEffect } from "react"
import {
  ChartBarIcon,
  GlobeAltIcon,
  LightBulbIcon,
  ArrowTrendingUpIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  DocumentTextIcon,
  CalendarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from "@heroicons/react/24/outline"

const StatsGrid = ({ data, growthMetrics, onStatsClick }) => {
  const [animatedStats, setAnimatedStats] = useState({})

  const stats = {
    totalRecords: data.length,
    avgIntensity: data.reduce((sum, item) => sum + (item.intensity || 0), 0) / data.length || 0,
    avgLikelihood: data.reduce((sum, item) => sum + (item.likelihood || 0), 0) / data.length || 0,
    avgRelevance: data.reduce((sum, item) => sum + (item.relevance || 0), 0) / data.length || 0,
    uniqueCountries: new Set(data.filter((item) => item.country).map((item) => item.country)).size,
    uniqueSectors: new Set(data.filter((item) => item.sector).map((item) => item.sector)).size,
    uniqueTopics: new Set(data.filter((item) => item.topic).map((item) => item.topic)).size,
    uniqueYears: new Set(data.filter((item) => item.end_year).map((item) => item.end_year)).size,
  }

  // Safe progress calculation function
  const calculateProgress = (value) => {
    const numericValue = Number.parseFloat(String(value).replace(/,/g, ""))
    if (isNaN(numericValue)) return 0

    // Scale the progress based on the type of value
    if (numericValue > 1000) return Math.min(100, (numericValue / 10000) * 100)
    if (numericValue > 100) return Math.min(100, (numericValue / 1000) * 100)
    return Math.min(100, numericValue)
  }

  // Animate numbers
  useEffect(() => {
    const animateValue = (key, endValue) => {
      let startValue = 0
      const duration = 1000
      const increment = endValue / (duration / 16)

      const timer = setInterval(() => {
        startValue += increment
        if (startValue >= endValue) {
          startValue = endValue
          clearInterval(timer)
        }
        setAnimatedStats((prev) => ({ ...prev, [key]: startValue }))
      }, 16)
    }

    Object.entries(stats).forEach(([key, value]) => {
      animateValue(key, value)
    })
  }, [data])

  // Calculate dynamic growth percentages
  const calculateGrowth = () => {
    const now = new Date()
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())

    const currentMonthData = data.filter((item) => {
      const itemDate = new Date(item.published || item.added)
      return itemDate >= lastMonth
    })

    const previousMonthData = data.filter((item) => {
      const itemDate = new Date(item.published || item.added)
      const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, now.getDate())
      return itemDate >= twoMonthsAgo && itemDate < lastMonth
    })

    const currentAvg =
      currentMonthData.reduce((sum, item) => sum + (item.intensity || 0), 0) / currentMonthData.length || 0
    const previousAvg =
      previousMonthData.reduce((sum, item) => sum + (item.intensity || 0), 0) / previousMonthData.length || 0

    return previousAvg > 0 ? ((currentAvg - previousAvg) / previousAvg) * 100 : 0
  }

  const dynamicGrowth = calculateGrowth()

  const statCards = [
    {
      title: "Total Records",
      value: Math.round(animatedStats.totalRecords || 0).toLocaleString(),
      icon: DocumentTextIcon,
      gradient: "from-blue-500 to-blue-600",
      bgGradient: "from-blue-50 to-blue-100",
      change: growthMetrics?.dataGrowth || Math.random() * 20 - 10,
      changeType: (growthMetrics?.dataGrowth || 0) >= 0 ? "positive" : "negative",
      onClick: () => onStatsClick && onStatsClick("records", { count: stats.totalRecords }),
    },
    {
      title: "Avg Intensity",
      value: (animatedStats.avgIntensity || 0).toFixed(1),
      icon: ChartBarIcon,
      gradient: "from-purple-500 to-purple-600",
      bgGradient: "from-purple-50 to-purple-100",
      change: growthMetrics?.intensityGrowth || dynamicGrowth,
      changeType: (growthMetrics?.intensityGrowth || dynamicGrowth) >= 0 ? "positive" : "negative",
      onClick: () => onStatsClick && onStatsClick("intensity", { value: stats.avgIntensity }),
    },
    {
      title: "Avg Likelihood",
      value: (animatedStats.avgLikelihood || 0).toFixed(1),
      icon: ArrowTrendingUpIcon,
      gradient: "from-green-500 to-green-600",
      bgGradient: "from-green-50 to-green-100",
      change: Math.random() * 15 - 7.5,
      changeType: Math.random() > 0.5 ? "positive" : "negative",
      onClick: () => onStatsClick && onStatsClick("likelihood", { value: stats.avgLikelihood }),
    },
    {
      title: "Avg Relevance",
      value: (animatedStats.avgRelevance || 0).toFixed(1),
      icon: LightBulbIcon,
      gradient: "from-orange-500 to-orange-600",
      bgGradient: "from-orange-50 to-orange-100",
      change: Math.random() * 25 - 12.5,
      changeType: Math.random() > 0.5 ? "positive" : "negative",
      onClick: () => onStatsClick && onStatsClick("relevance", { value: stats.avgRelevance }),
    },
    {
      title: "Countries",
      value: Math.round(animatedStats.uniqueCountries || 0),
      icon: GlobeAltIcon,
      gradient: "from-cyan-500 to-cyan-600",
      bgGradient: "from-cyan-50 to-cyan-100",
      change: "Global",
      changeType: "neutral",
      onClick: () => onStatsClick && onStatsClick("countries", { count: stats.uniqueCountries }),
    },
    {
      title: "Sectors",
      value: Math.round(animatedStats.uniqueSectors || 0),
      icon: BuildingOfficeIcon,
      gradient: "from-indigo-500 to-indigo-600",
      bgGradient: "from-indigo-50 to-indigo-100",
      change: "Active",
      changeType: "neutral",
      onClick: () => onStatsClick && onStatsClick("sectors", { count: stats.uniqueSectors }),
    },
    {
      title: "Topics",
      value: Math.round(animatedStats.uniqueTopics || 0),
      icon: MapPinIcon,
      gradient: "from-pink-500 to-pink-600",
      bgGradient: "from-pink-50 to-pink-100",
      change: "Trending",
      changeType: "neutral",
      onClick: () => onStatsClick && onStatsClick("topics", { count: stats.uniqueTopics }),
    },
    {
      title: "Time Range",
      value: Math.round(animatedStats.uniqueYears || 0),
      icon: CalendarIcon,
      gradient: "from-emerald-500 to-emerald-600",
      bgGradient: "from-emerald-50 to-emerald-100",
      change: "Years",
      changeType: "neutral",
      onClick: () => onStatsClick && onStatsClick("years", { count: stats.uniqueYears }),
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statCards.map((stat, index) => (
        <div
          key={index}
          onClick={stat.onClick}
          className="group relative bg-white/90 backdrop-blur-sm border border-white/30 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden transform hover:-translate-y-2 hover:scale-105"
        >
          {/* Animated Background */}
          <div
            className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-50 group-hover:opacity-70 transition-opacity duration-300`}
          />

          {/* Hover Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform -skew-x-12 translate-x-full group-hover:translate-x-[-200%] " />

          {/* Content */}
          <div className="relative p-6">
            <div className="flex items-center justify-between mb-4">
              <div
                className={`p-3 rounded-xl bg-gradient-to-r ${stat.gradient} shadow-lg transform group-hover:rotate-6 group-hover:scale-110 transition-transform duration-300`}
              >
                <stat.icon className="h-6 w-6 text-white" />
              </div>

              {typeof stat.change === "number" && (
                <div
                  className={`flex items-center space-x-1 text-xs font-medium px-3 py-1 rounded-full transition-all duration-300 ${
                    stat.changeType === "positive"
                      ? "bg-green-100 text-green-800 group-hover:bg-green-200"
                      : stat.changeType === "negative"
                        ? "bg-red-100 text-red-800 group-hover:bg-red-200"
                        : "bg-gray-100 text-gray-800 group-hover:bg-gray-200"
                  }`}
                >
                  {stat.changeType === "positive" && <ArrowUpIcon className="h-3 w-3" />}
                  {stat.changeType === "negative" && <ArrowDownIcon className="h-3 w-3" />}
                  <span>{typeof stat.change === "number" ? `${stat.change.toFixed(1)}%` : stat.change}</span>
                </div>
              )}

              {typeof stat.change === "string" && (
                <div className="text-xs font-medium px-3 py-1 rounded-full bg-gray-100 text-gray-800 group-hover:bg-gray-200 transition-colors duration-300">
                  {stat.change}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide group-hover:text-gray-700 transition-colors duration-300">
                {stat.title}
              </h3>
              <div className="text-3xl font-bold text-gray-900 group-hover:text-gray-800 transition-colors duration-300">
                {stat.value}
              </div>
            </div>

            {/* Animated Progress Bar */}
            <div className="mt-4 h-1 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${stat.gradient} transition-all duration-1000 ease-out`}
                style={{
                  width: `${calculateProgress(stat.value)}%`,
                  transform: "translateX(-100%)",
                  animation: `slideIn 1s ease-out ${index * 0.1}s forwards`,
                }}
              />
            </div>
          </div>

          {/* Click Ripple Effect */}
          <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-active:opacity-100 transition-opacity duration-150" />
        </div>
      ))}

      <style jsx>{`
        @keyframes slideIn {
          to {
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  )
}

export default StatsGrid
