import Data from "../models/Data.js"

// Get filtered data
export const getData = async (req, res) => {
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
    res.status(200).json({
      success: true,
      count: data.length,
      data
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching data",
      error: error.message
    })
  }
}

// Get unique values for filters
export const getFilters = async (req, res) => {
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

    res.status(200).json({
      success: true,
      filters: {
        endYears: endYears.filter((year) => year && year !== "").sort(),
        topics: topics.filter((topic) => topic && topic !== "").sort(),
        sectors: sectors.filter((sector) => sector && sector !== "").sort(),
        regions: regions.filter((region) => region && region !== "").sort(),
        pestles: pestles.filter((pestle) => pestle && pestle !== "").sort(),
        sources: sources.filter((source) => source && source !== "").sort(),
        countries: countries.filter((country) => country && country !== "").sort(),
        cities: cities.filter((city) => city && city !== "").sort(),
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching filters",
      error: error.message
    })
  }
}

// Create new data entry
export const createData = async (req, res) => {
  try {
    const newData = new Data(req.body)
    const savedData = await newData.save()
    
    res.status(201).json({
      success: true,
      message: "Data created successfully",
      data: savedData
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error creating data",
      error: error.message
    })
  }
}

// Update data entry
export const updateData = async (req, res) => {
  try {
    const { id } = req.params
    const updatedData = await Data.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    })

    if (!updatedData) {
      return res.status(404).json({
        success: false,
        message: "Data not found"
      })
    }

    res.status(200).json({
      success: true,
      message: "Data updated successfully",
      data: updatedData
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error updating data",
      error: error.message
    })
  }
}

// Delete data entry
export const deleteData = async (req, res) => {
  try {
    const { id } = req.params
    const deletedData = await Data.findByIdAndDelete(id)

    if (!deletedData) {
      return res.status(404).json({
        success: false,
        message: "Data not found"
      })
    }

    res.status(200).json({
      success: true,
      message: "Data deleted successfully"
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting data",
      error: error.message
    })
  }
}