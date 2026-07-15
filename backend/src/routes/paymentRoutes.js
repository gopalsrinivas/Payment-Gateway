const express = require("express");
const paymentController = require("../controllers/paymentController");
const paymentLogController = require("../controllers/paymentLogController");
const authenticate = require("../middlewares/authMiddleware");
const authorizeRoles = require("../middlewares/roleMiddleware");
const validate = require("../middlewares/validationMiddleware");
const { ROLES } = require("../utils/constants");
const {
  initializePaymentValidation,
  paymentFailureValidation,
  paymentIdValidation,
  paymentListValidation,
  paymentVerifyValidation,
} = require("../validations/paymentValidation");

const router = express.Router();

router.use(authenticate);
router.post("/initialize", initializePaymentValidation, validate, paymentController.initialize);
router.post("/create-order", initializePaymentValidation, validate, paymentController.initialize);
router.post("/verify", paymentVerifyValidation, validate, paymentController.verify);
router.post("/failure", paymentFailureValidation, validate, paymentController.failure);
router.get("/", paymentListValidation, validate, paymentController.list);
router.get("/history", paymentListValidation, validate, paymentController.history);
router.get("/:id", paymentIdValidation, validate, paymentController.get);
router.get("/:paymentId/logs", authorizeRoles(ROLES.ADMIN), paymentLogController.paymentLogs);

module.exports = router;
