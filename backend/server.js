const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

// Routes
const authRoutes = require("./routes/authRoutes");
const clinicRoutes = require("./routes/clinicRoutes");
const staffRoutes = require("./routes/staffRoutes");
const patientRoutes = require("./routes/patientRoutes");
const medicineRoutes = require("./routes/medicineRoutes");
const billRoutes = require("./routes/billRoutes");
const financeRoutes = require("./routes/financeRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const therapyRoutes = require("./routes/therapyRoutes");
const inventoryLedgerRoutes = require("./routes/inventoryLedgerRoutes");
const companyRoutes = require("./routes/companyRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const companyLedgerRoutes = require("./routes/companyLedgerRoutes");

const app = express();

// Trust only your deployed frontend and local development frontend
app.use(
  cors({
    origin: [
      "https://dms-frontend-gamma.vercel.app",
      "https://erp.dhruwraj.com",
      "http://localhost:5173",
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// Health check (does not require a database connection)
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Dhruwraj API is running",
  });
});

// MongoDB connection cache for Vercel serverless invocations
let connectionPromise = null;

async function connectDB() {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is missing from environment variables");
  }

  if (!connectionPromise) {
    connectionPromise = mongoose
      .connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 10000,
      })
      .then(() => {
        console.log("MongoDB connected successfully");
      })
      .catch((error) => {
        connectionPromise = null;
        throw error;
      });
  }

  await connectionPromise;
}

// Ensure MongoDB is connected before handling API requests
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);

    if (!res.headersSent) {
      res.status(503).json({
        message: "Database connection unavailable",
      });
    }
  }
});

// Existing API routes — unchanged
app.use("/api/auth", authRoutes);
app.use("/api/clinics", clinicRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/medicine", medicineRoutes);
app.use("/api/bills", billRoutes);
app.use("/api/finance", financeRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/therapies", therapyRoutes);
app.use("/api/inventory-ledger", inventoryLedgerRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/company-ledger", companyLedgerRoutes);
// Export Express app for Vercel
module.exports = app;

