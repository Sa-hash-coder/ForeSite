const mongoose = require("mongoose");

const maintenanceTaskSchema = new mongoose.Schema(
  {
    reportId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Report",
      required: [true, "Report ID is required"],
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: [5, "Title must be at least 5 characters"],
      maxlength: [200, "Title must be at most 200 characters"],
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Assigned to is required"],
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Assigned by is required"],
    },
    priority: {
      type: String,
      required: [true, "Priority is required"],
      enum: ["low", "medium", "high", "critical"],
    },
    dueDate: {
      type: Date,
      required: [true, "Due date is required"],
    },
    status: {
      type: String,
      enum: ["assigned", "in_progress", "resolved", "verified"],
      default: "assigned",
    },
    resolutionNotes: {
      type: String,
      default: null,
    },
    proofImageUrl: {
      type: String,
      default: null,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Indexes
maintenanceTaskSchema.index({ reportId: 1 });
maintenanceTaskSchema.index({ assignedTo: 1 });
maintenanceTaskSchema.index({ status: 1 });
maintenanceTaskSchema.index({ priority: 1, dueDate: 1 });

module.exports = mongoose.model(
  "MaintenanceTask",
  maintenanceTaskSchema,
  "maintenance_tasks"
);
