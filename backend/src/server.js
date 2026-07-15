const app = require("./app");
const env = require("./config/env");
const logger = require("./config/logger");
const { sequelize } = require("./models");

const start = async () => {
  try {
    await sequelize.authenticate();
    logger.info("Database connection established");
  } catch (error) {
    logger.error("Database connection failed", { message: error.message });
  }

  app.listen(env.port, () => {
    logger.info(`Backend listening on port ${env.port}`);
  });
};

start();

