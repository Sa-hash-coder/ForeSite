const aiReportService = require("../services/aiReportService");

exports.endpoint = async (req, res) => {
  try {
    const incomingData = {
      ...req.query,
      ...req.params,
      ...req.body,
    };

    if (!incomingData || Object.keys(incomingData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No data provided in URL query parameters or request body",
      });
    }

    const savedReport = await aiReportService.saveAiReport(incomingData);

    return res.status(201).json({
      success: true,
      message: "Data successfully saved in ai-reports",
      data: savedReport,
    });
  } catch (error) {
    console.error("Error saving AI report:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to save AI report",
      error: error.message,
    });
  }
};

exports.getAllReports = async (req, res) => {
  try {
    const { page, limit, risk_level, status } = req.query;
    const filters = {};
    if (risk_level) filters.risk_level = risk_level.toUpperCase();
    if (status) filters.status = status;

    const result = await aiReportService.getAiReports(filters, { page, limit });
    return res.status(200).json({
      success: true,
      data: result.reports,
      pagination: result.pagination,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve AI reports",
      error: error.message,
    });
  }
};

exports.getReportById = async (req, res) => {
  try {
    const report = await aiReportService.getAiReportById(req.params.id);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }
    return res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve AI report",
      error: error.message,
    });
  }
};
