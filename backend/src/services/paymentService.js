const { Op } = require("sequelize");
const env = require("../config/env");
const logger = require("../config/logger");
const { getRazorpayClient, razorpayKeyId, validateRazorpayConfig } = require("../config/razorpay");
const { sequelize, Order, OrderItem, Payment, PaymentLog } = require("../models");
const AppError = require("../utils/appError");
const { toPaise } = require("../utils/currency");
const { ORDER_PAYMENT_STATUS, ORDER_STATUS, PAYMENT_LOG_SOURCE, PAYMENT_STATUS } = require("../utils/constants");
const { buildPagination, getPagination } = require("../utils/pagination");
const { buildDateRange, getSafeOrder } = require("../utils/queryHelpers");
const { verifyPaymentSignature } = require("../utils/signature");

const paymentAttributes = { exclude: ["razorpay_signature"] };
const reusableStatuses = [PAYMENT_STATUS.CREATED, PAYMENT_STATUS.AUTHORIZED];
const finalSuccessStatuses = [PAYMENT_STATUS.CAPTURED];

const sanitize = (value, max = 255) => {
  if (value === undefined || value === null) return null;
  return String(value).replace(/[^\w\s.:/-]/g, "").slice(0, max);
};

const createLog = (payload, options = {}) =>
  PaymentLog.create(
    {
      payment_id: payload.paymentId || payload.payment_id || null,
      order_id: payload.orderId || payload.order_id || null,
      user_id: payload.userId || payload.user_id || null,
      event_type: payload.eventType,
      source: payload.source,
      status: payload.status || null,
      request_id: payload.requestId || null,
      message: payload.message || null,
      metadata: payload.metadata || null,
      created_by: payload.createdBy || payload.userId || null,
      updated_by: payload.createdBy || payload.userId || null,
    },
    options,
  );

const loadPayableOrder = async ({ orderId, user, transaction, lock }) => {
  const where = { id: orderId };
  if (user.role !== "Admin") where.user_id = user.id;
  const order = await Order.findOne({
    where,
    include: [{ model: OrderItem, as: "items", required: true }],
    transaction,
    lock,
  });
  if (!order) throw new AppError("Order not found", 404);
  if ([ORDER_PAYMENT_STATUS.CAPTURED, ORDER_PAYMENT_STATUS.PAID].includes(order.payment_status)) {
    throw new AppError("Order is already paid", 409);
  }
  if (order.status === ORDER_STATUS.CANCELLED) throw new AppError("Cancelled order cannot be paid", 409);
  return order;
};

const getPaymentForMutation = async ({ paymentId, applicationOrderId, razorpayOrderId, user, transaction, lock }) => {
  const where = {};
  if (paymentId) where.id = paymentId;
  else {
    where.order_id = applicationOrderId;
    where.razorpay_order_id = razorpayOrderId;
  }
  if (user.role !== "Admin") where.user_id = user.id;
  const payment = await Payment.findOne({ where, transaction, lock });
  if (!payment) throw new AppError("Payment not found", 404);
  if (razorpayOrderId && payment.razorpay_order_id !== razorpayOrderId) throw new AppError("Razorpay order mismatch", 409);
  return payment;
};

const serializeCheckout = ({ order, payment, amountPaise }) => ({
  paymentId: payment.id,
  applicationOrderId: order.id,
  applicationOrderNumber: order.order_number,
  razorpayOrderId: payment.razorpay_order_id,
  razorpayKeyId,
  keyId: razorpayKeyId,
  amount: amountPaise,
  currency: order.currency,
  name: env.razorpay.companyName,
  companyName: env.razorpay.companyName,
  description: `Payment for order ${order.order_number}`,
  customer: {
    name: order.user?.name,
    email: order.user?.email,
  },
});

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

