const mongoose = require("mongoose");

const riskAssessmentSchema = new mongoose.Schema(
  {
    reportId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Report",
      required: [true, "Report ID is required"],
      unique: true, // One risk assessment per report
    },
    riskScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    riskLevel: {
      type: String,
      required: true,
      enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
    },
    sifProbability: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
    },
    precursors: {
      type: [String],
      default: [],
    },
    hazards: {
      type: [String],
      default: [],
    },
    recommendations: {
      type: [String],
      default: [],
    },
    explanation: {
      type: String,
      default: "",
    },
    extractedImageContext: {
      type: String,
      default: null,
    },
    extractedAudioContext: {
      type: String,
      default: null,
    },
    modelVersion: {
      type: String,
      default: "v1.1-gemini-hybrid",
    },
    processingTimeMs: {
      type: Number,
      default: 0,
    },
    isFallback: {
      type: Boolean,
      default: false,
    },
    extractionFallback: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Indexes
riskAssessmentSchema.index({ reportId: 1 });
riskAssessmentSchema.index({ riskLevel: 1 });
riskAssessmentSchema.index({ sifProbability: -1 });

module.exports = mongoose.model(
  "RiskAssessment",
  riskAssessmentSchema,
  "risk_assessments"
);
