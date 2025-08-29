import { useState, useMemo } from "react"
import { 
  LightBulbIcon, 
  ArrowTrendingUpIcon, // ✅ Fixed name
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ChartBarIcon,
  GlobeAltIcon
} from "@heroicons/react/24/outline"

const InsightCards = ({ data }) => {
  const [selectedInsight, setSelectedInsight] = useState(null)

  const insights = useMemo(() => {
    if (!data || data.length === 0) return []

    const generateInsights = () => {
      const insights = []

      // Intensity Analysis
      const avgIntensity = data.reduce((sum, item) => sum + (item.intensity || 0), 0) / data.length
      const highIntensityItems = data.filter(item => item.intensity > 7)

      if (avgIntensity > 5) {
        insights.push({
          id: 'high-intensity',
          type: 'trend',
          title: 'High Intensity Detected',
          description: `Average intensity is ${avgIntensity.toFixed(1)}, indicating significant market activity`,
          value: avgIntensity.toFixed(1),
          icon: ArrowTrendingUpIcon, // ✅ Updated icon
          color: 'blue',
          priority: 'high',
          details: `${highIntensityItems.length} items have intensity > 7`
        })
      }

      // Sector Concentration
      const sectorCounts = data.reduce((acc, item) => {
        if (item.sector) {
          acc[item.sector] = (acc[item.sector] || 0) + 1
        }
        return acc
      }, {})

      const topSector = Object.entries(sectorCounts).sort(([, a], [, b]) => b - a)[0]
      if (topSector && topSector[1] > data.length * 0.3) {
        insights.push({
          id: 'sector-concentration',
          type: 'warning',
          title: 'Sector Concentration Risk',
          description: `${topSector[0]} sector represents ${((topSector[1] / data.length) * 100).toFixed(1)}% of data`,
          value: `${((topSector[1] / data.length) * 100).toFixed(1)}%`,
          icon: ExclamationTriangleIcon,
          color: 'orange',
          priority: 'medium',
          details: `Consider diversification across other sectors`
        })
      }

      // Regional Distribution
      const regionCounts = data.reduce((acc, item) => {
        if (item.region) {
          acc[item.region] = (acc[item.region] || 0) + 1
        }
        return acc
      }, {})

      const uniqueRegions = Object.keys(regionCounts).length
      insights.push({
        id: 'regional-coverage',
        type: 'info',
        title: 'Global Coverage',
        description: `Data spans across ${uniqueRegions} regions with diverse market conditions`,
        value: uniqueRegions,
        icon: GlobeAltIcon,
        color: 'green',
        priority: 'low',
        details: `Top regions: ${Object.entries(regionCounts).sort(([, a], [, b]) => b - a).slice(0, 3).map(([region]) => region).join(', ')}`
      })

      // Likelihood Trends
      const avgLikelihood = data.reduce((sum, item) => sum + (item.likelihood || 0), 0) / data.length
      if (avgLikelihood > 3) {
        insights.push({
          id: 'high-likelihood',
          type: 'trend',
          title: 'High Probability Events',
          description: `Average likelihood is ${avgLikelihood.toFixed(1)}, suggesting probable outcomes`,
          value: avgLikelihood.toFixed(1),
          icon: ChartBarIcon,
          color: 'purple',
          priority: 'high',
          details: `${data.filter(item => item.likelihood > 3).length} items have likelihood > 3`
        })
      }

      // Topic Diversity
      const topicCounts = data.reduce((acc, item) => {
        if (item.topic) {
          acc[item.topic] = (acc[item.topic] || 0) + 1
        }
        return acc
      }, {})

      const uniqueTopics = Object.keys(topicCounts).length
      insights.push({
        id: 'topic-diversity',
        type: 'info',
        title: 'Topic Diversity',
        description: `${uniqueTopics} unique topics covered, showing comprehensive analysis`,
        value: uniqueTopics,
        icon: LightBulbIcon,
        color: 'indigo',
        priority: 'medium',
        details: `Most discussed: ${Object.entries(topicCounts).sort(([, a], [, b]) => b - a).slice(0, 3).map(([topic]) => topic).join(', ')}`
      })

      // Time-based Insights
      const recentData = data.filter(item => {
        if (!item.published) return false
        const publishDate = new Date(item.published)
        const sixMonthsAgo = new Date()
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
        return publishDate >= sixMonthsAgo
      })

      if (recentData.length > 0) {
        insights.push({
          id: 'recent-activity',
          type: 'trend',
          title: 'Recent Market Activity',
          description: `${recentData.length} recent publications in the last 6 months`,
          value: recentData.length,
          icon: InformationCircleIcon,
          color: 'cyan',
          priority: 'medium',
          details: `${((recentData.length / data.length) * 100).toFixed(1)}% of total data is recent`
        })
      }

      return insights.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 }
        return priorityOrder[b.priority] - priorityOrder[a.priority]
      })
    }

    return generateInsights()
  }, [data])

  const getColorClasses = (color) => {
    const colors = {
      blue: {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        text: 'text-blue-800',
        icon: 'text-blue-600',
        button: 'bg-blue-100 hover:bg-blue-200'
      },
      orange: {
        bg: 'bg-orange-50',
        border: 'border-orange-200',
        text: 'text-orange-800',
        icon: 'text-orange-600',
        button: 'bg-orange-100 hover:bg-orange-200'
      },
      green: {
        bg: 'bg-green-50',
        border: 'border-green-200',
        text: 'text-green-800',
        icon: 'text-green-600',
        button: 'bg-green-100 hover:bg-green-200'
      },
      purple: {
        bg: 'bg-purple-50',
        border: 'border-purple-200',
        text: 'text-purple-800',
        icon: 'text-purple-600',
        button: 'bg-purple-100 hover:bg-purple-200'
      },
      indigo: {
        bg: 'bg-indigo-50',
        border: 'border-indigo-200',
        text: 'text-indigo-800',
        icon: 'text-indigo-600',
        button: 'bg-indigo-100 hover:bg-indigo-200'
      },
      cyan: {
        bg: 'bg-cyan-50',
        border: 'border-cyan-200',
        text: 'text-cyan-800',
        icon: 'text-cyan-600',
        button: 'bg-cyan-100 hover:bg-cyan-200'
      }
    }
    return colors[color] || colors.blue
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {insights.map((insight) => {
          const colorClasses = getColorClasses(insight.color)
          return (
            <div
              key={insight.id}
              className={`${colorClasses.bg} ${colorClasses.border} border rounded-xl p-4 hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-1`}
              onClick={() => setSelectedInsight(insight)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2 rounded-lg ${colorClasses.button}`}>
                  <insight.icon className={`h-5 w-5 ${colorClasses.icon}`} />
                </div>
                <div className={`text-xs px-2 py-1 rounded-full ${colorClasses.button} ${colorClasses.text} font-medium`}>
                  {insight.priority.toUpperCase()}
                </div>
              </div>

              <h3 className={`font-semibold ${colorClasses.text} mb-2`}>
                {insight.title}
              </h3>

              <p className={`text-sm ${colorClasses.text} opacity-80 mb-3`}>
                {insight.description}
              </p>

              <div className="flex items-center justify-between">
                <div className={`text-2xl font-bold ${colorClasses.text}`}>
                  {insight.value}
                </div>
                <button className={`text-xs ${colorClasses.button} px-3 py-1 rounded-full ${colorClasses.text} hover:shadow-md transition-all`}>
                  View Details
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Insight Detail Modal */}
      {selectedInsight && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">{selectedInsight.title}</h3>
              <button
                onClick={() => setSelectedInsight(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <selectedInsight.icon className={`h-8 w-8 ${getColorClasses(selectedInsight.color).icon}`} />
                <div>
                  <div className="text-3xl font-bold text-gray-900">{selectedInsight.value}</div>
                  <div className="text-sm text-gray-600">{selectedInsight.type}</div>
                </div>
              </div>

              <p className="text-gray-700">{selectedInsight.description}</p>

              <div className="bg-gray-50 rounded-lg p-3">
                <h4 className="font-semibold text-gray-900 mb-2">Additional Details</h4>
                <p className="text-sm text-gray-600">{selectedInsight.details}</p>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setSelectedInsight(null)}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default InsightCards
