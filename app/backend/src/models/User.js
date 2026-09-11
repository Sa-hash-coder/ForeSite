const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name must be at most 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
    },
    role: {
      type: String,
<<<<<<< HEAD
      enum: ["worker", "safety_officer", "maintenance", "admin"],
      required: [true, "Role is required"],
=======
      enum: [
        "admin",
        "safety_officer",
        "worker",
        "maintenance",
        "manager",
        "technician",
      ],
>>>>>>> a5952b3 (Login and admin dashboard)
      default: "worker",
    },
    department: {
      type: String,
<<<<<<< HEAD
      trim: true,
      default: null,
=======
      default: "Safety Operations",
>>>>>>> a5952b3 (Login and admin dashboard)
    },
    isActive: {
      type: Boolean,
      default: true,
<<<<<<< HEAD
    },
    lastLogin: {
      type: Date,
      default: null,
=======
>>>>>>> a5952b3 (Login and admin dashboard)
    },
  },
  { timestamps: true }
);

<<<<<<< HEAD
// Index for role-based queries
userSchema.index({ role: 1 });

module.exports = mongoose.model("User", userSchema, "userinfo");
=======
module.exports = mongoose.model("User", userSchema, "userinfo");
>>>>>>> a5952b3 (Login and admin dashboard)
