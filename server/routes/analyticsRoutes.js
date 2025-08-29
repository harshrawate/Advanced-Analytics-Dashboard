import express from "express"
import {
  getIntensityAnalytics,
  getLikelihoodAnalytics,
  getRelevanceAnalytics,
  getYearlyAnalytics,
  getSectorsAnalytics,
  getRegionsAnalytics,
  getImpactAnalytics
} from "../controllers/analyticsController.js"

const router = express.Router()

// GET /api/analytics/intensity - Get intensity analytics by sector
router.get("/intensity", getIntensityAnalytics)

// GET /api/analytics/likelihood - Get likelihood analytics by region
router.get("/likelihood", getLikelihoodAnalytics)

// GET /api/analytics/relevance - Get relevance analytics by topic
router.get("/relevance", getRelevanceAnalytics)

// GET /api/analytics/yearly - Get yearly analytics
router.get("/yearly", getYearlyAnalytics)

// GET /api/analytics/sectors - Get sectors analytics
router.get("/sectors", getSectorsAnalytics)

// GET /api/analytics/regions - Get regions analytics
router.get("/regions", getRegionsAnalytics)

// GET /api/analytics/impact - Get impact analytics by PESTLE
router.get("/impact", getImpactAnalytics)

export default router