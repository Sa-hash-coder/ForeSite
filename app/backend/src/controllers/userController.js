const userService = require("../services/userService");


exports.userEndpoint = async (req, res) => {
  try {
    const incomingData = {
      ...req.query,
      ...req.params,
      ...req.body,
    };

    if (!incomingData || Object.keys(incomingData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No user information provided in URL query, parameters, or body",
      });
    }

    const savedSubmission = await userService.saveUserSubmission(incomingData);

    return res.status(201).json({
      success: true,
      message: "User information saved successfully",
      data: savedSubmission,
    });
  } catch (error) {
    console.error("Error saving user submission:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to save user information",
      error: error.message,
    });
  }
};


exports.getAllUserSubmissions = async (req, res) => {
  try {
    const { page, limit, category, severity, status } = req.query;
    const filters = {};
    if (category) filters.category = category;
    if (severity) filters.severity = severity;
    if (status) filters.status = status;

    const result = await userService.getUserSubmissions(filters, { page, limit });
    return res.status(200).json({
      success: true,
      data: result.submissions,
      pagination: result.pagination,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve user submissions",
      error: error.message,
    });
  }
};


exports.getUserSubmissionById = async (req, res) => {
  try {
    const submission = await userService.getUserSubmissionById(req.params.id);
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Submission not found",
      });
    }
    return res.status(200).json({
      success: true,
      data: submission,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve user submission",
      error: error.message,
    });
  }
};
