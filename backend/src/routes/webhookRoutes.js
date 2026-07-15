const express = require("express");
const { razorpayWebhook } = require("../controllers/webhookController");
const { razorpayRawBody } = require("../middlewares/rawBodyMiddleware");

const router = express.Router();

router.post("/razorpay", razorpayRawBody, razorpayWebhook);

module.exports = router;

