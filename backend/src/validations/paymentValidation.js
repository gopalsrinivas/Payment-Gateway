const { query } = require("express-validator");
const { idParam, paginationValidation } = require("./commonValidation");
const { PAYMENT_STATUS } = require("../utils/constants");

module.exports = {
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

