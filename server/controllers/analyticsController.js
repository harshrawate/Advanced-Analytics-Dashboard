import Data from "../models/Data.js"

// Get intensity analytics by sector
export const getIntensityAnalytics = async (req, res) => {
  try {
    const data = await Data.aggregate([
      {
        $match: {
          sector: { $ne: "", $exists: true },
          intensity: { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: "$sector",
          avgIntensity: { $avg: "$intensity" },
          count: { $sum: 1 },
        },
      },
      { $sort: { avgIntensity: -1 } },
      { $limit: 10 },
    ])

    res.status(200).json({
      success: true,
      count: data.length,
      data
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching intensity analytics",
      error: error.message
    })
  }
}

// Get likelihood analytics by region
export const getLikelihoodAnalytics = async (req, res) => {
  try {
    const data = await Data.aggregate([
      {
        $match: {
          region: { $ne: "", $exists: true },
          likelihood: { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: "$region",
          avgLikelihood: { $avg: "$likelihood" },
          count: { $sum: 1 },
        },
      },
      { $sort: { avgLikelihood: -1 } },
    ])

    res.status(200).json({
      success: true,
      count: data.length,
      data
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching likelihood analytics",
      error: error.message
    })
  }
}

// Get relevance analytics by topic
export const getRelevanceAnalytics = async (req, res) => {
  try {
    const data = await Data.aggregate([
      {
        $match: {
          topic: { $ne: "", $exists: true },
          relevance: { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: "$topic",
          avgRelevance: { $avg: "$relevance" },
          count: { $sum: 1 },
        },
      },
      { $sort: { avgRelevance: -1 } },
      { $limit: 15 },
    ])

    res.status(200).json({
      success: true,
      count: data.length,
      data
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching relevance analytics",
      error: error.message
    })
  }
}

// Get yearly analytics
export const getYearlyAnalytics = async (req, res) => {
  try {
    const data = await Data.aggregate([
      {
        $match: {
          end_year: { $ne: "", $exists: true, $ne: null },
          intensity: { $exists: true },
          likelihood: { $exists: true },
          relevance: { $exists: true },
        },
      },
      {
        $group: {
          _id: "$end_year",
          avgIntensity: { $avg: "$intensity" },
          avgLikelihood: { $avg: "$likelihood" },
          avgRelevance: { $avg: "$relevance" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ])

    res.status(200).json({
      success: true,
      count: data.length,
      data
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching yearly analytics",
      error: error.message
    })
  }
}

// Get sectors analytics
export const getSectorsAnalytics = async (req, res) => {
  try {
    const data = await Data.aggregate([
      {
        $match: {
          sector: { $ne: "", $exists: true },
        },
      },
      {
        $group: {
          _id: "$sector",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 8 },
    ])

    res.status(200).json({
      success: true,
      count: data.length,
      data
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching sectors analytics",
      error: error.message
    })
  }
}

// Get regions analytics
export const getRegionsAnalytics = async (req, res) => {
  try {
    const data = await Data.aggregate([
      {
        $match: {
          region: { $ne: "", $exists: true },
          intensity: { $exists: true, $ne: null },
          likelihood: { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: "$region",
          avgIntensity: { $avg: "$intensity" },
          avgLikelihood: { $avg: "$likelihood" },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ])

    res.status(200).json({
      success: true,
      count: data.length,
      data
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching regions analytics",
      error: error.message
    })
  }
}

// Get impact analytics by PESTLE
export const getImpactAnalytics = async (req, res) => {
  try {
    const data = await Data.aggregate([
      {
        $match: {
          pestle: { $ne: "", $exists: true },
          impact: { $exists: true, $ne: null, $ne: "" },
        },
      },
      {
        $group: {
          _id: "$pestle",
          avgImpact: { $avg: "$impact" },
          count: { $sum: 1 },
        },
      },
      { $sort: { avgImpact: -1 } },
    ])

    res.status(200).json({
      success: true,
      count: data.length,
      data
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching impact analytics",
      error: error.message
    })
  }
}