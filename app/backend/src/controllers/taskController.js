const taskService = require("../services/taskService");
const { success, successPaginated } = require("../utils/respond");

/**
 * POST /api/tasks
 * Safety officer creates a maintenance task.
 */
exports.createTask = async (req, res, next) => {
  try {
    const task = await taskService.createTask(req.body, req.user);
    success(res, task, 201);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/tasks
 * Role-filtered paginated task list.
 */
exports.getTasks = async (req, res, next) => {
  try {
    const { tasks, pagination } = await taskService.getTasks(
      req.user,
      req.query
    );
    successPaginated(res, tasks, pagination);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/tasks/:id
 * Full task detail with enriched report + AI risk context.
 */
exports.getTaskById = async (req, res, next) => {
  try {
    const task = await taskService.getTaskById(req.params.id, req.user);
    success(res, task);
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/tasks/:id
 * Maintenance updates status (in_progress/resolved) or officer verifies.
 */
exports.updateTask = async (req, res, next) => {
  try {
    const task = await taskService.updateTask(
      req.params.id,
      req.body,
      req.user
    );
    success(res, task);
  } catch (err) {
    next(err);
  }
};
