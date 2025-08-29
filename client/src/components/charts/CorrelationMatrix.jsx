"use client"

import { useEffect, useRef } from "react"
import * as d3 from "d3"

const CorrelationMatrix = ({ data }) => {
  const svgRef = useRef()

  useEffect(() => {
    if (!data || data.length === 0) return

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()

    const margin = { top: 50, right: 50, bottom: 50, left: 50 }
    const width = 400 - margin.left - margin.right
    const height = 400 - margin.top - margin.bottom

    const g = svg
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`)

    // Calculate correlations
    const metrics = ["intensity", "likelihood", "relevance", "impact"]
    const validData = data.filter((d) =>
      metrics.every((metric) => d[metric] !== null && d[metric] !== undefined && !isNaN(d[metric])),
    )

    if (validData.length === 0) {
      g.append("text")
        .attr("x", width / 2)
        .attr("y", height / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .style("fill", "#6b7280")
        .text("Insufficient data for correlation analysis")
      return
    }

    const correlationMatrix = []
    metrics.forEach((metric1, i) => {
      metrics.forEach((metric2, j) => {
        const correlation = calculateCorrelation(validData, metric1, metric2)
        correlationMatrix.push({
          x: i,
          y: j,
          metric1,
          metric2,
          correlation: isNaN(correlation) ? 0 : correlation,
        })
      })
    })

    const cellSize = Math.min(width, height) / metrics.length
    const colorScale = d3.scaleSequential().domain([-1, 1]).interpolator(d3.interpolateRdBu)

    // Create tooltip
    const tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("background", "rgba(0, 0, 0, 0.9)")
      .style("color", "white")
      .style("padding", "12px")
      .style("border-radius", "8px")
      .style("font-size", "12px")
      .style("pointer-events", "none")
      .style("opacity", 0)
      .style("z-index", "1000")

    // Draw cells
    g.selectAll(".cell")
      .data(correlationMatrix)
      .enter()
      .append("rect")
      .attr("class", "cell")
      .attr("x", (d) => d.x * cellSize)
      .attr("y", (d) => d.y * cellSize)
      .attr("width", cellSize)
      .attr("height", cellSize)
      .attr("fill", (d) => colorScale(d.correlation))
      .attr("stroke", "white")
      .attr("stroke-width", 2)
      .style("opacity", 0)
      .on("mouseover", function (event, d) {
        d3.select(this).style("opacity", 1)

        tooltip.transition().duration(200).style("opacity", 0.9)
        tooltip
          .html(`
            <div class="font-semibold">${d.metric1} vs ${d.metric2}</div>
            <div>Correlation: <span class="font-bold">${d.correlation.toFixed(3)}</span></div>
            <div>Strength: <span class="font-bold">${getCorrelationStrength(d.correlation)}</span></div>
          `)
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 28 + "px")
      })
      .on("mouseout", function () {
        d3.select(this).style("opacity", 0.8)
        tooltip.transition().duration(500).style("opacity", 0)
      })
      .transition()
      .duration(1000)
      .delay((d, i) => i * 50)
      .style("opacity", 0.8)

    // Add correlation values
    g.selectAll(".correlation-text")
      .data(correlationMatrix)
      .enter()
      .append("text")
      .attr("class", "correlation-text")
      .attr("x", (d) => d.x * cellSize + cellSize / 2)
      .attr("y", (d) => d.y * cellSize + cellSize / 2)
      .attr("text-anchor", "middle")
      .attr("dy", ".35em")
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .style("fill", (d) => (Math.abs(d.correlation) > 0.5 ? "white" : "black"))
      .text((d) => d.correlation.toFixed(2))
      .style("opacity", 0)
      .transition()
      .delay(1000)
      .duration(500)
      .style("opacity", 1)

    // Add labels
    g.selectAll(".x-label")
      .data(metrics)
      .enter()
      .append("text")
      .attr("class", "x-label")
      .attr("x", (d, i) => i * cellSize + cellSize / 2)
      .attr("y", -10)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .style("font-weight", "600")
      .style("fill", "#374151")
      .text((d) => d.charAt(0).toUpperCase() + d.slice(1))

    g.selectAll(".y-label")
      .data(metrics)
      .enter()
      .append("text")
      .attr("class", "y-label")
      .attr("x", -10)
      .attr("y", (d, i) => i * cellSize + cellSize / 2)
      .attr("text-anchor", "end")
      .attr("dy", ".35em")
      .style("font-size", "12px")
      .style("font-weight", "600")
      .style("fill", "#374151")
      .text((d) => d.charAt(0).toUpperCase() + d.slice(1))

    return () => {
      d3.select("body").selectAll(".tooltip").remove()
    }
  }, [data])

  const calculateCorrelation = (data, metric1, metric2) => {
    const values1 = data.map((d) => d[metric1]).filter((v) => !isNaN(v))
    const values2 = data.map((d) => d[metric2]).filter((v) => !isNaN(v))

    if (values1.length !== values2.length || values1.length === 0) return 0

    const mean1 = values1.reduce((a, b) => a + b) / values1.length
    const mean2 = values2.reduce((a, b) => a + b) / values2.length

    let numerator = 0
    let sum1 = 0
    let sum2 = 0

    for (let i = 0; i < values1.length; i++) {
      const diff1 = values1[i] - mean1
      const diff2 = values2[i] - mean2
      numerator += diff1 * diff2
      sum1 += diff1 * diff1
      sum2 += diff2 * diff2
    }

    const denominator = Math.sqrt(sum1 * sum2)
    return denominator === 0 ? 0 : numerator / denominator
  }

  const getCorrelationStrength = (correlation) => {
    const abs = Math.abs(correlation)
    if (abs >= 0.7) return "Strong"
    if (abs >= 0.3) return "Moderate"
    return "Weak"
  }

  return (
    <div className="w-full flex justify-center">
      <svg ref={svgRef} className="w-full h-auto max-w-md"></svg>
    </div>
  )
}

export default CorrelationMatrix
