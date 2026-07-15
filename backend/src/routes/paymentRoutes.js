const express = require("express");
const paymentController = require("../controllers/paymentController");
const paymentLogController = require("../controllers/paymentLogController");
const authenticate = require("../middlewares/authMiddleware");
const authorizeRoles = require("../middlewares/roleMiddleware");
const validate = require("../middlewares/validationMiddleware");
const { ROLES } = require("../utils/constants");
const { paymentIdValidation, paymentListValidation } = require("../validations/paymentValidation");

const router = express.Router();

router.use(authenticate);
router.get("/", paymentListValidation, validate, paymentController.list);
router.get("/history", paymentListValidation, validate, paymentController.history);
router.get("/:id", paymentIdValidation, validate, paymentController.get);
router.get("/:paymentId/logs", authorizeRoles(ROLES.ADMIN), paymentLogController.paymentLogs);

module.exports = router;

