const express = require("express");
const authRoutes = require("./authRoutes");
const cartRoutes = require("./cartRoutes");
const dashboardRoutes = require("./dashboardRoutes");
const healthRoutes = require("./healthRoutes");
const orderRoutes = require("./orderRoutes");
const paymentLogRoutes = require("./paymentLogRoutes");
const paymentRoutes = require("./paymentRoutes");
const productRoutes = require("./productRoutes");
const webhookRoutes = require("./webhookRoutes");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/products", productRoutes);
router.use("/cart", cartRoutes);
router.use("/orders", orderRoutes);
router.use("/payments", paymentRoutes);
router.use("/payment-logs", paymentLogRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/health", healthRoutes);
router.use("/webhooks", webhookRoutes);

module.exports = router;
