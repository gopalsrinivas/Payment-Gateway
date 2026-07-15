const fs = require("fs");
const path = require("path");
const winston = require("winston");
const env = require("./env");

const transports = [new winston.transports.Console()];

if (env.logToFiles) {
  const logDir = path.resolve(__dirname, "..", "logs");
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  transports.push(new winston.transports.File({ filename: path.join(logDir, "error.log"), level: "error" }));
  transports.push(new winston.transports.File({ filename: path.join(logDir, "combined.log") }));
}

const logger = winston.createLogger({
  level: env.logLevel,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: env.nodeEnv !== "production" }),
    winston.format.json(),
  ),
  defaultMeta: { service: "payment-gateway-backend", environment: env.nodeEnv, version: env.appVersion },
  transports,
});

module.exports = logger;
