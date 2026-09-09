const reportService = require("../services/reportService");
const { success, successPaginated } = require("../utils/respond");

/**
 * POST /api/reports
 * Worker submits a new safety report.
 */
exports.createReport = async (req, res, next) => {
  try {
    const report = await reportService.createReport(req.body, req.user._id);
    success(res, report, 201);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/reports
 * Role-filtered paginated list of reports with risk assessment summary.
 */
exports.getReports = async (req, res, next) => {
  try {
    const { reports, pagination } = await reportService.getReports(
      req.user,
      req.query
    );
    successPaginated(res, reports, pagination);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/reports/:id
 * Full report with risk assessment and maintenance tasks.
 */
exports.getReportById = async (req, res, next) => {
  try {
    const report = await reportService.getReportById(req.params.id, req.user);
    success(res, report);
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/reports/:id
 * Officer updates report status.
 */
exports.updateReportStatus = async (req, res, next) => {
  try {
    const report = await reportService.updateReportStatus(
      req.params.id,
      req.body.status,
      req.user
    );
    success(res, report);
  } catch (err) {
    next(err);
  }
};
