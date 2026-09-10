const jwt = require("jsonwebtoken");
const ApiError = require("../utils/ApiError");
const User = require("../models/User");

/**
 * Middleware: Verifies the JWT Bearer token in the Authorization header.
 * Attaches the full user document to req.user.
 */
const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(ApiError.unauthorized("No token provided"));
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return next(ApiError.unauthorized("No token provided"));
    }

    let decoded;
    try {
      decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "foresite_dev_jwt_secret_change_in_production"
      );
    } catch (err) {
      return next(ApiError.unauthorized("Invalid or expired token"));
    }

    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return next(ApiError.unauthorized("User not found"));
    }

    if (!user.isActive) {
      return next(ApiError.forbidden("Account has been deactivated"));
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = auth;
