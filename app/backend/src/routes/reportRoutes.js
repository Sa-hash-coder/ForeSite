const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");
const auth = require("../middleware/auth");
const roleGuard = require("../middleware/roleGuard");

// All report routes require authentication
router.use(auth);

// POST /api/reports — worker submits report
router.post(
  "/",
  roleGuard(["worker"]),
  reportController.createReport
);

// GET /api/reports — role-filtered list
router.get(
  "/",
  roleGuard(["worker", "safety_officer", "maintenance", "admin"]),
  reportController.getReports
);

// GET /api/reports/:id — single report with full details
router.get(
  "/:id",
  roleGuard(["worker", "safety_officer", "maintenance", "admin"]),
  reportController.getReportById
);

// PATCH /api/reports/:id — officer updates status
router.patch(
  "/:id",
  roleGuard(["safety_officer", "admin"]),
  reportController.updateReportStatus
);

module.exports = router;
