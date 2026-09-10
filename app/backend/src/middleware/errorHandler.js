const ApiError = require("../utils/ApiError");

/**
 * Global error handler. Must be last middleware registered in server.js.
 * Handles ApiError instances (operational), Mongoose errors, and unknown errors.
 */
const errorHandler = (err, req, res, next) => {
  // Log for debugging (in production, replace with a proper logger)
  if (process.env.NODE_ENV !== "test") {
    console.error(`[${new Date().toISOString()}] ${err.stack || err.message}`);
  }

  // Our own operational errors
  if (err instanceof ApiError) {
    return res
      .status(err.statusCode)
      .json({ success: false, message: err.message });
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ success: false, message: messages.join(", ") });
  }

  // Mongoose CastError (invalid ObjectId)
  if (err.name === "CastError") {
    return res.status(400).json({ success: false, message: "Invalid ID format" });
  }

  // Mongoose duplicate key error (E11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    return res
      .status(409)
      .json({ success: false, message: `${field} already exists` });
  }

  // JWT errors (caught in auth middleware, but as fallback)
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
  if (err.name === "TokenExpiredError") {
    return res.status(401).json({ success: false, message: "Token expired" });
  }

  // Unknown / programmer error — don't leak internal details
  return res
    .status(500)
    .json({ success: false, message: "An unexpected error occurred" });
};

module.exports = errorHandler;
