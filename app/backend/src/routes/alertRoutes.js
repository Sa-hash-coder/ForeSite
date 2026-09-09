const express = require("express");
const router = express.Router();
const alertController = require("../controllers/alertController");
const auth = require("../middleware/auth");
const roleGuard = require("../middleware/roleGuard");

router.use(auth);
router.use(roleGuard(["safety_officer", "admin"]));

// GET /api/alerts
router.get("/", alertController.getAlerts);

// PATCH /api/alerts/:id/acknowledge
router.patch("/:id/acknowledge", alertController.acknowledgeAlert);

module.exports = router;
