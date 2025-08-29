import express from "express"
import { getLegacyFilters, getLegacyData } from "../controllers/legacyController.js"

const router = express.Router()

// Legacy routes for backward compatibility with existing frontend
// GET /api/filters - Get unique values for filters (old format)
router.get("/filters", getLegacyFilters)

// GET /api/data - Get filtered data (old format) - this will override the new data route
router.get("/data", getLegacyData)

export default router