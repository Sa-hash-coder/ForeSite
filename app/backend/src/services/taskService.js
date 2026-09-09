const MaintenanceTask = require("../models/MaintenanceTask");
const Report = require("../models/Report");
const RiskAssessment = require("../models/RiskAssessment");
const User = require("../models/User");
const ApiError = require("../utils/ApiError");

/**
 * Creates a maintenance task and updates the parent report status to action_assigned.
 */
const createTask = async (body, assignedByUser) => {
  // Validate the report exists
  const report = await Report.findById(body.reportId);
  if (!report) throw ApiError.notFound("Report not found");

  // Validate the assignee exists and has maintenance role
  const assignee = await User.findById(body.assignedTo);
  if (!assignee || assignee.role !== "maintenance") {
    throw ApiError.badRequest("assignedTo must be a valid maintenance user");
  }

  const task = await MaintenanceTask.create({
    reportId: body.reportId,
    title: body.title,
    description: body.description || "",
    assignedTo: body.assignedTo,
    assignedBy: assignedByUser._id,
    priority: body.priority,
    dueDate: new Date(body.dueDate),
    status: "assigned",
  });

  // Update report status to action_assigned
  await Report.findByIdAndUpdate(body.reportId, { status: "action_assigned" });

  await task.populate("assignedTo", "name email department");
  await task.populate("assignedBy", "name email");
  return task;
};

/**
 * Gets paginated tasks list, filtered by role.
 * - maintenance: own tasks only
 * - safety_officer/admin: all tasks
 */
const getTasks = async (user, query) => {
  const { status, priority, assignedTo, page = 1, limit = 20 } = query;

  const filter = {};

  if (user.role === "maintenance") {
    filter.assignedTo = user._id;
  } else {
    // Officer can filter by assignee
    if (assignedTo) filter.assignedTo = assignedTo;
  }

  if (status) filter.status = status;
  if (priority) filter.priority = priority;

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  const [tasks, total] = await Promise.all([
    MaintenanceTask.find(filter)
      .populate("reportId", "title location")
      .populate("assignedTo", "name email")
      .populate("assignedBy", "name")
      .sort({ priority: -1, dueDate: 1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    MaintenanceTask.countDocuments(filter),
  ]);

  return {
    tasks,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    },
  };
};

/**
 * Gets a single task with full report context (including AI risk assessment).
 */
const getTaskById = async (taskId, user) => {
  const task = await MaintenanceTask.findById(taskId)
    .populate("assignedTo", "name email department")
    .populate("assignedBy", "name email")
    .populate("verifiedBy", "name")
    .lean();

  if (!task) throw ApiError.notFound("Task not found");

  // Maintenance users can only view tasks assigned to them
  if (
    user.role === "maintenance" &&
    task.assignedTo._id.toString() !== user._id.toString()
  ) {
    throw ApiError.forbidden("You can only view tasks assigned to you");
  }

  // Enrich report with risk assessment
  const report = await Report.findById(task.reportId)
    .populate("submittedBy", "name department")
    .lean();

  const riskAssessment = report
    ? await RiskAssessment.findOne({ reportId: report._id })
        .select("riskScore riskLevel sifProbability precursors explanation")
        .lean()
    : null;

  return {
    ...task,
    reportId: report
      ? {
          ...report,
          riskAssessment: riskAssessment || null,
        }
      : task.reportId,
  };
};

/**
 * Updates task status with role-based permission checks and valid transition enforcement.
 *
 * Transitions:
 *   assigned → in_progress  (maintenance)
 *   in_progress → resolved   (maintenance, resolutionNotes required)
 *   resolved → verified      (safety_officer / admin)
 */
const updateTask = async (taskId, body, user) => {
  const task = await MaintenanceTask.findById(taskId);
  if (!task) throw ApiError.notFound("Task not found");

  // Maintenance can only update tasks assigned to them
  if (
    user.role === "maintenance" &&
    task.assignedTo.toString() !== user._id.toString()
  ) {
    throw ApiError.forbidden("You can only update tasks assigned to you");
  }

  const { status, resolutionNotes, proofImageUrl } = body;

  // Validate status transitions
  const allowedTransitions = {
    assigned: {
      in_progress: ["maintenance", "admin"],
    },
    in_progress: {
      resolved: ["maintenance", "admin"],
    },
    resolved: {
      verified: ["safety_officer", "admin"],
    },
  };

  if (status) {
    const allowed = allowedTransitions[task.status]?.[status];
    if (!allowed) {
      throw ApiError.badRequest(
        `Cannot transition task from '${task.status}' to '${status}'`
      );
    }

    if (!allowed.includes(user.role)) {
      throw ApiError.forbidden(
        `Only ${allowed.join(" or ")} can make this status change`
      );
    }

    // Require resolution notes when resolving
    if (status === "resolved" && !resolutionNotes) {
      throw ApiError.badRequest("resolutionNotes is required when resolving a task");
    }

    task.status = status;

    if (status === "resolved") {
      task.resolutionNotes = resolutionNotes;
      if (proofImageUrl) task.proofImageUrl = proofImageUrl;
    }

    if (status === "verified") {
      task.verifiedBy = user._id;
      task.verifiedAt = new Date();

      // Update the parent report to resolved
      await Report.findByIdAndUpdate(task.reportId, { status: "resolved" });
    }
  }

  // Allow updating notes/proof even without status change
  if (!status && resolutionNotes) task.resolutionNotes = resolutionNotes;
  if (!status && proofImageUrl) task.proofImageUrl = proofImageUrl;

  await task.save();

  await task.populate("assignedTo", "name email");
  await task.populate("assignedBy", "name");
  await task.populate("verifiedBy", "name");
  return task;
};

module.exports = { createTask, getTasks, getTaskById, updateTask };
