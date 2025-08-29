"use client"

import { useEffect, useRef } from "react"
import * as d3 from "d3"

const TopicCloud = ({ data }) => {
  const svgRef = useRef()

  useEffect(() => {
    if (!data || data.length === 0) return

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()

    const width = 400
    const height = 300

    svg.attr("width", width).attr("height", height)

    // Count topics
    const topicData = d3.rollup(
      data.filter((d) => d.topic && d.topic !== ""),
      (v) => v.length,
      (d) => d.topic,
    )

    const topics = Array.from(topicData, ([topic, count]) => ({
      topic,
      count,
    }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 25)

    if (topics.length === 0) {
      svg
        .append("text")
        .attr("x", width / 2)
        .attr("y", height / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .style("fill", "#6b7280")
        .text("No topic data available")
      return
    }

    const maxCount = d3.max(topics, (d) => d.count)
    const minCount = d3.min(topics, (d) => d.count)

    const fontScale = d3.scaleLinear().domain([minCount, maxCount]).range([10, 24])
    const colorScale = d3.scaleSequential().domain([minCount, maxCount]).interpolator(d3.interpolateRainbow)

    // Simple word cloud layout using force simulation
    const g = svg.append("g").attr("transform", `translate(${width / 2}, ${height / 2})`)

    const simulation = d3
      .forceSimulation(topics)
      .force("charge", d3.forceManyBody().strength(-30))
      .force("center", d3.forceCenter(0, 0))
      .force(
        "collision",
        d3.forceCollide().radius((d) => fontScale(d.count) * 0.8),
      )
      .stop()

    for (let i = 0; i < 300; ++i) simulation.tick()

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

    // Create text elements
    const words = g
      .selectAll(".word")
      .data(topics)
      .enter()
      .append("text")
      .attr("class", "word")
      .style("font-size", (d) => `${fontScale(d.count)}px`)
      .style("font-family", "Arial, sans-serif")
      .style("font-weight", "600")
      .style("fill", (d) => colorScale(d.count))
      .style("text-anchor", "middle")
      .style("cursor", "pointer")
      .attr("x", (d) => d.x)
      .attr("y", (d) => d.y)
      .text((d) => d.topic)
      .style("opacity", 0)
      .on("mouseover", function (event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .style("transform", "scale(1.2)")
          .style("filter", "drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))")

        tooltip.transition().duration(200).style("opacity", 0.9)
        tooltip
          .html(`
            <div class="font-semibold">${d.topic}</div>
            <div>Count: <span class="font-bold">${d.count}</span></div>
            <div>Percentage: <span class="font-bold">${((d.count / data.length) * 100).toFixed(1)}%</span></div>
          `)
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 28 + "px")
      })
      .on("mouseout", function () {
        d3.select(this).transition().duration(200).style("transform", "scale(1)").style("filter", "none")

        tooltip.transition().duration(500).style("opacity", 0)
      })

    // Apply transition after event handlers are attached
    words
      .transition()
      .duration(1000)
      .delay((d, i) => i * 50)
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

export default TopicCloud
