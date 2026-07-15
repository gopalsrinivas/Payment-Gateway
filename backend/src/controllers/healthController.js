const { sequelize } = require("../models");
const env = require("../config/env");
const { sendSuccess } = require("../utils/responseHandler");

const health = async (_req, res, next) => {
  try {
    let database = "connected";
    try {
      await sequelize.authenticate();
    } catch {
      database = "unavailable";
    }

    return sendSuccess(res, "Health check successful", {
      status: "ok",
      timestamp: new Date().toISOString(),
      environment: env.nodeEnv,
      database,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = { health };
