const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 5000),
  appVersion: process.env.APP_VERSION || "local",
  db: {
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 5432),
    name: process.env.DB_NAME || "payment_gateway_demo",
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  },
  jwt: {
    secret: process.env.JWT_SECRET || "replace_with_long_random_secret",
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
  },
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID,
    keySecret: process.env.RAZORPAY_KEY_SECRET,
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET,
    currency: process.env.RAZORPAY_CURRENCY || "INR",
    companyName: process.env.RAZORPAY_COMPANY_NAME || "Payment Gateway",
    checkoutDescription: process.env.RAZORPAY_CHECKOUT_DESCRIPTION || "Test payment",
  },
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:3000",
  logLevel: process.env.LOG_LEVEL || "info",
  logToFiles: process.env.LOG_TO_FILES === "true",
  trustProxy: process.env.TRUST_PROXY === "true",
  dbReadyRetries: Number(process.env.DB_READY_RETRIES || 12),
  dbReadyDelayMs: Number(process.env.DB_READY_DELAY_MS || 2500),
};

const required = ["DB_USER", "DB_PASSWORD", "JWT_SECRET", "RAZORPAY_KEY_ID", "RAZORPAY_KEY_SECRET", "RAZORPAY_WEBHOOK_SECRET"];
const missing = required.filter((name) => !process.env[name]);

if (env.nodeEnv === "production" && missing.length > 0) {
  throw new Error(`Missing required production environment variables: ${missing.join(", ")}`);
}

module.exports = env;
