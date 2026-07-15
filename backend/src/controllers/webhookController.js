const logger = require("../config/logger");
const webhookService = require("../services/webhookService");
const { sendSuccess } = require("../utils/responseHandler");

const razorpayWebhook = async (req, res, next) => {
  try {
    logger.info("Razorpay webhook received", {
      requestId: req.requestId,
      signaturePresent: Boolean(req.headers["x-razorpay-signature"]),
      rawBodyBytes: Buffer.isBuffer(req.body) ? req.body.length : 0,
    });

    const result = await webhookService.processRazorpayWebhook({
      rawBody: req.body,
      signature: req.headers["x-razorpay-signature"],
      requestId: req.requestId,
    });

    return sendSuccess(res, result.duplicate ? "Duplicate Razorpay webhook ignored" : "Razorpay webhook processed", {
      processed: !result.ignored && !result.duplicate,
      duplicate: Boolean(result.duplicate),
      ignored: Boolean(result.ignored),
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = { razorpayWebhook };
