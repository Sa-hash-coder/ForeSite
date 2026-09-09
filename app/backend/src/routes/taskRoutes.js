const express = require("express");
const router = express.Router();
const taskController = require("../controllers/taskController");
const auth = require("../middleware/auth");
const roleGuard = require("../middleware/roleGuard");

router.use(auth);

// POST /api/tasks — officer creates task
router.post(
  "/",
  roleGuard(["safety_officer", "admin"]),
  taskController.createTask
);

// GET /api/tasks — role-filtered list
router.get(
  "/",
  roleGuard(["maintenance", "safety_officer", "admin"]),
  taskController.getTasks
);

// GET /api/tasks/:id — full detail with report + AI context
router.get(
  "/:id",
  roleGuard(["maintenance", "safety_officer", "admin"]),
  taskController.getTaskById
);

// PATCH /api/tasks/:id — maintenance updates status, officer verifies
router.patch(
  "/:id",
  roleGuard(["maintenance", "safety_officer", "admin"]),
  taskController.updateTask
);

module.exports = router;
