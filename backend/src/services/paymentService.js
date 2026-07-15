const { Order, Payment, PaymentLog } = require("../models");
const AppError = require("../utils/appError");
const { buildPagination, getPagination } = require("../utils/pagination");
const { buildDateRange, getSafeOrder } = require("../utils/queryHelpers");

const paymentAttributes = { exclude: ["razorpay_signature"] };

const buildWhere = ({ query, user }) => {
  const where = {};
  if (user.role !== "Admin") where.user_id = user.id;
  if (query.status) where.status = query.status;
  if (query.orderId || query.order_id) where.order_id = query.orderId || query.order_id;
  if (query.razorpayOrderId) where.razorpay_order_id = query.razorpayOrderId;
  if (query.razorpayPaymentId) where.razorpay_payment_id = query.razorpayPaymentId;
  const range = buildDateRange(query.fromDate || query.from_date, query.toDate || query.to_date);
  if (range) where.created_at = range;
  return where;
};

const listPayments = async ({ query, user }) => {
  const { page, limit, offset } = getPagination(query);
  const { rows, count } = await Payment.findAndCountAll({
    where: buildWhere({ query, user }),
    attributes: paymentAttributes,
    include: [{ model: Order, as: "order", attributes: ["id", "order_number", "total_amount", "currency", "status", "payment_status"] }],
    order: getSafeOrder(query, ["created_at", "updated_at", "amount", "status"]),
    limit,
    offset,
  });
  return { items: rows, pagination: buildPagination(page, limit, count) };
};

const getPayment = async ({ id, user }) => {
  const where = { id };
  if (user.role !== "Admin") where.user_id = user.id;
  const payment = await Payment.findOne({
    where,
    attributes: paymentAttributes,
    include: [
      { model: Order, as: "order", attributes: ["id", "order_number", "total_amount", "currency", "status", "payment_status"] },
      { model: PaymentLog, as: "logs", attributes: { exclude: ["metadata"] } },
    ],
  });
  if (!payment) throw new AppError("Payment not found", 404);
  return payment;
};

const listOrderPayments = async ({ orderId, user, query }) => {
  const orderWhere = { id: orderId };
  if (user.role !== "Admin") orderWhere.user_id = user.id;
  const order = await Order.findOne({ where: orderWhere });
  if (!order) throw new AppError("Order not found", 404);
  return listPayments({ query: { ...query, orderId }, user });
};

const history = async ({ query, user }) => {
  const result = await listPayments({ query, user });
  return {
    ...result,
    items: result.items.map((payment) => ({
      id: payment.id,
      orderNumber: payment.order?.order_number,
      provider: "RAZORPAY",
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      method: payment.method,
      createdAt: payment.created_at,
      paidAt: payment.paid_at,
    })),
  };
};

module.exports = { getPayment, history, listOrderPayments, listPayments };
