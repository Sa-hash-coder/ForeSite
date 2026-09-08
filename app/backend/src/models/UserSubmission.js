const mongoose = require("mongoose");

const userSubmissionSchema = new mongoose.Schema(
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
      enum: [
        "near_miss",
        "unsafe_condition",
        "unsafe_act",
        "equipment_failure",
        "chemical_exposure",
        "other",
      ],
      default: "other",
    },
    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
    imageUrl: {
      type: String,
      default: null,
    },
    audioUrl: {
      type: String,
      default: null,
    },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    userName: {
      type: String,
      default: null,
    },
    userEmail: {
      type: String,
      default: null,
    },
    department: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: [
        "pending_analysis",
        "analysis_complete",
        "under_review",
        "action_assigned",
        "resolved",
        "closed",
      ],
      default: "pending_analysis",
    },
    rawData: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("UserSubmission", userSubmissionSchema, "user-reports");
