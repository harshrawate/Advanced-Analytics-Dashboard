import express from "express"
import cors from "cors"
import bodyParser from "body-parser"
import dotenv from "dotenv"

// Import configuration and middleware
import connectDB from "./config/database.js"
import { errorHandler, notFound } from "./middleware/errorHandler.js"

// Import routes
import dataRoutes from "./routes/dataRoutes.js"
import analyticsRoutes from "./routes/analyticsRoutes.js"

// Import legacy routes for backward compatibility
import legacyRoutes from "./routes/legacyRoutes.js"

// Load environment variables
dotenv.config()

// Initialize Express app
const app = express()
const PORT = process.env.PORT || 5000

// Connect to MongoDB
connectDB()

// Middleware
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// Request logging middleware (optional)
app.use((req, res, next) => {
  next()
})

// Health check route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Dashboard API is running successfully!",
    version: "1.0.0"
  })
})

// API Routes
app.use("/api", legacyRoutes) // Legacy routes for backward compatibility
app.use("/api/data", dataRoutes)
app.use("/api/analytics", analyticsRoutes)

// Error handling middleware (must be after routes)
app.use(notFound)
app.use(errorHandler)

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📊 Dashboard API: http://localhost:${PORT}`)
  console.log(`🔍 Health check: http://localhost:${PORT}/`)
})