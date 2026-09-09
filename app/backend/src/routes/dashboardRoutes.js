const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");
const auth = require("../middleware/auth");
const roleGuard = require("../middleware/roleGuard");

router.use(auth);
router.use(roleGuard(["safety_officer", "admin"]));

// GET /api/dashboard
router.get("/", dashboardController.getDashboard);

module.exports = router;
