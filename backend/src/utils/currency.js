const AppError = require("./appError");

const toPaise = (amount, currency = "INR") => {
  if (currency !== "INR") throw new AppError("Unsupported payment currency", 409);

  const normalized = String(amount).trim();
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) {
    throw new AppError("Invalid payment amount", 409);
  }

  const [rupees, paise = ""] = normalized.split(".");
  const value = Number(BigInt(rupees) * 100n + BigInt((paise + "00").slice(0, 2)));
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new AppError("Invalid payment amount", 409);
  }
  return value;
};

module.exports = { toPaise };
