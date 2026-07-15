const logger = require("../config/logger");
const { sendSuccess } = require("../utils/responseHandler");

const razorpayWebhook = async (req, res, next) => {
  try {
    logger.info("Razorpay webhook foundation accessed", {
      requestId: req.requestId,
      signaturePresent: Boolean(req.headers["x-razorpay-signature"]),
      rawBodyBytes: Buffer.isBuffer(req.body) ? req.body.length : 0,
    });

    return sendSuccess(res, "Razorpay webhook foundation received. Processing is planned for a later payment phase.", {
      processed: false,
      phase: "part-1-foundation",
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = { razorpayWebhook };

