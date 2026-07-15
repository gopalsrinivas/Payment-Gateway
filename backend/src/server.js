const app = require("./app");
const env = require("./config/env");
const logger = require("./config/logger");
const { sequelize } = require("./models");

let server;
let shuttingDown = false;

const waitForDatabase = async () => {
  for (let attempt = 1; attempt <= env.dbReadyRetries; attempt += 1) {
    try {
      await sequelize.authenticate();
      logger.info("Database connection established", { attempt });
      return;
    } catch (error) {
      logger.warn("Database connection attempt failed", {
        attempt,
        maxAttempts: env.dbReadyRetries,
        message: error.message,
      });
      if (attempt === env.dbReadyRetries) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, env.dbReadyDelayMs));
    }
  }
};

const shutdown = (signal) => {
  if (shuttingDown) return;
  shuttingDown = true;
  logger.info("Shutdown started", { signal });

  const timeout = setTimeout(() => {
    logger.error("Shutdown timed out");
    process.exit(1);
  }, 10000);

  if (!server) {
    clearTimeout(timeout);
    process.exit(0);
  }

  server.close(async (error) => {
    try {
      if (error) {
        logger.error("HTTP server close failed", { message: error.message });
      }
      await sequelize.close();
      clearTimeout(timeout);
      logger.info("Shutdown completed");
      process.exit(error ? 1 : 0);
    } catch (closeError) {
      clearTimeout(timeout);
      logger.error("Shutdown failed", { message: closeError.message });
      process.exit(1);
    }
  });
};

const start = async () => {
  await waitForDatabase();

  server = app.listen(env.port, () => {
    logger.info(`Backend listening on port ${env.port}`);
  });
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

start().catch((error) => {
  logger.error("Backend startup failed", { message: error.message });
  process.exit(1);
});
