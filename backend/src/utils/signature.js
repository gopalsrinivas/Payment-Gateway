const crypto = require("crypto");

const hmacSha256 = (payload, secret) => crypto.createHmac("sha256", secret).update(payload).digest("hex");

const timingSafeEqual = (actual, expected) => {
  if (!actual || !expected) return false;
  const actualBuffer = Buffer.from(String(actual), "hex");
  const expectedBuffer = Buffer.from(String(expected), "hex");
  return actualBuffer.length === expectedBuffer.length && crypto.timingSafeEqual(actualBuffer, expectedBuffer);
};

const verifyPaymentSignature = ({ razorpayOrderId, razorpayPaymentId, razorpaySignature, keySecret }) => {
  const expected = hmacSha256(`${razorpayOrderId}|${razorpayPaymentId}`, keySecret);
  return timingSafeEqual(razorpaySignature, expected);
};

const verifyWebhookSignature = ({ rawBody, signature, webhookSecret }) => {
  const expected = hmacSha256(rawBody, webhookSecret);
  return timingSafeEqual(signature, expected);
};

module.exports = { hmacSha256, verifyPaymentSignature, verifyWebhookSignature };
