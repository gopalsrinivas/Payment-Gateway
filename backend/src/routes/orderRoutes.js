const express = require("express");
const orderController = require("../controllers/orderController");
const authenticate = require("../middlewares/authMiddleware");
const authorizeRoles = require("../middlewares/roleMiddleware");
const validate = require("../middlewares/validationMiddleware");
const { ROLES } = require("../utils/constants");
const { createOrderValidation, orderIdValidation, orderItemsValidation, orderListValidation, orderStatusValidation } = require("../validations/orderValidation");
const paymentController = require("../controllers/paymentController");
const { orderPaymentsValidation } = require("../validations/paymentValidation");

const router = express.Router();

router.use(authenticate);
router.post("/", createOrderValidation, validate, orderController.create);
router.get("/", orderListValidation, validate, orderController.list);
router.get("/:id", orderIdValidation, validate, orderController.get);
router.get("/:id/items", orderItemsValidation, validate, orderController.items);
router.get("/:orderId/payments", orderPaymentsValidation, validate, paymentController.orderPayments);
router.patch("/:id/status", authorizeRoles(ROLES.ADMIN), orderStatusValidation, validate, orderController.status);

module.exports = router;

