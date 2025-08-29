"use client"

import { useState, useEffect } from "react"
import {
  BoltIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline"

const RealTimeMetrics = ({ data, onMetricClick }) => {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [metrics, setMetrics] = useState({})
  const [alerts, setAlerts] = useState([])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (!data || data.length === 0) return

    const now = new Date()
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const recent24h = data.filter((d) => {
      const publishedDate = new Date(d.published || d.added)
      return publishedDate >= last24Hours
    })

    const recentWeek = data.filter((d) => {
      const publishedDate = new Date(d.published || d.added)
      return publishedDate >= lastWeek
    })

    const highIntensityItems = data.filter((d) => d.intensity > 7)
    const highLikelihoodItems = data.filter((d) => d.likelihood > 3)

    const newMetrics = {
      totalDataPoints: data.length,
      recent24h: recent24h.length,
      recentWeek: recentWeek.length,
      avgIntensity: data.reduce((sum, item) => sum + (item.intensity || 0), 0) / data.length,
      highIntensityCount: highIntensityItems.length,
      highLikelihoodCount: highLikelihoodItems.length,
      activeSectors: new Set(data.filter((d) => d.sector).map((d) => d.sector)).size,
      activeRegions: new Set(data.filter((d) => d.region).map((d) => d.region)).size,
    }

    setMetrics(newMetrics)

    const newAlerts = []
    if (newMetrics.highIntensityCount > data.length * 0.1) {
      newAlerts.push({
        type: "warning",
        message: `${newMetrics.highIntensityCount} high-intensity items detected`,
        icon: ExclamationTriangleIcon,
      })
    }
    if (newMetrics.recent24h > 10) {
      newAlerts.push({
        type: "info",
        message: `${newMetrics.recent24h} new data points in last 24h`,
        icon: InformationCircleIcon,
      })
    }
    if (newMetrics.avgIntensity > 5) {
      newAlerts.push({
        type: "success",
        message: `Average intensity is ${newMetrics.avgIntensity.toFixed(1)} (Good)`,
        icon: CheckCircleIcon,
      })
    }

    setAlerts(newAlerts)
  }, [data])

  const metricCards = [
    {
      title: "Live Data Points",
      value: metrics.totalDataPoints?.toLocaleString() || "0",
      icon: BoltIcon,
      color: "blue",
      trend: "+2.3%",
      onClick: () => onMetricClick && onMetricClick("live-data", { count: metrics.totalDataPoints }),
    },
    {
      title: "24h Activity",
      value: metrics.recent24h || "0",
      icon: ClockIcon,
      color: "green",
      trend: `+${metrics.recent24h || 0}`,
      onClick: () => onMetricClick && onMetricClick("24h-activity", { count: metrics.recent24h }),
    },
    {
      title: "Weekly Trend",
      value: metrics.recentWeek || "0",
      icon: ArrowTrendingUpIcon,
      color: "purple",
      trend: "+15.7%",
      onClick: () => onMetricClick && onMetricClick("weekly-trend", { count: metrics.recentWeek }),
    },
    {
      title: "High Priority",
      value: metrics.highIntensityCount || "0",
      icon: ExclamationTriangleIcon,
      color: "orange",
      trend: "Monitor",
      onClick: () => onMetricClick && onMetricClick("high-priority", { count: metrics.highIntensityCount }),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Real-time Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Real-time Metrics</h2>
          <p className="text-sm text-gray-600">Last updated: {currentTime.toLocaleTimeString()}</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-green-600 font-medium">Live</span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((metric, index) => (
          <div
            key={metric.title}
            onClick={metric.onClick}
            className={`bg-white/95 backdrop-blur-sm border border-white/30 rounded-xl shadow-lg p-4 cursor-pointer hover:shadow-xl transition-all duration-300 border-l-4 transform hover:scale-105 hover:-translate-y-1`}
            style={{
              borderLeftColor:
                metric.color === "blue"
                  ? "#3b82f6"
                  : metric.color === "green"
                    ? "#10b981"
                    : metric.color === "purple"
                      ? "#8b5cf6"
                      : "#f59e0b",
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className={`p-2 rounded-lg`}
                style={{
                  backgroundColor:
                    metric.color === "blue"
                      ? "#dbeafe"
                      : metric.color === "green"
                        ? "#d1fae5"
                        : metric.color === "purple"
                          ? "#ede9fe"
                          : "#fef3c7",
                }}
              >
                <metric.icon
                  className={`h-5 w-5`}
                  style={{
                    color:
                      metric.color === "blue"
                        ? "#2563eb"
                        : metric.color === "green"
                          ? "#059669"
                          : metric.color === "purple"
                            ? "#7c3aed"
                            : "#d97706",
                  }}
                />
              </div>
              <div
                className={`text-xs font-medium px-2 py-1 rounded-full`}
                style={{
                  backgroundColor:
                    metric.color === "blue"
                      ? "#dbeafe"
                      : metric.color === "green"
                        ? "#d1fae5"
                        : metric.color === "purple"
                          ? "#ede9fe"
                          : "#fef3c7",
                  color:
                    metric.color === "blue"
                      ? "#1e40af"
                      : metric.color === "green"
                        ? "#065f46"
                        : metric.color === "purple"
                          ? "#5b21b6"
                          : "#92400e",
                }}
              >
                {metric.trend}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">{metric.title}</h3>
              <div className="text-2xl font-bold text-gray-900">{metric.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-900">System Alerts</h3>
          {alerts.map((alert, index) => (
            <div
              key={index}
              className={`flex items-center space-x-3 p-3 rounded-lg border transition-all duration-300 hover:shadow-md ${
                alert.type === "warning"
                  ? "bg-yellow-50 border-yellow-200 text-yellow-800"
                  : alert.type === "success"
                    ? "bg-green-50 border-green-200 text-green-800"
                    : "bg-blue-50 border-blue-200 text-blue-800"
              }`}
            >
              <alert.icon className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm font-medium">{alert.message}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default RealTimeMetrics
