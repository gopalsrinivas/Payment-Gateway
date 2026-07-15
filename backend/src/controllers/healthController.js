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

    const data = {
      status: database === "connected" ? "ok" : "degraded",
      application: database === "connected" ? "UP" : "DEGRADED",
      timestamp: new Date().toISOString(),
      environment: env.nodeEnv,
      version: env.appVersion,
      uptimeSeconds: Math.round(process.uptime()),
      database: database === "connected" ? "UP" : "DOWN",
    };

    if (database !== "connected") {
      return res.status(503).json({
        success: false,
        message: "Health check degraded",
        data,
        statusCode: 503,
      });
    }

    return sendSuccess(res, "Health check successful", data);
  } catch (error) {
    return next(error);
  }
};

module.exports = { health };
