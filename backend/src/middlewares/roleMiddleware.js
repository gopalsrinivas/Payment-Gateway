const AppError = require("../utils/appError");
const logger = require("../config/logger");

const authorizeRoles = (...roles) => (req, _res, next) => {
  if (!req.user) {
    return next(new AppError("Authentication is required", 401));
  }

  if (!roles.includes(req.user.role)) {
    logger.warn("Authorization failed", {
      requestId: req.requestId,
      userId: req.user.id,
      role: req.user.role,
      requiredRoles: roles,
    });
    return next(new AppError("You are not authorized to access this resource", 403));
  }

  return next();
};

module.exports = authorizeRoles;

