const UserSubmission = require("../models/UserSubmission");


const saveUserSubmission = async (data) => {
  const submissionDoc = {
    title: data.title || "User Safety Submission",
    description: data.description || "",
    location: data.location || "",
    category: data.category || "other",
    severity: data.severity || "medium",
    imageUrl: data.imageUrl || data.image_url || null,
    audioUrl: data.audioUrl || data.audio_url || null,
    submittedBy: data.submittedBy || data.userId || null,
    userName: data.userName || data.name || null,
    userEmail: data.userEmail || data.email || null,
    department: data.department || null,
    status: data.status || "pending_analysis",
    rawData: data,
  };

  const savedRecord = await UserSubmission.create(submissionDoc);
  return savedRecord;
};


const getUserSubmissions = async (filters = {}, pagination = {}) => {
  const { page = 1, limit = 20 } = pagination;
  const skip = (page - 1) * limit;

  const [submissions, total] = await Promise.all([
    UserSubmission.find(filters)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    UserSubmission.countDocuments(filters),
  ]);

  return {
    submissions,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getUserSubmissionById = async (id) => {
  return await UserSubmission.findById(id);
};

module.exports = {
  saveUserSubmission,
  getUserSubmissions,
  getUserSubmissionById,
};
