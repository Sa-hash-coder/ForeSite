const dashboardService = require("../services/dashboardService");
const { success } = require("../utils/respond");

/**
 * GET /api/dashboard
 * Aggregated stats for the safety officer dashboard.
 */
exports.getDashboard = async (req, res, next) => {
  try {
    const data = await dashboardService.getDashboardStats();
    success(res, data);
  } catch (err) {
    next(err);
  }
};
