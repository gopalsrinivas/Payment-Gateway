const { validationResult } = require("express-validator");
const AppError = require("../utils/appError");
const logger = require("../config/logger");

const validate = (req, _res, next) => {
  const result = validationResult(req);
  if (result.isEmpty()) {
    return next();
  }

  const errors = result.array().map((error) => ({
    field: error.path,
    message: error.msg,
  }));
  logger.warn("Validation failed", { requestId: req.requestId, errors });
  return next(new AppError("Validation failed", 400, errors));
};

module.exports = validate;

