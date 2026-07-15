const express = require("express");

const razorpayRawBody = express.raw({
  type: "application/json",
  limit: "1mb",
});

module.exports = { razorpayRawBody };

