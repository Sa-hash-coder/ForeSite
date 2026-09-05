require("dotenv").config();

const express = require("express");
const cors = require("cors");
// const reportRoutes = require("./routes/reportRoutes");
// const dashboardRoutes = require("./routes/dashboardRoutes");
// const alertRoutes = require("./routes/alertRoutes");
// const taskRoutes = require("./routes/taskRoutes");

const app = express();

app.use(cors());
app.use(express.json());
// app.use("/api/reports", reportRoutes);
// app.use("/api/dashboard", dashboardRoutes);
// app.use("/api/alerts", alertRoutes);
// app.use("/api/tasks", taskRoutes);

app.get("/api/health", (req, res) => {
  res.json({
    status: "UP",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    aiService: "UP",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});