const express = require("express");
const dashboardController = require("../controllers/dashboardController");
const authenticate = require("../middlewares/authMiddleware");
const authorizeRoles = require("../middlewares/roleMiddleware");
const { ROLES } = require("../utils/constants");

const router = express.Router();

router.get("/customer", authenticate, dashboardController.customer);
router.get("/admin", authenticate, authorizeRoles(ROLES.ADMIN), dashboardController.admin);
router.get("/summary", authenticate, authorizeRoles(ROLES.ADMIN), dashboardController.admin);
router.get("/recent-payments", authenticate, authorizeRoles(ROLES.ADMIN), dashboardController.recentPayments);

module.exports = router;

