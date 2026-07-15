const Razorpay = require("razorpay");
const env = require("./env");
const AppError = require("../utils/appError");

const validateRazorpayConfig = () => {
  const missing = [];
  const isMissing = (value) => !value || String(value).startsWith("replace_with_");
  if (isMissing(env.razorpay.keyId)) missing.push("RAZORPAY_KEY_ID");
  if (isMissing(env.razorpay.keySecret)) missing.push("RAZORPAY_KEY_SECRET");
  if (isMissing(env.razorpay.webhookSecret)) missing.push("RAZORPAY_WEBHOOK_SECRET");

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

const setRazorpayClientForTests = (client) => {
  razorpayClient = client;
};

module.exports = {
  getRazorpayClient,
  setRazorpayClientForTests,
  validateRazorpayConfig,
  razorpayKeyId: env.razorpay.keyId,
};
