const morgan = require("morgan");
const logger = require("../config/logger");
const { createRequestId } = require("../utils/requestId");

const attachRequestId = (req, res, next) => {
  req.requestId = req.headers["x-request-id"] || createRequestId();
  res.setHeader("X-Request-Id", req.requestId);
  next();
};

const requestLogger = morgan(":method :url :status :response-time ms :res[content-length]", {
  stream: {
    write: (message) => logger.info(message.trim()),
  },
  skip: (req) => req.path === "/api/v1/health",
});

module.exports = { attachRequestId, requestLogger };

