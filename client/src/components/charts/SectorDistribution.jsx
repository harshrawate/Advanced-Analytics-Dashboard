"use client"

import { useEffect, useRef } from "react"
import * as d3 from "d3"

const SectorDistribution = ({ data }) => {
  const svgRef = useRef()

  useEffect(() => {
    if (!data || data.length === 0) return

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()

    const width = 400
    const height = 300
    const radius = Math.min(width, height) / 2 - 30

    const g = svg
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`)

    const color = d3
      .scaleOrdinal()
      .domain(data.map((d) => d._id))
      .range(d3.schemeCategory10)

    const pie = d3
      .pie()
      .value((d) => d.count)
      .sort((a, b) => b.count - a.count)

    const arc = d3.arc().innerRadius(0).outerRadius(radius)

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

    const arcs = g.selectAll(".arc").data(pie(data)).enter().append("g").attr("class", "arc")

    // Add paths with animation
    arcs
      .append("path")
      .attr("d", arc)
      .attr("fill", (d) => color(d.data._id))
      .attr("stroke", "white")
      .attr("stroke-width", 2)
      .style("filter", "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))")
      .on("mouseover", function (event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .style("filter", "drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2))")
          .attr("transform", "scale(1.05)")

        tooltip.transition().duration(200).style("opacity", 0.9)
        tooltip
          .html(`
            <div class="font-semibold">${d.data._id || "Unknown"}</div>
            <div>Records: <span class="font-bold">${d.data.count}</span></div>
            <div>Percentage: <span class="font-bold">${(((d.endAngle - d.startAngle) / (2 * Math.PI)) * 100).toFixed(1)}%</span></div>
          `)
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 28 + "px")
      })
      .on("mouseout", function () {
        d3.select(this)
          .transition()
          .duration(200)
          .style("filter", "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))")
          .attr("transform", "scale(1)")

        tooltip.transition().duration(500).style("opacity", 0)
      })
      .transition()
      .duration(1000)
      .attrTween("d", (d) => {
        const interpolate = d3.interpolate({ startAngle: 0, endAngle: 0 }, d)
        return (t) => arc(interpolate(t))
      })

    // Add labels for larger segments
    arcs
      .filter((d) => d.endAngle - d.startAngle > 0.3)
      .append("text")
      .attr("transform", (d) => `translate(${arc.centroid(d)})`)
      .attr("dy", ".35em")
      .style("text-anchor", "middle")
      .style("font-size", "11px")
      .style("font-weight", "600")
      .style("fill", "white")
      .text((d) => d.data._id || "Unknown")
      .style("opacity", 0)
      .transition()
      .delay(1000)
      .duration(500)
      .style("opacity", 1)

    return () => {
      d3.select("body").selectAll(".tooltip").remove()
    }
  }, [data])

  return (
    <div className="w-full flex justify-center">
      <svg ref={svgRef} className="w-full h-auto max-w-md"></svg>
    </div>
  )
}

export default SectorDistribution
