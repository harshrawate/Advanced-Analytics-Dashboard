"use client"

import { useEffect, useRef, useState } from "react"
import * as d3 from "d3"

const PredictiveAnalytics = ({ data, onInteraction, isActive }) => {
  const svgRef = useRef()
  const [predictions, setPredictions] = useState([])
  const [selectedMetric, setSelectedMetric] = useState("intensity")

  useEffect(() => {
    if (!data || data.length === 0) return

    // Generate predictions using simple linear regression
    const generatePredictions = (metric) => {
      const validData = data.filter((d) => d[metric] && d.date).sort((a, b) => a.date - b.date)

      if (validData.length < 2) return []

      // Simple linear regression
      const n = validData.length
      const sumX = validData.reduce((sum, d, i) => sum + i, 0)
      const sumY = validData.reduce((sum, d) => sum + d[metric], 0)
      const sumXY = validData.reduce((sum, d, i) => sum + i * d[metric], 0)
      const sumXX = validData.reduce((sum, d, i) => sum + i * i, 0)

      const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
      const intercept = (sumY - slope * sumX) / n

      // Generate future predictions
      const lastDate = validData[validData.length - 1].date
      const predictions = []

      for (let i = 1; i <= 12; i++) {
        const futureDate = new Date(lastDate)
        futureDate.setMonth(futureDate.getMonth() + i)

        const predictedValue = intercept + slope * (n + i - 1)
        predictions.push({
          date: futureDate,
          predicted: Math.max(0, predictedValue),
          confidence: Math.max(0.1, 1 - i * 0.05),
        })
      }

      return predictions
    }

    const newPredictions = generatePredictions(selectedMetric)
    setPredictions(newPredictions)

    // Draw the chart
    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()

    const margin = { top: 20, right: 80, bottom: 40, left: 60 }
    const width = 600 - margin.left - margin.right
    const height = 350 - margin.top - margin.bottom

    const g = svg
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`)

    // Combine historical and predicted data
    const historicalData = data.filter((d) => d[selectedMetric] && d.date).sort((a, b) => a.date - b.date)
    const allData = [...historicalData, ...newPredictions]

    if (allData.length === 0) return

    // Scales
    const xScale = d3
      .scaleTime()
      .domain(d3.extent(allData, (d) => d.date))
      .range([0, width])

    const yScale = d3
      .scaleLinear()
      .domain(d3.extent(allData, (d) => d[selectedMetric] || d.predicted))
      .nice()
      .range([height, 0])

    // Line generators
    const historicalLine = d3
      .line()
      .x((d) => xScale(d.date))
      .y((d) => yScale(d[selectedMetric]))
      .curve(d3.curveCardinal)

    const predictedLine = d3
      .line()
      .x((d) => xScale(d.date))
      .y((d) => yScale(d.predicted))
      .curve(d3.curveCardinal)

    // Add historical line
    if (historicalData.length > 1) {
      g.append("path")
        .datum(historicalData)
        .attr("fill", "none")
        .attr("stroke", "#3b82f6")
        .attr("stroke-width", 3)
        .attr("d", historicalLine)
        .style("filter", "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))")
    }

    // Add predicted line
    if (newPredictions.length > 1) {
      g.append("path")
        .datum(newPredictions)
        .attr("fill", "none")
        .attr("stroke", "#f59e0b")
        .attr("stroke-width", 3)
        .attr("stroke-dasharray", "5,5")
        .attr("d", predictedLine)
        .style("filter", "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))")
    }

    // Add confidence bands
    const area = d3
      .area()
      .x((d) => xScale(d.date))
      .y0((d) => yScale(d.predicted * (1 - (1 - d.confidence) * 0.2)))
      .y1((d) => yScale(d.predicted * (1 + (1 - d.confidence) * 0.2)))
      .curve(d3.curveCardinal)

    if (newPredictions.length > 1) {
      g.append("path").datum(newPredictions).attr("fill", "#f59e0b").attr("fill-opacity", 0.2).attr("d", area)
    }

    // Add axes
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale).tickFormat(d3.timeFormat("%b %Y")))
      .selectAll("text")
      .style("font-size", "11px")
      .style("fill", "#6b7280")

    g.append("g").call(d3.axisLeft(yScale)).selectAll("text").style("font-size", "11px").style("fill", "#6b7280")

    // Add legend
    const legend = g.append("g").attr("transform", `translate(${width - 100}, 20)`)

    legend
      .append("line")
      .attr("x1", 0)
      .attr("x2", 20)
      .attr("y1", 0)
      .attr("y2", 0)
      .attr("stroke", "#3b82f6")
      .attr("stroke-width", 3)

    legend
      .append("text")
      .attr("x", 25)
      .attr("y", 0)
      .attr("dy", "0.35em")
      .style("font-size", "12px")
      .style("fill", "#6b7280")
      .text("Historical")

    legend
      .append("line")
      .attr("x1", 0)
      .attr("x2", 20)
      .attr("y1", 20)
      .attr("y2", 20)
      .attr("stroke", "#f59e0b")
      .attr("stroke-width", 3)
      .attr("stroke-dasharray", "5,5")

    legend
      .append("text")
      .attr("x", 25)
      .attr("y", 20)
      .attr("dy", "0.35em")
      .style("font-size", "12px")
      .style("fill", "#6b7280")
      .text("Predicted")
  }, [data, selectedMetric])

  const metrics = [
    { key: "intensity", label: "Intensity", color: "blue" },
    { key: "likelihood", label: "Likelihood", color: "green" },
    { key: "relevance", label: "Relevance", color: "purple" },
    { key: "impact", label: "Impact", color: "orange" },
  ]

  return (
    <div
      className={`bg-white/95 backdrop-blur-sm border rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 ${
        isActive ? "border-blue-500 shadow-blue-200" : "border-white/30"
      }`}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Predictive Analytics</h3>
          <p className="text-sm text-gray-600">AI-powered forecasting with confidence intervals</p>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {metrics.map((metric) => (
              <option key={metric.key} value={metric.key}>
                {metric.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <svg ref={svgRef} className="w-full h-auto min-w-[600px]"></svg>
      </div>

      {predictions.length > 0 && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 bg-blue-50 rounded-lg">
            <h4 className="text-sm font-semibold text-blue-900">Next Month</h4>
            <p className="text-lg font-bold text-blue-700">{predictions[0]?.predicted.toFixed(2)}</p>
            <p className="text-xs text-blue-600">{(predictions[0]?.confidence * 100).toFixed(0)}% confidence</p>
          </div>
          <div className="p-3 bg-green-50 rounded-lg">
            <h4 className="text-sm font-semibold text-green-900">3 Months</h4>
            <p className="text-lg font-bold text-green-700">{predictions[2]?.predicted.toFixed(2)}</p>
            <p className="text-xs text-green-600">{(predictions[2]?.confidence * 100).toFixed(0)}% confidence</p>
          </div>
          <div className="p-3 bg-orange-50 rounded-lg">
            <h4 className="text-sm font-semibold text-orange-900">6 Months</h4>
            <p className="text-lg font-bold text-orange-700">{predictions[5]?.predicted.toFixed(2)}</p>
            <p className="text-xs text-orange-600">{(predictions[5]?.confidence * 100).toFixed(0)}% confidence</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default PredictiveAnalytics
