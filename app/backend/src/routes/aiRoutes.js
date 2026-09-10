const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const auth = require("../middleware/auth");
const roleGuard = require("../middleware/roleGuard");

router.use(auth);

// POST /api/ai/analyze — manual re-trigger for officer
router.post(
  "/analyze",
  roleGuard(["safety_officer", "admin"]),
  adminController.retriggerAnalysis
);

module.exports = router;
