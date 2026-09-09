const mongoose = require("mongoose");

const alertSchema = new mongoose.Schema(
  {
    reportId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Report",
      required: [true, "Report ID is required"],
    },
    riskLevel: {
      type: String,
      required: true,
      enum: ["HIGH", "CRITICAL"],
    },
    riskScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    sifProbability: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
    },
    message: {
      type: String,
      required: [true, "Alert message is required"],
    },
    isAcknowledged: {
      type: Boolean,
      default: false,
    },
    acknowledgedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    acknowledgedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Indexes
alertSchema.index({ reportId: 1 });
alertSchema.index({ isAcknowledged: 1 });
alertSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Alert", alertSchema, "alerts");
