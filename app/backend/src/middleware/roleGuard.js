const ApiError = require("../utils/ApiError");

/**
 * Role guard factory. Returns middleware that checks req.user.role
 * against the allowedRoles array.
 *
 * Usage: router.get("/path", auth, roleGuard(["safety_officer", "admin"]), handler)
 */
const roleGuard = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized("Authentication required"));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        ApiError.forbidden(
          `Access denied. Required role: ${allowedRoles.join(" or ")}`
        )
      );
    }

    next();
  };
};

module.exports = roleGuard;
