const AiReport = require("../models/AiReport");

const saveAiReport = async (data) => {
  const parseArrayField = (field) => {
    if (!field) return [];
    if (Array.isArray(field)) return field;
    if (typeof field === "string") {
      try {
        const parsed = JSON.parse(field);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        return field.split(",").map((s) => s.trim()).filter(Boolean);
      }
    }
    return [field];
  };

  const calculateRiskLevel = (score) => {
    if (score >= 75) return "CRITICAL";
    if (score >= 50) return "HIGH";
    if (score >= 25) return "MEDIUM";
    return "LOW";
  };

  const riskScore = data.risk_score !== undefined ? Number(data.risk_score) : 0;
  const riskLevel =
    data.risk_level?.toUpperCase() || calculateRiskLevel(riskScore);

  const reportDoc = {
    title: data.title || "Untitled AI Report",
    description: data.description || "",
    location: data.location || "",
    category: data.category || "other",
    severity: data.severity || "medium",
    risk_score: isNaN(riskScore) ? 0 : riskScore,
    risk_level: ["LOW", "MEDIUM", "HIGH", "CRITICAL"].includes(riskLevel)
      ? riskLevel
      : "LOW",
    sif_probability: data.sif_probability !== undefined ? Number(data.sif_probability) : 0,
    precursors: parseArrayField(data.precursors),
    hazards: parseArrayField(data.hazards),
    explanation: data.explanation || "",
    extracted_image_context: data.extracted_image_context || null,
    extracted_audio_context: data.extracted_audio_context || null,
    model_version: data.model_version || "v1.0",
    processing_time_ms: data.processing_time_ms !== undefined ? Number(data.processing_time_ms) : 0,
    is_fallback: data.is_fallback === true || data.is_fallback === "true",
    extraction_fallback:
      data.extraction_fallback === true || data.extraction_fallback === "true",
    status: data.status || "analysis_complete",
    report_id: data.report_id || null,
    submittedBy: data.submittedBy || null,
    raw_query: data,
  };

  const savedReport = await AiReport.create(reportDoc);
  return savedReport;
};

const getAiReports = async (filters = {}, pagination = {}) => {
  const { page = 1, limit = 20 } = pagination;
  const skip = (page - 1) * limit;

  const [reports, total] = await Promise.all([
    AiReport.find(filters)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    AiReport.countDocuments(filters),
  ]);

  return {
    reports,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getAiReportById = async (id) => {
  return await AiReport.findById(id);
};

module.exports = {
  saveAiReport,
  getAiReports,
  getAiReportById,
};
