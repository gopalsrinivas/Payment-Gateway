const express = require("express");
const paymentLogController = require("../controllers/paymentLogController");
const authenticate = require("../middlewares/authMiddleware");
const authorizeRoles = require("../middlewares/roleMiddleware");
const validate = require("../middlewares/validationMiddleware");
const { ROLES } = require("../utils/constants");
const { paymentIdValidation, paymentLogsValidation } = require("../validations/paymentValidation");

const router = express.Router();

router.use(authenticate, authorizeRoles(ROLES.ADMIN));
router.get("/", paymentLogsValidation, validate, paymentLogController.list);
router.get("/:id", paymentIdValidation, validate, paymentLogController.get);

module.exports = router;

