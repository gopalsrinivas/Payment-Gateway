const Razorpay = require("razorpay");
const env = require("./env");
const AppError = require("../utils/appError");

const validateRazorpayConfig = () => {
  const missing = [];
  if (!env.razorpay.keyId) missing.push("RAZORPAY_KEY_ID");
  if (!env.razorpay.keySecret) missing.push("RAZORPAY_KEY_SECRET");
  if (!env.razorpay.webhookSecret) missing.push("RAZORPAY_WEBHOOK_SECRET");

  if (missing.length > 0) {
    throw new AppError(`Missing Razorpay test-mode configuration: ${missing.join(", ")}`, 500);
  }
};

let razorpayClient;

const getRazorpayClient = () => {
  if (!razorpayClient) {
    validateRazorpayConfig();
    razorpayClient = new Razorpay({
      key_id: env.razorpay.keyId,
      key_secret: env.razorpay.keySecret,
    });
  }
  return razorpayClient;
};

module.exports = {
  getRazorpayClient,
  validateRazorpayConfig,
  razorpayKeyId: env.razorpay.keyId,
};

