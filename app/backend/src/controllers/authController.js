const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const { success } = require("../utils/respond");

/**
 * Generates a signed JWT for a user.
 */
const signToken = (user) => {
  return jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET || "foresite_dev_jwt_secret_change_in_production",
    { expiresIn: "7d" }
  );
};

/**
 * Formats user for public response (no password).
 */
const formatUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  department: user.department,
  isActive: user.isActive,
});

/**
 * POST /api/auth/register
 */
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, department } = req.body;

<<<<<<< HEAD
    if (!name || !email || !password || !role) {
      return next(ApiError.badRequest("name, email, password, and role are required"));
=======
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ success: false, message: "Email already registered" });
>>>>>>> a5952b3 (Login and admin dashboard)
    }

    const validRoles = ["worker", "safety_officer", "maintenance", "admin"];
    if (!validRoles.includes(role)) {
      return next(ApiError.badRequest(`role must be one of: ${validRoles.join(", ")}`));
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return next(ApiError.conflict("Email is already registered"));
    }

    const hashed = await bcrypt.hash(password, 12);

    const user = await User.create({
<<<<<<< HEAD
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashed,
      role,
      department: department || null,
    });

    const token = signToken(user);

    // Update lastLogin
    await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });

    success(res, { user: formatUser(user), token }, 201);
  } catch (err) {
    next(err);
=======
      name,
      email,
      password: hashedPassword,
      role: role || "worker",
      department: department || "General",
    });

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      success: true,
      message: "User created",
      data: {
        token,
        user: {
          _id: user._id,
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Could not create user", error: error.message });
>>>>>>> a5952b3 (Login and admin dashboard)
  }
};

/**
 * POST /api/auth/login
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

<<<<<<< HEAD
    if (!email || !password) {
      return next(ApiError.badRequest("email and password are required"));
=======
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
>>>>>>> a5952b3 (Login and admin dashboard)
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return next(ApiError.unauthorized("Invalid email or password"));
    }

<<<<<<< HEAD
    if (!user.isActive) {
      return next(ApiError.forbidden("Account has been deactivated"));
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return next(ApiError.unauthorized("Invalid email or password"));
    }

    // Update lastLogin
    await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });

    const token = signToken(user);
    success(res, { user: formatUser(user), token });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/auth/me
 */
exports.getMe = async (req, res, next) => {
  try {
    success(res, formatUser(req.user));
  } catch (err) {
    next(err);
=======
    res.json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: {
          _id: user._id,
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Could not log in", error: error.message });
>>>>>>> a5952b3 (Login and admin dashboard)
  }
};
