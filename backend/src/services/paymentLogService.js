const { PaymentLog, Payment, Order } = require("../models");
const AppError = require("../utils/appError");
const { buildPagination, getPagination } = require("../utils/pagination");
const { buildDateRange, getSafeOrder } = require("../utils/queryHelpers");

const buildWhere = (query) => {
  const where = {};
  if (query.paymentId) where.payment_id = query.paymentId;
  if (query.orderId) where.order_id = query.orderId;
  if (query.eventType) where.event_type = query.eventType;
  if (query.requestId) where.request_id = query.requestId;
  const range = buildDateRange(query.fromDate || query.from_date, query.toDate || query.to_date);
  if (range) where.created_at = range;
  return where;
};

const listLogs = async (query) => {
  const { page, limit, offset } = getPagination(query);
  const { rows, count } = await PaymentLog.findAndCountAll({
    where: buildWhere(query),
    include: [
      { model: Payment, as: "payment", attributes: ["id", "status", "amount", "currency"] },
      { model: Order, as: "order", attributes: ["id", "order_number"] },
    ],
    order: getSafeOrder(query, ["created_at", "event_type", "request_id"]),
    limit,
    offset,
  });
  return { items: rows, pagination: buildPagination(page, limit, count) };
};

const getLog = async (id) => {
  const log = await PaymentLog.findByPk(id);
  if (!log) throw new AppError("Payment log not found", 404);
  return log;
};

const listPaymentLogs = async ({ paymentId, query }) => listLogs({ ...query, paymentId });

module.exports = { getLog, listLogs, listPaymentLogs };

