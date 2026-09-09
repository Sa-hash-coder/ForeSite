const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
require("dotenv").config({ path: path.join(__dirname, "../../.env") });
require("dotenv").config();

const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");

// Routes
const authRoutes = require("./routes/authRoutes");
const reportRoutes = require("./routes/reportRoutes");
const alertRoutes = require("./routes/alertRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const taskRoutes = require("./routes/taskRoutes");
const adminRoutes = require("./routes/adminRoutes");
const aiRoutes = require("./routes/aiRoutes");
const apiRoutes = require("./routes/apiRoutes");

// Middleware
const errorHandler = require("./middleware/errorHandler");
const { checkAiHealth } = require("./services/aiService");

const app = express();

// ─── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.CLIENT_URL || "http://localhost:3000",
  "http://localhost:3000",
  "http://localhost:5173",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, Postman, mobile apps)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("CORS not allowed for this origin"));
    },
    credentials: true,
  })
);

// ─── BODY PARSING ─────────────────────────────────────────────────────────────
// Increase limit to support base64 image uploads (up to ~15MB raw base64)
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

// ─── REQUEST LOGGING ──────────────────────────────────────────────────────────
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const ms = Date.now() - start;
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} → ${res.statusCode} (${ms}ms)`
    );
  });
  next();
});

// ─── ROUTES ───────────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/ai", aiRoutes);

// Auxiliary / legacy user and submission endpoints
app.use("/api", apiRoutes);
app.use("/", apiRoutes);

// ─── HEALTH CHECK ─────────────────────────────────────────────────────────────
app.get("/api/health", async (req, res) => {
  const aiHealth = await checkAiHealth().catch(() => ({ status: "DOWN" }));
  res.json({
    status: "UP",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    aiService: aiHealth.status || "UNKNOWN",
    aiModelLoaded: aiHealth.model_loaded || false,
  });
});

// ─── 404 HANDLER ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ─── GLOBAL ERROR HANDLER ─────────────────────────────────────────────────────
app.use(errorHandler);

// ─── START SERVER ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    if (!process.env.JWT_SECRET) {
      process.env.JWT_SECRET = "foresite_dev_jwt_secret_change_in_production";
      console.warn("⚠️  JWT_SECRET not set — using dev fallback secret");
    }

    if (process.env.MONGO_URI) {
      await mongoose.connect(process.env.MONGO_URI);
      console.log("✅ MongoDB connected");
    } else {
      try {
        const defaultUri = "mongodb://localhost:27017/foresite";
        console.warn("⚠️  MONGO_URI not set — attempting local default: " + defaultUri);
        await mongoose.connect(defaultUri, { serverSelectionTimeoutMS: 2000 });
        console.log("✅ MongoDB connected (local default)");
      } catch (mongoErr) {
        console.warn("⚠️  Running without MongoDB connection:", mongoErr.message);
      }
    }

    const server = app.listen(PORT, () => {
      console.log(`✅ ForeSite API server running on port ${PORT}`);
      console.log(`   Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`   AI Service:  ${process.env.AI_SERVICE_URL || "http://localhost:8000"}`);
    });
    return server;
  } catch (err) {
    console.error("❌ Failed to start server:", err.message);
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
