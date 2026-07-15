const paymentService = require("../services/paymentService");
const { sendSuccess } = require("../utils/responseHandler");

const list = async (req, res, next) => {
  try {
    return sendSuccess(res, "Payments retrieved successfully", await paymentService.listPayments({ query: req.query, user: req.user }));
  } catch (error) {
    return next(error);
  }
};

const history = async (req, res, next) => {
  try {
    return sendSuccess(res, "Payment history retrieved successfully", await paymentService.history({ query: req.query, user: req.user }));
  } catch (error) {
    return next(error);
  }
};

const get = async (req, res, next) => {
  try {
    return sendSuccess(res, "Payment retrieved successfully", { payment: await paymentService.getPayment({ id: req.params.id, user: req.user }) });
  } catch (error) {
    return next(error);
  }
};

const orderPayments = async (req, res, next) => {
  try {
    return sendSuccess(res, "Order payments retrieved successfully", await paymentService.listOrderPayments({ orderId: req.params.orderId, query: req.query, user: req.user }));
  } catch (error) {
    return next(error);
  }
};

module.exports = { get, history, list, orderPayments };

