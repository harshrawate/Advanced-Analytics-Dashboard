import Data from "../models/Data.js"

// Legacy filters endpoint - returns data in old format for backward compatibility
export const getLegacyFilters = async (req, res) => {
  try {
    const [endYears, topics, sectors, regions, pestles, sources, countries, cities] = await Promise.all([
      Data.distinct("end_year"),
      Data.distinct("topic"),
      Data.distinct("sector"),
      Data.distinct("region"),
      Data.distinct("pestle"),
      Data.distinct("source"),
      Data.distinct("country"),
      Data.distinct("city"),
    ])

    // Return in old format (without success wrapper)
    res.json({
      endYears: endYears.filter((year) => year && year !== "").sort(),
      topics: topics.filter((topic) => topic && topic !== "").sort(),
      sectors: sectors.filter((sector) => sector && sector !== "").sort(),
      regions: regions.filter((region) => region && region !== "").sort(),
      pestles: pestles.filter((pestle) => pestle && pestle !== "").sort(),
      sources: sources.filter((source) => source && source !== "").sort(),
      countries: countries.filter((country) => country && country !== "").sort(),
      cities: cities.filter((city) => city && city !== "").sort(),
    })
  } catch (error) {
    console.error("Error in getLegacyFilters:", error)
    res.status(500).json({ error: error.message })
  }
}

// Legacy data endpoint - returns data in old format for backward compatibility
export const getLegacyData = async (req, res) => {
  try {
    const { end_year, topic, sector, region, pestle, source, swot, country, city } = req.query

    const filter = {}

    if (end_year) filter.end_year = end_year
    if (topic) filter.topic = new RegExp(topic, "i")
    if (sector) filter.sector = new RegExp(sector, "i")
    if (region) filter.region = new RegExp(region, "i")
    if (pestle) filter.pestle = new RegExp(pestle, "i")
    if (source) filter.source = new RegExp(source, "i")
    if (swot) filter.swot = new RegExp(swot, "i")
    if (country) filter.country = new RegExp(country, "i")
    if (city) filter.city = new RegExp(city, "i")

    const data = await Data.find(filter)
    
    // Return in old format (raw array, no wrapper)
    res.json(data)
  } catch (error) {
    console.error("Error in getLegacyData:", error)
    res.status(500).json({ error: error.message })
  }
}