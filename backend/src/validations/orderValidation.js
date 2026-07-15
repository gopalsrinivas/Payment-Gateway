const { body, query } = require("express-validator");
const { idParam, paginationValidation } = require("./commonValidation");
const { ORDER_PAYMENT_STATUS, ORDER_STATUS } = require("../utils/constants");

module.exports = {
  createOrderValidation: [
    body("notes").optional({ nullable: true }).isLength({ max: 1000 }).withMessage("Notes must be 1000 characters or fewer"),
    body(["amount", "total", "subtotal", "userId", "orderNumber"]).not().exists().withMessage("Trusted order fields are not accepted"),
  ],
  orderListValidation: [
    ...paginationValidation,
    query("status").optional().isIn(Object.values(ORDER_STATUS)).withMessage("Invalid status"),
    query("paymentStatus").optional().isIn(Object.values(ORDER_PAYMENT_STATUS)).withMessage("Invalid paymentStatus"),
    query("payment_status").optional().isIn(Object.values(ORDER_PAYMENT_STATUS)).withMessage("Invalid payment_status"),
    query("sortBy").optional().isIn(["created_at", "updated_at", "order_number", "total_amount"]).withMessage("Invalid sortBy"),
  ],
  orderIdValidation: [idParam("id")],
  orderItemsValidation: [idParam("id")],
  orderStatusValidation: [idParam("id"), body("status").isIn(Object.values(ORDER_STATUS)).withMessage("Invalid status")],
};

