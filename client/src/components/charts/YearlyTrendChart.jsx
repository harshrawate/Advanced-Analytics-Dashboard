"use client"

import { useEffect, useRef } from "react"
import * as d3 from "d3"

const YearlyTrendChart = ({ data }) => {
  const svgRef = useRef()

  useEffect(() => {
    if (!data || data.length === 0) return

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()

    const margin = { top: 20, right: 100, bottom: 40, left: 60 }
    const width = 500 - margin.left - margin.right
    const height = 350 - margin.bottom - margin.top

    const g = svg
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`)

    const x = d3
      .scaleLinear()
      .domain(d3.extent(data, (d) => +d._id))
      .range([0, width])

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => Math.max(d.avgIntensity, d.avgLikelihood, d.avgRelevance))])
      .nice()
      .range([height, 0])

    const line = d3
      .line()
      .x((d) => x(+d._id))
      .y((d) => y(d.value))
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

    // Prepare data for multiple lines
    const metrics = [
      { key: "avgIntensity", label: "Intensity", color: "#3b82f6" },
      { key: "avgLikelihood", label: "Likelihood", color: "#10b981" },
      { key: "avgRelevance", label: "Relevance", color: "#f59e0b" },
    ]

    metrics.forEach((metric, i) => {
      const lineData = data.map((d) => ({
        year: +d._id,
        value: d[metric.key],
        metric: metric.label,
      }))

      // Add line path
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
        .delay(i * 500)
        .attr("stroke-dashoffset", 0)

      // Add dots
      g.selectAll(`.dot-${metric.key}`)
        .data(lineData)
        .enter()
        .append("circle")
        .attr("class", `dot-${metric.key}`)
        .attr("cx", (d) => x(d.year))
        .attr("cy", (d) => y(d.value))
        .attr("r", 0)
        .attr("fill", metric.color)
        .attr("stroke", "white")
        .attr("stroke-width", 2)
        .style("filter", "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))")
        .on("mouseover", function (event, d) {
          d3.select(this).transition().duration(200).attr("r", 8)

          tooltip.transition().duration(200).style("opacity", 0.9)
          tooltip
            .html(`
              <div class="font-semibold">Year: ${d.year}</div>
              <div>${d.metric}: <span class="font-bold">${d.value.toFixed(2)}</span></div>
            `)
            .style("left", event.pageX + 10 + "px")
            .style("top", event.pageY - 28 + "px")
        })
        .on("mouseout", function () {
          d3.select(this).transition().duration(200).attr("r", 5)

          tooltip.transition().duration(500).style("opacity", 0)
        })
        .transition()
        .duration(500)
        .delay(i * 500 + 2000)
        .attr("r", 5)
    })

    // Add x axis
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).tickFormat(d3.format("d")))
      .selectAll("text")
      .style("font-size", "11px")
      .style("fill", "#6b7280")

    // Add y axis
    g.append("g").call(d3.axisLeft(y)).selectAll("text").style("font-size", "11px").style("fill", "#6b7280")

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

export default YearlyTrendChart
