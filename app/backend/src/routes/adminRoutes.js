const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const auth = require("../middleware/auth");
const roleGuard = require("../middleware/roleGuard");

router.use(auth);

// GET /api/admin/maintenance-users — for officer's task assignment dropdown
router.get(
  "/maintenance-users",
  roleGuard(["safety_officer", "admin"]),
  adminController.getMaintenanceUsers
);

// GET /api/admin/users — admin only
router.get(
  "/users",
  roleGuard(["admin"]),
  adminController.getAllUsers
);

// PATCH /api/admin/users/:id — admin only
router.patch(
  "/users/:id",
  roleGuard(["admin"]),
  adminController.updateUser
);

module.exports = router;
