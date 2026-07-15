const { UniqueConstraintError, ValidationError } = require("sequelize");
const env = require("../config/env");
const logger = require("../config/logger");
const AppError = require("../utils/appError");
const { buildError } = require("../utils/responseHandler");

const notFound = (req, _res, next) => {
  next(new AppError(`Route not found: ${req.originalUrl}`, 404));
};

const normalizeError = (error) => {
  if (error instanceof UniqueConstraintError) {
    return new AppError("Duplicate resource", 409, error.errors.map((item) => ({ field: item.path, message: item.message })));
  }

  if (error instanceof ValidationError) {
    return new AppError("Database validation failed", 400, error.errors.map((item) => ({ field: item.path, message: item.message })));
  }

  return error;
};

const errorHandler = (error, req, res, next) => {
  void next;
  const normalized = normalizeError(error);
  const statusCode = normalized.statusCode || 500;
  const errors = normalized.errors || [];
  const message = statusCode === 500 && env.nodeEnv === "production" ? "Internal server error" : normalized.message;

  logger.error("API error", {
    requestId: req.requestId,
    statusCode,
    message: normalized.message,
    stack: env.nodeEnv === "production" ? undefined : normalized.stack,
  });

  return res.status(statusCode).json(buildError(message, errors, statusCode, req.requestId));
};

module.exports = { notFound, errorHandler };
