const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");

// Import routes
const vehicleRoutes = require("./routes/vehicleRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const maintenanceRoutes = require("./routes/maintenanceRoutes");
const sparePartRoutes = require("./routes/sparePartRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const reportRoutes = require("./routes/reportRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB().catch((err) => {
  console.error("Initial database connection error:", err.message);
});

// CORS Configuration
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:3000",
  process.env.CLIENT_URL,
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      
      // Allow exact match in allowedOrigins
      if (allowedOrigins.includes(origin)) return callback(null, true);
      
      // Allow all Netlify deployments (*.netlify.app)
      if (/^https:\/\/([a-zA-Z0-9_-]+\.)?netlify\.app$/.test(origin)) {
        return callback(null, true);
      }

      // Allow onrender.com preview domains
      if (/^https:\/\/([a-zA-Z0-9_-]+\.)?onrender\.com$/.test(origin)) {
        return callback(null, true);
      }

      // In non-production or if allowedOrigins contains "*", allow all
      if (process.env.NODE_ENV !== "production" || allowedOrigins.includes("*")) {
        return callback(null, true);
      }

      callback(null, true); // Permissive fallback for seamless deployment
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "FleetPulse API is running"
  });
});

app.get("/", (req, res) => {
  res.json({
    name: "FleetPulse API Server",
    version: "1.0.0",
    status: "active",
    endpoints: [
      "/api/health",
      "/api/dashboard",
      "/api/vehicles",
      "/api/services",
      "/api/maintenance",
      "/api/spare-parts",
      "/api/expenses",
      "/api/reports"
    ]
  });
});

// Mount Routes
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/maintenance", maintenanceRoutes);
app.use("/api/spare-parts", sparePartRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/reports", reportRoutes);

// 404 Handler for undefined API routes
app.use((req, res, next) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({
      success: false,
      message: `API route not found: ${req.originalUrl}`
    });
  }
  next();
});

// Centralized Error Handler
app.use(errorHandler);

// Start Server
app.listen(PORT, () => {
  console.log(`FleetPulse server running at http://localhost:${PORT}`);
});