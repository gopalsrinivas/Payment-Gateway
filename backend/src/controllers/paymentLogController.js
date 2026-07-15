const paymentLogService = require("../services/paymentLogService");
const { sendSuccess } = require("../utils/responseHandler");

const list = async (req, res, next) => {
  try {
    return sendSuccess(res, "Payment logs retrieved successfully", await paymentLogService.listLogs(req.query));
  } catch (error) {
    return next(error);
  }
};

const get = async (req, res, next) => {
  try {
    return sendSuccess(res, "Payment log retrieved successfully", { log: await paymentLogService.getLog(req.params.id) });
  } catch (error) {
    return next(error);
  }
};

const paymentLogs = async (req, res, next) => {
  try {
    return sendSuccess(res, "Payment logs retrieved successfully", await paymentLogService.listPaymentLogs({ paymentId: req.params.paymentId, query: req.query }));
  } catch (error) {
    return next(error);
  }
};

module.exports = { get, list, paymentLogs };

