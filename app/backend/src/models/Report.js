const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: [5, "Title must be at least 5 characters"],
      maxlength: [200, "Title must be at most 200 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      minlength: [20, "Description must be at least 20 characters"],
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: [
        "near_miss",
        "unsafe_condition",
        "unsafe_act",
        "equipment_failure",
        "chemical_exposure",
        "other",
      ],
    },
    severity: {
      type: String,
      required: [true, "Severity is required"],
      enum: ["low", "medium", "high", "critical"],
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
      required: [true, "Submitted by is required"],
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
  },
  { timestamps: true }
);

// Indexes for common query patterns
reportSchema.index({ submittedBy: 1 });
reportSchema.index({ status: 1 });
reportSchema.index({ createdAt: -1 });
reportSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("Report", reportSchema, "reports");
