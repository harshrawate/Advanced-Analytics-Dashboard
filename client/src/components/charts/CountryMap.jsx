"use client"

import { useEffect, useRef } from "react"
import * as d3 from "d3"

const CountryMap = ({ data }) => {
  const svgRef = useRef()

  useEffect(() => {
    if (!data || data.length === 0) return

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()

    const width = 400
    const height = 300

    svg.attr("width", width).attr("height", height)

    // Count data by country
    const countryData = d3.rollup(
      data.filter((d) => d.country && d.country !== ""),
      (v) => v.length,
      (d) => d.country,
    )

    const countries = Array.from(countryData, ([country, count]) => ({
      country,
      count,
    }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    if (countries.length === 0) {
      svg
        .append("text")
        .attr("x", width / 2)
        .attr("y", height / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .style("fill", "#6b7280")
        .text("No country data available")
      return
    }

    const maxCount = d3.max(countries, (d) => d.count)
    const colorScale = d3.scaleSequential().domain([0, maxCount]).interpolator(d3.interpolateBlues)

    const barHeight = 24
    const barPadding = 4

    const g = svg.append("g").attr("transform", "translate(20, 20)")

    const xScale = d3
      .scaleLinear()
      .domain([0, maxCount])
      .range([0, width - 200])

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

    const bars = g
      .selectAll(".country-bar")
      .data(countries)
      .enter()
      .append("g")
      .attr("class", "country-bar")
      .attr("transform", (d, i) => `translate(0, ${i * (barHeight + barPadding)})`)

    bars
      .append("rect")
      .attr("width", 0)
      .attr("height", barHeight)
      .attr("fill", (d) => colorScale(d.count))
      .attr("rx", 4)
      .attr("ry", 4)
      .style("filter", "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))")
      .on("mouseover", function (event, d) {
        d3.select(this).transition().duration(200).style("filter", "drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2))")

        tooltip.transition().duration(200).style("opacity", 0.9)
        tooltip
          .html(`
            <div class="font-semibold">${d.country}</div>
            <div>Records: <span class="font-bold">${d.count}</span></div>
            <div>Percentage: <span class="font-bold">${((d.count / data.length) * 100).toFixed(1)}%</span></div>
          `)
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 28 + "px")
      })
      .on("mouseout", function () {
        d3.select(this).transition().duration(200).style("filter", "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))")

        tooltip.transition().duration(500).style("opacity", 0)
      })
      .transition()
      .duration(1000)
      .delay((d, i) => i * 100)
      .attr("width", (d) => xScale(d.count))

    bars
      .append("text")
      .attr("x", -5)
      .attr("y", barHeight / 2)
      .attr("dy", ".35em")
      .attr("text-anchor", "end")
      .style("font-size", "11px")
      .style("fill", "#6b7280")
      .style("font-weight", "500")
      .text((d) => (d.country.length > 15 ? d.country.substring(0, 15) + "..." : d.country))

    bars
      .append("text")
      .attr("x", (d) => xScale(d.count) + 8)
      .attr("y", barHeight / 2)
      .attr("dy", ".35em")
      .style("font-size", "11px")
      .style("fill", "#6b7280")
      .style("font-weight", "600")
      .text((d) => d.count)
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

export default CountryMap
