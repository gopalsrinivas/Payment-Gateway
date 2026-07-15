const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const swaggerUi = require("swagger-ui-express");
const env = require("./config/env");
const swaggerSpec = require("./config/swagger");
const apiRoutes = require("./routes");
const { attachRequestId, requestLogger } = require("./middlewares/requestLoggerMiddleware");
const { errorHandler, notFound } = require("./middlewares/errorMiddleware");

const app = express();

app.use(helmet());
app.use(cors({ origin: env.corsOrigin, credentials: true }));
app.use(attachRequestId);
app.use(requestLogger);

app.use("/api/v1/webhooks", require("./routes/webhookRoutes"));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api/v1", apiRoutes);
app.use(notFound);
app.use(errorHandler);

module.exports = app;

