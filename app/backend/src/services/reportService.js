const Report = require("../models/Report");
const RiskAssessment = require("../models/RiskAssessment");
const MaintenanceTask = require("../models/MaintenanceTask");
const Alert = require("../models/Alert");
const { analyzeReport } = require("./aiService");
const alertService = require("./alertService");
const ApiError = require("../utils/ApiError");

/**
 * Creates a new report, kicks off async AI analysis, and returns immediately.
 */
const createReport = async (body, userId) => {
  const report = await Report.create({
    title: body.title,
    description: body.description,
    location: body.location,
    category: body.category,
    severity: body.severity,
    imageUrl: body.imageUrl || null,
    audioUrl: body.audioUrl || null,
    submittedBy: userId,
    status: "pending_analysis",
  });

  // Kick off AI analysis asynchronously — we respond to the client immediately
  setImmediate(() => runAiAnalysis(report));

  return report.populate("submittedBy", "name email");
};

/**
 * Internal: runs AI analysis and saves results. Called async after report creation.
 */
const runAiAnalysis = async (report) => {
  try {
    const aiResult = await analyzeReport(report);

    // Save or update risk assessment (upsert prevents duplicate key on retry)
    const riskAssessment = await RiskAssessment.findOneAndUpdate(
      { reportId: report._id },
      {
        reportId: report._id,
        riskScore: aiResult.riskScore,
        riskLevel: aiResult.riskLevel,
        sifProbability: aiResult.sifProbability,
        precursors: aiResult.precursors || [],
        hazards: aiResult.hazards || [],
        recommendations: aiResult.recommendations || [],
        explanation: aiResult.explanation || "",
        extractedImageContext: aiResult.extractedImageContext || null,
        extractedAudioContext: aiResult.extractedAudioContext || null,
        modelVersion: aiResult.modelVersion || "v1.1",
        processingTimeMs: aiResult.processingTimeMs || 0,
        isFallback: aiResult.isFallback || false,
        extractionFallback: aiResult.extractionFallback || false,
      },
      { upsert: true, new: true }
    );

    // Update report status
    await Report.findByIdAndUpdate(report._id, { status: "analysis_complete" });

    // Create alert if HIGH or CRITICAL and doesn't already exist
    if (["HIGH", "CRITICAL"].includes(aiResult.riskLevel)) {
      const existingAlert = await Alert.findOne({ reportId: report._id });
      if (!existingAlert) {
        await alertService.createAlert({
          reportId: report._id,
          title: report.title,
          riskLevel: aiResult.riskLevel,
          riskScore: aiResult.riskScore,
          sifProbability: aiResult.sifProbability,
        });
      }
    }

    console.log(
      `[reportService] AI analysis complete for report ${report._id} — ${aiResult.riskLevel} (${aiResult.riskScore})`
    );
  } catch (err) {
    console.error(
      `[reportService] AI analysis failed for report ${report._id}:`,
      err.message
    );
    // Don't change status to failed — leave it as pending_analysis so officer can retry
  }
};

/**
 * Re-runs AI analysis on demand (officer retry).
 */
const retriggerAiAnalysis = async (reportId) => {
  const report = await Report.findById(reportId);
  if (!report) throw ApiError.notFound("Report not found");

  const aiResult = await analyzeReport(report);

  // Upsert risk assessment
  await RiskAssessment.findOneAndUpdate(
    { reportId: report._id },
    {
      riskScore: aiResult.riskScore,
      riskLevel: aiResult.riskLevel,
      sifProbability: aiResult.sifProbability,
      precursors: aiResult.precursors || [],
      hazards: aiResult.hazards || [],
      recommendations: aiResult.recommendations || [],
      explanation: aiResult.explanation || "",
      extractedImageContext: aiResult.extractedImageContext || null,
      extractedAudioContext: aiResult.extractedAudioContext || null,
      modelVersion: aiResult.modelVersion || "v1.1",
      processingTimeMs: aiResult.processingTimeMs || 0,
      isFallback: aiResult.isFallback || false,
      extractionFallback: aiResult.extractionFallback || false,
    },
    { upsert: true, new: true }
  );

  await Report.findByIdAndUpdate(report._id, { status: "analysis_complete" });

  // Create alert if needed and doesn't already exist
  if (["HIGH", "CRITICAL"].includes(aiResult.riskLevel)) {
    const existingAlert = await Alert.findOne({ reportId: report._id });
    if (!existingAlert) {
      await alertService.createAlert({
        reportId: report._id,
        title: report.title,
        riskLevel: aiResult.riskLevel,
        riskScore: aiResult.riskScore,
        sifProbability: aiResult.sifProbability,
      });
    }
  }

  return aiResult;
};

/**
 * Gets paginated list of reports, filtered by role.
 * - worker: own reports only
 * - safety_officer/admin: all reports
 * - maintenance: reports linked to their tasks
 */
