"use client"

import { useEffect, useRef } from "react"
import * as d3 from "d3"

const TimeSeriesChart = ({ data }) => {
  const svgRef = useRef()

  useEffect(() => {
    if (!data || data.length === 0) return

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()

    const margin = { top: 20, right: 80, bottom: 40, left: 60 }
    const width = 500 - margin.left - margin.right
    const height = 350 - margin.top - margin.bottom

    const g = svg
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`)

    // Process data by publication date
    const timeData = data
      .filter((d) => d.published && d.intensity && d.likelihood)
      .map((d) => ({
        date: new Date(d.published),
        intensity: d.intensity,
        likelihood: d.likelihood,
        relevance: d.relevance || 0,
      }))
      .sort((a, b) => a.date - b.date)

    if (timeData.length === 0) {
      g.append("text")
        .attr("x", width / 2)
        .attr("y", height / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .style("fill", "#6b7280")
        .text("No time series data available")
      return
    }

    // Group by month for better visualization
    const monthlyData = d3.rollup(
      timeData,
      (v) => ({
        avgIntensity: d3.mean(v, (d) => d.intensity),
        avgLikelihood: d3.mean(v, (d) => d.likelihood),
        avgRelevance: d3.mean(v, (d) => d.relevance),
        count: v.length,
      }),
      (d) => d3.timeMonth(d.date),
    )

    const processedData = Array.from(monthlyData, ([date, values]) => ({
      date,
      ...values,
    })).sort((a, b) => a.date - b.date)

    const xScale = d3
      .scaleTime()
      .domain(d3.extent(processedData, (d) => d.date))
      .range([0, width])

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(processedData, (d) => Math.max(d.avgIntensity, d.avgLikelihood, d.avgRelevance))])
      .nice()
      .range([height, 0])

    const line = d3
      .line()
      .x((d) => xScale(d.date))
      .y((d) => yScale(d.value))
      .curve(d3.curveCardinal)

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

    // Define metrics and colors
    const metrics = [
      { key: "avgIntensity", label: "Intensity", color: "#3b82f6" },
      { key: "avgLikelihood", label: "Likelihood", color: "#10b981" },
      { key: "avgRelevance", label: "Relevance", color: "#f59e0b" },
    ]

    // Draw lines
    metrics.forEach((metric, i) => {
      const lineData = processedData.map((d) => ({
        date: d.date,
        value: d[metric.key],
      }))

      const path = g
        .append("path")
        .datum(lineData)
        .attr("fill", "none")
        .attr("stroke", metric.color)
        .attr("stroke-width", 3)
        .attr("stroke-linecap", "round")
        .attr("d", line)
        .style("filter", "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))")

      // Animate line drawing
      const totalLength = path.node().getTotalLength()
      path
        .attr("stroke-dasharray", totalLength + " " + totalLength)
        .attr("stroke-dashoffset", totalLength)
        .transition()
        .duration(2000)
        .delay(i * 300)
        .attr("stroke-dashoffset", 0)

      // Add dots
      g.selectAll(`.dot-${metric.key}`)
        .data(lineData)
        .enter()
        .append("circle")
        .attr("class", `dot-${metric.key}`)
        .attr("cx", (d) => xScale(d.date))
        .attr("cy", (d) => yScale(d.value))
        .attr("r", 0)
        .attr("fill", metric.color)
        .attr("stroke", "white")
        .attr("stroke-width", 2)
        .on("mouseover", function (event, d) {
          d3.select(this).transition().duration(200).attr("r", 6)

          tooltip.transition().duration(200).style("opacity", 0.9)
          tooltip
            .html(`
              <div class="font-semibold">${d3.timeFormat("%B %Y")(d.date)}</div>
              <div>${metric.label}: <span class="font-bold">${d.value.toFixed(2)}</span></div>
            `)
            .style("left", event.pageX + 10 + "px")
            .style("top", event.pageY - 28 + "px")
        })
        .on("mouseout", function () {
          d3.select(this).transition().duration(200).attr("r", 4)
          tooltip.transition().duration(500).style("opacity", 0)
        })
        .transition()
        .duration(500)
        .delay(i * 300 + 2000)
        .attr("r", 4)
    })

    // Add axes
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale).tickFormat(d3.timeFormat("%b %Y")))
      .selectAll("text")
      .style("font-size", "11px")
      .style("fill", "#6b7280")

    g.append("g").call(d3.axisLeft(yScale)).selectAll("text").style("font-size", "11px").style("fill", "#6b7280")

    // Add legend
    const legend = g.append("g").attr("transform", `translate(${width + 20}, 20)`)

    metrics.forEach((metric, i) => {
      const legendRow = legend.append("g").attr("transform", `translate(0, ${i * 25})`)

      legendRow.append("circle").attr("r", 6).attr("fill", metric.color).attr("stroke", "white").attr("stroke-width", 2)

      legendRow
        .append("text")
        .attr("x", 15)
        .attr("y", 0)
        .attr("dy", "0.35em")
        .style("font-size", "12px")
        .style("fill", "#6b7280")
        .text(metric.label)
    })

    return () => {
      d3.select("body").selectAll(".tooltip").remove()
    }
  }, [data])

  return (
    <div className="w-full overflow-x-auto">
      <svg ref={svgRef} className="w-full h-auto"></svg>
    </div>
  )
}

export default TimeSeriesChart
