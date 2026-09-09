const Report = require("../models/Report");
const Alert = require("../models/Alert");
const MaintenanceTask = require("../models/MaintenanceTask");
const RiskAssessment = require("../models/RiskAssessment");

/**
 * Aggregates dashboard statistics for the safety officer.
 * Returns stats, recent reports, risk distribution, and 7-day trend data.
 */
const getDashboardStats = async () => {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);

  const [
    totalReports,
    criticalAlerts,
    pendingAnalysis,
    openTasks,
    resolvedToday,
    recentReports,
    riskDistributionRaw,
    trendRaw,
  ] = await Promise.all([
    // Total reports
    Report.countDocuments(),

    // Unacknowledged critical alerts
    Alert.countDocuments({ riskLevel: "CRITICAL", isAcknowledged: false }),

    // Reports pending AI analysis
    Report.countDocuments({ status: "pending_analysis" }),

    // Open maintenance tasks (assigned or in_progress)
    MaintenanceTask.countDocuments({ status: { $in: ["assigned", "in_progress"] } }),

    // Tasks resolved today
    MaintenanceTask.countDocuments({
      status: { $in: ["resolved", "verified"] },
      updatedAt: { $gte: startOfToday },
    }),

    // 5 most recent reports with risk assessments
    Report.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("submittedBy", "name")
      .lean(),

    // Risk level distribution from risk_assessments
    RiskAssessment.aggregate([
      {
        $group: {
          _id: "$riskLevel",
          count: { $sum: 1 },
        },
      },
    ]),

    // 7-day daily trend (reports submitted + CRITICAL reports each day)
    Report.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $lookup: {
          from: "risk_assessments",
          localField: "_id",
          foreignField: "reportId",
          as: "riskAssessment",
        },
      },
      { $unwind: { path: "$riskAssessment", preserveNullAndEmpty: true } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          reports: { $sum: 1 },
          critical: {
            $sum: {
              $cond: [{ $eq: ["$riskAssessment.riskLevel", "CRITICAL"] }, 1, 0],
            },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);

  // Attach risk assessments to recent reports
  const recentReportIds = recentReports.map((r) => r._id);
  const recentRAs = await RiskAssessment.find({
    reportId: { $in: recentReportIds },
  })
    .select("reportId riskScore riskLevel sifProbability")
    .lean();

  const raMap = {};
  recentRAs.forEach((ra) => {
    raMap[ra.reportId.toString()] = ra;
  });

  const recentReportsWithRisk = recentReports.map((r) => ({
    _id: r._id,
    title: r.title,
    status: r.status,
    createdAt: r.createdAt,
    riskLevel: raMap[r._id.toString()]?.riskLevel || null,
    riskScore: raMap[r._id.toString()]?.riskScore || null,
  }));

  // Build risk distribution map
  const riskDistribution = { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 };
  riskDistributionRaw.forEach((item) => {
    if (riskDistribution.hasOwnProperty(item._id)) {
      riskDistribution[item._id] = item.count;
    }
  });

  // Build trend data array
  const trendData = trendRaw.map((day) => ({
    date: day._id,
    reports: day.reports,
    critical: day.critical || 0,
  }));

  return {
    stats: {
      totalReports,
      criticalAlerts,
      pendingAnalysis,
      openTasks,
      resolvedToday,
    },
    recentReports: recentReportsWithRisk,
    riskDistribution,
    trendData,
  };
};

module.exports = { getDashboardStats };