const getReports = async (user, query) => {
  const {
    status,
    riskLevel,
    category,
    page = 1,
    limit = 20,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = query;

  // Build match filter
  const filter = {};

  if (user.role === "worker") {
    filter.submittedBy = user._id;
  } else if (user.role === "maintenance") {
    // Maintenance sees reports linked to their assigned tasks
    const tasks = await MaintenanceTask.find({ assignedTo: user._id }).select(
      "reportId"
    );
    const reportIds = tasks.map((t) => t.reportId);
    filter._id = { $in: reportIds };
  }

  if (status) filter.status = status;
  if (category) filter.category = category;

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;
  const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

  // Aggregate with optional riskLevel filter (joined from risk_assessments)
  let reports;
  let total;

  if (riskLevel) {
    // Need to join with risk_assessments to filter by riskLevel
    const pipeline = [
      { $match: filter },
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
        $match: {
          "riskAssessment.riskLevel": riskLevel.toUpperCase(),
        },
      },
      {
        $lookup: {
          from: "userinfo",
          localField: "submittedBy",
          foreignField: "_id",
          as: "submittedByUser",
        },
      },
      { $unwind: { path: "$submittedByUser", preserveNullAndEmpty: true } },
      { $sort: sort },
      { $skip: skip },
      { $limit: limitNum },
      {
        $project: {
          title: 1,
          location: 1,
          category: 1,
          severity: 1,
          status: 1,
          createdAt: 1,
          submittedBy: {
            _id: "$submittedByUser._id",
            name: "$submittedByUser.name",
          },
          riskAssessment: {
            riskScore: "$riskAssessment.riskScore",
            riskLevel: "$riskAssessment.riskLevel",
            sifProbability: "$riskAssessment.sifProbability",
          },
        },
      },
    ];

    reports = await Report.aggregate(pipeline);
    const countPipeline = pipeline.slice(0, 4); // up to the riskLevel match
    countPipeline.push({ $count: "total" });
    const countResult = await Report.aggregate(countPipeline);
    total = countResult[0]?.total || 0;
  } else {
    // Standard query without riskLevel filter
    [reports, total] = await Promise.all([
      Report.find(filter)
        .populate("submittedBy", "name email")
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Report.countDocuments(filter),
    ]);

    // Attach risk assessments
    const reportIds = reports.map((r) => r._id);
    const riskAssessments = await RiskAssessment.find({
      reportId: { $in: reportIds },
    })
      .select("reportId riskScore riskLevel sifProbability")
      .lean();

    const raMap = {};
    riskAssessments.forEach((ra) => {
      raMap[ra.reportId.toString()] = ra;
    });

    reports = reports.map((r) => ({
      ...r,
      riskAssessment: raMap[r._id.toString()]
        ? {
            riskScore: raMap[r._id.toString()].riskScore,
            riskLevel: raMap[r._id.toString()].riskLevel,
            sifProbability: raMap[r._id.toString()].sifProbability,
          }
        : null,
    }));
  }

  return {
    reports,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    },
  };
};

/**
 * Gets a single report with full details including risk assessment and tasks.
 * Workers can only see their own reports.
 */
const getReportById = async (reportId, user) => {
  const report = await Report.findById(reportId)
    .populate("submittedBy", "name email department")
    .lean();

  if (!report) throw ApiError.notFound("Report not found");

  // Workers can only view their own reports
  if (
    user.role === "worker" &&
    report.submittedBy._id.toString() !== user._id.toString()
  ) {
    throw ApiError.forbidden("You can only view your own reports");
  }

  // Attach risk assessment
  const riskAssessment = await RiskAssessment.findOne({
    reportId: report._id,
  }).lean();

  // Attach maintenance tasks
  const maintenanceTasks = await MaintenanceTask.find({ reportId: report._id })
    .populate("assignedTo", "name email")
    .select("title status priority dueDate assignedTo createdAt")
    .lean();

  return {
    ...report,
    riskAssessment: riskAssessment || null,
    maintenanceTasks,
  };
};

/**
 * Updates report status (officer only).
 */
const updateReportStatus = async (reportId, status, user) => {
  const report = await Report.findById(reportId);
  if (!report) throw ApiError.notFound("Report not found");

  const allowedTransitions = {
    analysis_complete: ["under_review", "action_assigned", "closed"],
    under_review: ["action_assigned", "closed"],
    action_assigned: ["resolved"],
    resolved: ["closed"],
  };

  const allowed = allowedTransitions[report.status] || [];
  if (!allowed.includes(status)) {
    throw ApiError.badRequest(
      `Cannot transition from '${report.status}' to '${status}'`
    );
  }

  report.status = status;
  await report.save();

  return report;
};

module.exports = {
  createReport,
  getReports,
  getReportById,
  updateReportStatus,
  retriggerAiAnalysis,
  runAiAnalysis,
};
