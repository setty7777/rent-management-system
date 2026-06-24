import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import authRoutes from "./routes/authRoutes.js";
import buildingRoutes from "./routes/buildingRoutes.js";
import floorRoutes from "./routes/floorRoutes.js";
import roomRoutes from "./routes/roomRoutes.js";
import tenantRoutes from "./routes/tenantRoutes.js";
import rentEntryRoutes from "./routes/rentRoutes.js";
import billRoutes from "./routes/billRoutes.js";

import { connectDB, sequelize } from "./config/db.js";

import "./models/index.js";

import path from "path";
import fs from "fs";

dotenv.config();

const app = express();

console.log("🔥 SERVER STARTED");

/* ================= SECURITY ================= */

// Helmet
app.use(helmet());

/* ================= CORS ================= */

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5000",
  "http://localhost:5173",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:5173",
  "https://rent-management-system-olive.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true,
  }),
);

// Rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

/* ================= BODY PARSER ================= */

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

/* ================= UPLOAD FOLDER ================= */

const uploadsPath = path.join(process.cwd(), "uploads");
const tenantsPath = path.join(uploadsPath, "tenants");

if (!fs.existsSync(tenantsPath)) {
  fs.mkdirSync(tenantsPath, { recursive: true });
}

app.use("/uploads", express.static(uploadsPath));

/* ================= HEALTH CHECKa ================= */

app.get("/", (req, res) => {
  res.json({ message: "API is running 🚀" });
});

/* ================= ROUTES ================= */

app.use("/api/auth", authRoutes);
app.use("/api/buildings", buildingRoutes);
app.use("/api/floors", floorRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/tenants", tenantRoutes);
app.use("/api/rent", rentEntryRoutes);
app.use("/api/bills", billRoutes);

/* ================= 404 HANDLER ================= */

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

/* ================= GLOBAL ERROR HANDLER ================= */

app.use((err, req, res, next) => {
  console.error("GLOBAL ERROR:", err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Server Error",
  });
});

/* ================= START SERVER ================= */

const startServer = async () => {
  try {
    await connectDB();

    // ⚠️ Only sync in development
    if (process.env.NODE_ENV === "development") {
      await sequelize.sync();
    }

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Server failed:", err);
  }
};

startServer();
