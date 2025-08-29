"use client"

import { useEffect, useRef } from "react"
import * as d3 from "d3"

const ImpactAnalysis = ({ data }) => {
  const svgRef = useRef()

  useEffect(() => {
    if (!data || data.length === 0) return

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()

    const margin = { top: 20, right: 30, bottom: 60, left: 60 }
    const width = 500 - margin.left - margin.right
    const height = 350 - margin.bottom - margin.top

    const g = svg
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`)

    const x = d3
      .scaleBand()
      .domain(data.map((d) => d._id || "Unknown"))
      .range([0, width])
      .padding(0.3)

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.avgImpact)])
      .nice()
      .range([height, 0])

    const colorScale = d3
      .scaleSequential()
      .domain([0, d3.max(data, (d) => d.avgImpact)])
      .interpolator(d3.interpolateWarm)

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

    // Add bars
    g.selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d) => x(d._id || "Unknown"))
      .attr("width", x.bandwidth())
      .attr("y", height)
      .attr("height", 0)
      .attr("fill", (d) => colorScale(d.avgImpact))
      .attr("rx", 8)
      .attr("ry", 8)
      .style("filter", "drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))")
      .on("mouseover", function (event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .style("filter", "drop-shadow(0 8px 12px rgba(0, 0, 0, 0.2))")
          .attr("transform", "translateY(-3px)")

        tooltip.transition().duration(200).style("opacity", 0.9)
        tooltip
          .html(`
            <div class="font-semibold">${d._id || "Unknown"}</div>
            <div>Avg Impact: <span class="font-bold">${d.avgImpact.toFixed(2)}</span></div>
            <div>Records: <span class="font-bold">${d.count}</span></div>
          `)
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 28 + "px")
      })
      .on("mouseout", function () {
        d3.select(this)
          .transition()
          .duration(200)
          .style("filter", "drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))")
          .attr("transform", "translateY(0px)")

        tooltip.transition().duration(500).style("opacity", 0)
      })
      .transition()
      .duration(1000)
      .delay((d, i) => i * 150)
      .attr("y", (d) => y(d.avgImpact))
      .attr("height", (d) => height - y(d.avgImpact))

    // Add x axis
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .style("text-anchor", "end")
      .style("font-size", "11px")
      .style("fill", "#6b7280")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-45)")

    // Add y axis
    g.append("g").call(d3.axisLeft(y)).selectAll("text").style("font-size", "11px").style("fill", "#6b7280")

    // Add y axis label
    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - height / 2)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .style("font-size", "12px")
      .style("fill", "#6b7280")
      .text("Average Impact")

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

export default ImpactAnalysis
