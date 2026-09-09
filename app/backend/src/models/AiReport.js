const mongoose = require("mongoose");

const aiReportSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      default: "other",
    },
    severity: {
      type: String,
      default: "medium",
    },
    risk_score: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    risk_level: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
      default: "LOW",
    },
    sif_probability: {
      type: Number,
      min: 0,
      max: 1,
      default: 0,
    },
    precursors: {
      type: [String],
      default: [],
    },
    hazards: {
      type: [String],
      default: [],
    },
    explanation: {
      type: String,
      default: "",
    },
    extracted_image_context: {
      type: String,
      default: null,
    },
    extracted_audio_context: {
      type: String,
      default: null,
    },
    model_version: {
      type: String,
      default: "v1.0",
    },
    processing_time_ms: {
      type: Number,
      default: 0,
    },
    is_fallback: {
      type: Boolean,
      default: false,
    },
    extraction_fallback: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      default: "analysis_complete",
    },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    report_id: {
      type: String,
      default: null,
    },
    raw_query: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("AiReport", aiReportSchema, "ai-reports");
