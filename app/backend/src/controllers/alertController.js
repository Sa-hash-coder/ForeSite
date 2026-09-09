const alertService = require("../services/alertService");
const { success, successPaginated } = require("../utils/respond");

/**
 * GET /api/alerts
 * Safety officer gets paginated list of alerts with optional filters.
 */
exports.getAlerts = async (req, res, next) => {
  try {
    const { alerts, pagination } = await alertService.getAlerts(req.query);
    successPaginated(res, alerts, pagination);
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/alerts/:id/acknowledge
 * Safety officer acknowledges an alert.
 */
exports.acknowledgeAlert = async (req, res, next) => {
  try {
    const alert = await alertService.acknowledgeAlert(
      req.params.id,
      req.user._id
    );
    success(res, alert);
  } catch (err) {
    next(err);
  }
};
