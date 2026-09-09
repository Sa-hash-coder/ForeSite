const User = require("../models/User");
const ApiError = require("../utils/ApiError");

/**
 * Gets all maintenance users (for officer's task assignment dropdown).
 */
const getMaintenanceUsers = async () => {
  return User.find({ role: "maintenance", isActive: true })
    .select("_id name email department")
    .sort({ name: 1 })
    .lean();
};

/**
 * Gets all users with optional role/isActive filters (admin only).
 */
const getAllUsers = async (query) => {
  const { role, isActive, page = 1, limit = 20 } = query;

  const filter = {};
  if (role) filter.role = role;
  if (isActive !== undefined) {
    filter.isActive = isActive === "true" || isActive === true;
  }

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  const [users, total] = await Promise.all([
    User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    User.countDocuments(filter),
  ]);

  return {
    users,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    },
  };
};

/**
 * Updates a user's role or active status (admin only).
 */
const updateUser = async (userId, updates) => {
  const allowedFields = ["role", "isActive", "department"];
  const safeUpdates = {};

  allowedFields.forEach((field) => {
    if (updates[field] !== undefined) {
      safeUpdates[field] = updates[field];
    }
  });

  if (Object.keys(safeUpdates).length === 0) {
    throw ApiError.badRequest("No valid fields to update");
  }

  const user = await User.findByIdAndUpdate(userId, safeUpdates, {
    new: true,
    runValidators: true,
  }).select("-password");

  if (!user) throw ApiError.notFound("User not found");

  return user;
};

module.exports = { getMaintenanceUsers, getAllUsers, updateUser };
