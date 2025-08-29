"use client"

import { useEffect, useRef } from "react"
import * as d3 from "d3"

const RegionalInsights = ({ data }) => {
  const svgRef = useRef()

  useEffect(() => {
    if (!data || data.length === 0) return

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()

    const margin = { top: 20, right: 30, bottom: 80, left: 80 }
    const width = 500 - margin.left - margin.right
    const height = 350 - margin.bottom - margin.top

    const g = svg
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`)

    // Create scales
    const xScale = d3
      .scaleLinear()
      .domain(d3.extent(data, (d) => d.avgIntensity))
      .range([0, width])
      .nice()

    const yScale = d3
      .scaleLinear()
      .domain(d3.extent(data, (d) => d.avgLikelihood))
      .range([height, 0])
      .nice()

    const sizeScale = d3
      .scaleSqrt()
      .domain(d3.extent(data, (d) => d.count))
      .range([5, 30])

    const colorScale = d3.scaleOrdinal(d3.schemeSet2)

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

    // Add circles
    g.selectAll(".bubble")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "bubble")
      .attr("cx", (d) => xScale(d.avgIntensity))
      .attr("cy", (d) => yScale(d.avgLikelihood))
      .attr("r", 0)
      .attr("fill", (d, i) => colorScale(i))
      .attr("stroke", "white")
      .attr("stroke-width", 2)
      .style("opacity", 0.8)
      .style("filter", "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))")
      .on("mouseover", function (event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .style("opacity", 1)
          .style("filter", "drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))")

        tooltip.transition().duration(200).style("opacity", 0.9)
        tooltip
          .html(`
            <div class="font-semibold">${d._id || "Unknown"}</div>
            <div>Avg Intensity: <span class="font-bold">${d.avgIntensity.toFixed(2)}</span></div>
            <div>Avg Likelihood: <span class="font-bold">${d.avgLikelihood.toFixed(2)}</span></div>
            <div>Records: <span class="font-bold">${d.count}</span></div>
          `)
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 28 + "px")
      })
      .on("mouseout", function () {
        d3.select(this)
          .transition()
          .duration(200)
          .style("opacity", 0.8)
          .style("filter", "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))")

        tooltip.transition().duration(500).style("opacity", 0)
      })
      .transition()
      .duration(1000)
      .delay((d, i) => i * 100)
      .attr("r", (d) => sizeScale(d.count))

    // Add x axis
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale))
      .selectAll("text")
      .style("font-size", "11px")
      .style("fill", "#6b7280")

    // Add y axis
    g.append("g").call(d3.axisLeft(yScale)).selectAll("text").style("font-size", "11px").style("fill", "#6b7280")

    // Add axis labels
    g.append("text")
      .attr("transform", `translate(${width / 2}, ${height + margin.bottom - 10})`)
      .style("text-anchor", "middle")
      .style("font-size", "12px")
      .style("fill", "#6b7280")
      .text("Average Intensity")

    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - height / 2)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .style("font-size", "12px")
      .style("fill", "#6b7280")
      .text("Average Likelihood")

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

export default RegionalInsights
