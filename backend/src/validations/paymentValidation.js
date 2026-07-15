const { body, query } = require("express-validator");
const { idParam, paginationValidation } = require("./commonValidation");
const { PAYMENT_STATUS } = require("../utils/constants");

module.exports = {
  initializePaymentValidation: [
    body("orderId").isInt({ min: 1 }).withMessage("orderId must be a positive integer"),
    body("amount").not().exists().withMessage("Amount is calculated by the backend"),
    body("currency").not().exists().withMessage("Currency is calculated by the backend"),
    body("userId").not().exists().withMessage("User is derived from authentication"),
  ],
  paymentVerifyValidation: [
    body("paymentId").optional().isInt({ min: 1 }).withMessage("paymentId must be a positive integer"),
    body("applicationOrderId").optional().isInt({ min: 1 }).withMessage("applicationOrderId must be a positive integer"),
    body().custom((value) => {
      if (!value.paymentId && !value.applicationOrderId) throw new Error("paymentId or applicationOrderId is required");
      return true;
    }),
    body("razorpayOrderId").isString().trim().isLength({ min: 6, max: 100 }).withMessage("razorpayOrderId is required"),
    body("razorpayPaymentId").isString().trim().isLength({ min: 6, max: 100 }).withMessage("razorpayPaymentId is required"),
    body("razorpaySignature").isString().trim().isLength({ min: 16, max: 255 }).withMessage("razorpaySignature is required"),
  ],
  paymentFailureValidation: [
    body("paymentId").optional().isInt({ min: 1 }).withMessage("paymentId must be a positive integer"),
    body("applicationOrderId").optional().isInt({ min: 1 }).withMessage("applicationOrderId must be a positive integer"),
    body().custom((value) => {
      if (!value.paymentId && !value.applicationOrderId) throw new Error("paymentId or applicationOrderId is required");
      return true;
    }),
    body("razorpayOrderId").isString().trim().isLength({ min: 6, max: 100 }).withMessage("razorpayOrderId is required"),
    body("razorpayPaymentId").optional({ nullable: true }).isString().trim().isLength({ max: 100 }).withMessage("razorpayPaymentId is too long"),
    body("errorCode").optional().isString().isLength({ max: 100 }).withMessage("errorCode is too long"),
    body("errorDescription").optional().isString().isLength({ max: 500 }).withMessage("errorDescription is too long"),
    body("errorReason").optional().isString().isLength({ max: 100 }).withMessage("errorReason is too long"),
    body("errorSource").optional().isString().isLength({ max: 80 }).withMessage("errorSource is too long"),
    body("errorStep").optional().isString().isLength({ max: 80 }).withMessage("errorStep is too long"),
  ],
  paymentListValidation: [
    ...paginationValidation,
    query("status").optional().isIn(Object.values(PAYMENT_STATUS)).withMessage("Invalid status"),
    query("orderId").optional().isInt({ min: 1 }).withMessage("orderId must be a positive integer"),
    query("order_id").optional().isInt({ min: 1 }).withMessage("order_id must be a positive integer"),
    query("sortBy").optional().isIn(["created_at", "updated_at", "amount", "status"]).withMessage("Invalid sortBy"),
  ],
  paymentIdValidation: [idParam("id")],
  orderPaymentsValidation: [idParam("orderId")],
  paymentLogsValidation: [
    ...paginationValidation,
    query("paymentId").optional().isInt({ min: 1 }).withMessage("paymentId must be a positive integer"),
    query("orderId").optional().isInt({ min: 1 }).withMessage("orderId must be a positive integer"),
    query("eventType").optional().isLength({ max: 80 }).withMessage("eventType is too long"),
    query("requestId").optional().isLength({ max: 100 }).withMessage("requestId is too long"),
  ],
};
