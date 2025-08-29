import express from "express"
import {
  getData,
  getFilters,
  createData,
  updateData,
  deleteData
} from "../controllers/dataController.js"

const router = express.Router()

// GET /api/data - Get filtered data
router.get("/", getData)

// GET /api/data/filters - Get unique values for filters
router.get("/filters", getFilters)

// POST /api/data - Create new data entry
router.post("/", createData)

// PUT /api/data/:id - Update data entry
router.put("/:id", updateData)

// DELETE /api/data/:id - Delete data entry
router.delete("/:id", deleteData)

export default router