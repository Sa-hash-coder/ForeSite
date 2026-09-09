require("dotenv").config();

const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const apiRoutes = require("./routes/apiRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api", apiRoutes);
app.use("/", apiRoutes);

app.get("/api/health", (req, res) => {
  res.json({
    status: "UP",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    aiService: "UP",
  });
});

const PORT = process.env.PORT || 5000;

if (process.env.MONGO_URI) {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
      console.log("MongoDB connected");
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });
    })
    .catch((error) => {
      console.error("MongoDB connection failed:", error.message);
      process.exit(1);
    });
} else {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} without MongoDB`);
  });
}
