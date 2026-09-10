const Alert = require("../models/Alert");
const ApiError = require("../utils/ApiError");

/**
 * Creates an alert for a HIGH or CRITICAL risk report.
 * Called automatically by reportService after AI analysis.
 */
const createAlert = async ({ reportId, title, riskLevel, riskScore, sifProbability }) => {
  const message = `${riskLevel}: ${title} — SIF precursors detected. Immediate action required.`;

  const alert = await Alert.create({
    reportId,
    riskLevel,
    riskScore,
    sifProbability,
    message,
    isAcknowledged: false,
  });

  return alert;
};

/**
 * Gets paginated list of alerts, with optional filters.
 * Safety officer / admin only.
 */
const getAlerts = async (query) => {
  const {
    isAcknowledged,
    riskLevel,
    page = 1,
    limit = 20,
  } = query;

  const filter = {};

  if (isAcknowledged !== undefined) {
    filter.isAcknowledged = isAcknowledged === "true" || isAcknowledged === true;
  }

  if (riskLevel) {
    filter.riskLevel = riskLevel.toUpperCase();
  }

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  const [alerts, total] = await Promise.all([
    Alert.find(filter)
      .populate("reportId", "title location category")
      .populate("acknowledgedBy", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Alert.countDocuments(filter),
  ]);

  return {
    alerts,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    },
  };
};

/**
 * Acknowledges an alert. Sets isAcknowledged, acknowledgedBy, acknowledgedAt.
 */
const acknowledgeAlert = async (alertId, userId) => {
  const alert = await Alert.findById(alertId);
  if (!alert) throw ApiError.notFound("Alert not found");

  if (alert.isAcknowledged) {
    throw ApiError.badRequest("Alert is already acknowledged");
  }

  alert.isAcknowledged = true;
  alert.acknowledgedBy = userId;
  alert.acknowledgedAt = new Date();
  await alert.save();

  return alert;
};

/**
 * Gets count of unacknowledged alerts (for dashboard badge).
 */
const getUnacknowledgedCount = async () => {
  return Alert.countDocuments({ isAcknowledged: false });
};

module.exports = {
  createAlert,
  getAlerts,
  acknowledgeAlert,
  getUnacknowledgedCount,
};