const initializePayment = async ({ orderId, user, requestId }) => {
  validateRazorpayConfig();

  const reusable = await sequelize.transaction(async (transaction) => {
    const order = await loadPayableOrder({ orderId, user, transaction, lock: transaction.LOCK.UPDATE });
    const amountPaise = toPaise(order.total_amount, order.currency);
    const existing = await Payment.findOne({
      where: {
        order_id: order.id,
        user_id: order.user_id,
        status: { [Op.in]: reusableStatuses },
        razorpay_order_id: { [Op.ne]: null },
      },
      order: [["created_at", "DESC"]],
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (existing && Number(existing.amount_paise) === amountPaise) {
      await createLog(
        {
          paymentId: existing.id,
          orderId: order.id,
          userId: order.user_id,
          eventType: "RAZORPAY_ORDER_REUSED",
          source: PAYMENT_LOG_SOURCE.APPLICATION,
          status: existing.status,
          requestId,
          message: "Existing Razorpay order reused for retry-safe initialization",
          metadata: { razorpayOrderId: existing.razorpay_order_id },
        },
        { transaction },
      );
      return { order, payment: existing, amountPaise };
    }
    return { order: order.get({ plain: false }), payment: null, amountPaise };
  });

  if (reusable.payment) return serializeCheckout(reusable);

  const receipt = String(reusable.order.order_number).slice(0, 40);
  let razorpayOrder;
  try {
    razorpayOrder = await getRazorpayClient().orders.create({
      amount: reusable.amountPaise,
      currency: reusable.order.currency,
      receipt,
      notes: {
        applicationOrderId: String(reusable.order.id),
        applicationOrderNumber: reusable.order.order_number,
        userId: String(reusable.order.user_id),
      },
    });
  } catch (error) {
    logger.error("Razorpay order creation failed", {
      requestId,
      orderId: reusable.order.id,
      message: error.message,
    });
    throw new AppError("Unable to create Razorpay order", 502);
  }

  const result = await sequelize.transaction(async (transaction) => {
    const order = await loadPayableOrder({ orderId, user, transaction, lock: transaction.LOCK.UPDATE });
    const amountPaise = toPaise(order.total_amount, order.currency);
    if (amountPaise !== reusable.amountPaise) throw new AppError("Order amount changed during payment initialization", 409);

    const attemptNumber = (await Payment.count({ where: { order_id: order.id }, transaction })) + 1;
    const payment = await Payment.create(
      {
        order_id: order.id,
        user_id: order.user_id,
        razorpay_order_id: razorpayOrder.id,
        amount: order.total_amount,
        amount_paise: amountPaise,
        currency: order.currency,
        status: PAYMENT_STATUS.CREATED,
        attempt_number: attemptNumber,
        created_by: user.id,
        updated_by: user.id,
      },
      { transaction },
    );

    await order.update({ payment_status: ORDER_PAYMENT_STATUS.CREATED, status: ORDER_STATUS.PAYMENT_INITIATED, updated_by: user.id }, { transaction });
    await createLog(
      {
        paymentId: payment.id,
        orderId: order.id,
        userId: order.user_id,
        eventType: "RAZORPAY_ORDER_CREATED",
        source: PAYMENT_LOG_SOURCE.RAZORPAY_API,
        status: payment.status,
        requestId,
        message: "Razorpay Test Mode order created",
        metadata: { razorpayOrderId: razorpayOrder.id, amountPaise },
      },
      { transaction },
    );
    return { order, payment, amountPaise };
  });

  return serializeCheckout(result);
};

const verify = async ({ payload, user, requestId }) =>
  sequelize.transaction(async (transaction) => {
    const payment = await getPaymentForMutation({
      paymentId: payload.paymentId,
      applicationOrderId: payload.applicationOrderId,
      razorpayOrderId: payload.razorpayOrderId,
      user,
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    const order = await Order.findOne({ where: { id: payment.order_id }, transaction, lock: transaction.LOCK.UPDATE });
    if (!order) throw new AppError("Order not found", 404);
    if (String(order.id) !== String(payload.applicationOrderId || order.id)) throw new AppError("Application order mismatch", 409);
    if (payment.razorpay_order_id !== payload.razorpayOrderId) throw new AppError("Razorpay order mismatch", 409);

    if (finalSuccessStatuses.includes(payment.status)) {
      if (payment.razorpay_payment_id && payment.razorpay_payment_id !== payload.razorpayPaymentId) {
        throw new AppError("Razorpay payment mismatch", 409);
      }
      return { payment, order, idempotent: true };
    }

    const isValid = verifyPaymentSignature({
      razorpayOrderId: payment.razorpay_order_id,
      razorpayPaymentId: payload.razorpayPaymentId,
      razorpaySignature: payload.razorpaySignature,
      keySecret: env.razorpay.keySecret,
    });

    if (!isValid) {
      await createLog(
        {
          paymentId: payment.id,
          orderId: order.id,
          userId: payment.user_id,
          eventType: "SIGNATURE_VERIFICATION_FAILED",
          source: PAYMENT_LOG_SOURCE.FRONTEND_CALLBACK,
          status: payment.status,
          requestId,
          message: "Payment signature verification failed",
          metadata: { razorpayOrderId: payment.razorpay_order_id, razorpayPaymentId: payload.razorpayPaymentId },
        },
        { transaction },
      );
      throw new AppError("Payment signature verification failed", 400);
    }

    await payment.update(
      {
        razorpay_payment_id: payload.razorpayPaymentId,
        razorpay_signature: payload.razorpaySignature,
        signature_verified: true,
        status: PAYMENT_STATUS.CAPTURED,
        paid_at: new Date(),
        updated_by: user.id,
      },
      { transaction },
    );
    await order.update(
      {
        payment_status: ORDER_PAYMENT_STATUS.CAPTURED,
        status: [ORDER_STATUS.PENDING, ORDER_STATUS.PAYMENT_INITIATED].includes(order.status) ? ORDER_STATUS.PAID : order.status,
        paid_at: order.paid_at || new Date(),
        updated_by: user.id,
      },
      { transaction },
    );
    await createLog(
      {
        paymentId: payment.id,
        orderId: order.id,
        userId: payment.user_id,
        eventType: "SIGNATURE_VERIFICATION_SUCCESS",
        source: PAYMENT_LOG_SOURCE.FRONTEND_CALLBACK,
        status: PAYMENT_STATUS.CAPTURED,
        requestId,
        message: "Payment verified by backend signature check",
        metadata: { razorpayOrderId: payment.razorpay_order_id, razorpayPaymentId: payload.razorpayPaymentId },
      },
      { transaction },
    );

    return { payment, order, idempotent: false };
  });

const recordFailure = async ({ payload, user, requestId }) =>
  sequelize.transaction(async (transaction) => {
    const payment = await getPaymentForMutation({
      paymentId: payload.paymentId,
      applicationOrderId: payload.applicationOrderId,
      razorpayOrderId: payload.razorpayOrderId,
      user,
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    const order = await Order.findOne({ where: { id: payment.order_id }, transaction, lock: transaction.LOCK.UPDATE });
    if (!order) throw new AppError("Order not found", 404);
    if (payment.razorpay_order_id !== payload.razorpayOrderId) throw new AppError("Razorpay order mismatch", 409);

    if (!finalSuccessStatuses.includes(payment.status)) {
      await payment.update(
        {
          razorpay_payment_id: payload.razorpayPaymentId || payment.razorpay_payment_id,
          status: PAYMENT_STATUS.FAILED,
          error_code: sanitize(payload.errorCode || payload.error?.code, 100),
          error_description: sanitize(payload.errorDescription || payload.error?.description || payload.errorReason || payload.error?.reason, 500),
          failed_at: new Date(),
          updated_by: user.id,
        },
        { transaction },
      );
      if (![ORDER_PAYMENT_STATUS.CAPTURED, ORDER_PAYMENT_STATUS.PAID].includes(order.payment_status)) {
        await order.update({ payment_status: ORDER_PAYMENT_STATUS.FAILED, status: ORDER_STATUS.PAYMENT_FAILED, updated_by: user.id }, { transaction });
      }
    }

    await createLog(
      {
        paymentId: payment.id,
        orderId: order.id,
        userId: payment.user_id,
        eventType: "PAYMENT_FAILED",
        source: PAYMENT_LOG_SOURCE.FRONTEND_CALLBACK,
        status: payment.status,
        requestId,
        message: "Frontend reported Razorpay checkout failure",
        metadata: {
          razorpayOrderId: payment.razorpay_order_id,
          razorpayPaymentId: payload.razorpayPaymentId || null,
          code: sanitize(payload.errorCode || payload.error?.code, 100),
          source: sanitize(payload.errorSource || payload.error?.source, 80),
          step: sanitize(payload.errorStep || payload.error?.step, 80),
          reason: sanitize(payload.errorReason || payload.error?.reason, 100),
        },
      },
      { transaction },
    );
    return { payment, order };
  });

module.exports = {
  createLog,
  getPayment,
  history,
  initializePayment,
  listOrderPayments,
  listPayments,
  recordFailure,
  verify,
};
