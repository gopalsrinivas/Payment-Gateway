const paymentService = require("../services/paymentService");
const { sendSuccess } = require("../utils/responseHandler");

const initialize = async (req, res, next) => {
  try {
    return sendSuccess(
      res,
      "Razorpay order initialized successfully",
      await paymentService.initializePayment({ orderId: req.body.orderId, user: req.user, requestId: req.requestId }),
      201,
    );
  } catch (error) {
    return next(error);
  }
};

const verify = async (req, res, next) => {
  try {
    const result = await paymentService.verify({ payload: req.body, user: req.user, requestId: req.requestId });
    return sendSuccess(res, "Payment verified successfully", {
      applicationOrderId: result.order.id,
      orderStatus: result.order.status,
      orderPaymentStatus: result.order.payment_status,
      paymentId: result.payment.id,
      paymentStatus: result.payment.status,
      razorpayPaymentId: result.payment.razorpay_payment_id,
      idempotent: result.idempotent,
    });
  } catch (error) {
    return next(error);
  }
};

const failure = async (req, res, next) => {
  try {
    const result = await paymentService.recordFailure({ payload: req.body, user: req.user, requestId: req.requestId });
    return sendSuccess(res, "Payment failure recorded safely", {
      applicationOrderId: result.order.id,
      orderStatus: result.order.status,
      orderPaymentStatus: result.order.payment_status,
      paymentId: result.payment.id,
      paymentStatus: result.payment.status,
    });
  } catch (error) {
    return next(error);
  }
};

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

module.exports = { failure, get, history, initialize, list, orderPayments, verify };
