const adminService = require("../services/adminService");
const reportService = require("../services/reportService");
const ApiError = require("../utils/ApiError");
const { success, successPaginated } = require("../utils/respond");

/**
 * GET /api/admin/maintenance-users
 * Returns all active maintenance users for task assignment dropdown.
 * Role: safety_officer, admin
 */
exports.getMaintenanceUsers = async (req, res, next) => {
  try {
    const users = await adminService.getMaintenanceUsers();
    success(res, users);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/admin/users
 * Returns all users with optional filters. Admin only.
 */
exports.getAllUsers = async (req, res, next) => {
  try {
    const { users, pagination } = await adminService.getAllUsers(req.query);
    successPaginated(res, users, pagination);
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/admin/users/:id
 * Updates user role/active status. Admin only.
 */
exports.updateUser = async (req, res, next) => {
  try {
    const user = await adminService.updateUser(req.params.id, req.body);
    success(res, user);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/ai/analyze
 * Manually re-triggers AI analysis for a report. Officer/admin only.
 */
exports.retriggerAnalysis = async (req, res, next) => {
  try {
    const { reportId } = req.body;
    if (!reportId) {
      return next(ApiError.badRequest("reportId is required"));
    }

    const result = await reportService.retriggerAiAnalysis(reportId);
    success(res, result);
  } catch (err) {
    next(err);
  }
};
