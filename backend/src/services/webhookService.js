const crypto = require("crypto");
const { Op, UniqueConstraintError } = require("sequelize");
const env = require("../config/env");
const { sequelize, Order, Payment, WebhookEvent } = require("../models");
const AppError = require("../utils/appError");
const { ORDER_PAYMENT_STATUS, ORDER_STATUS, PAYMENT_LOG_SOURCE, PAYMENT_STATUS, WEBHOOK_PROCESSING_STATUS } = require("../utils/constants");
const { verifyWebhookSignature } = require("../utils/signature");
const paymentService = require("./paymentService");

const supportedEvents = new Set(["payment.authorized", "payment.captured", "payment.failed", "order.paid"]);

const getEntity = (payload) => payload?.payload?.payment?.entity || payload?.payload?.order?.entity || {};

const getProviderEventId = (payload, rawBody) =>
  payload.id || crypto.createHash("sha256").update(rawBody).digest("hex");

const updateCaptured = async ({ payment, order, transaction, source, requestId, webhookConfirmed = true }) => {
  if (!payment || !order) return;
  if (payment.status !== PAYMENT_STATUS.CAPTURED) {
    await payment.update(
      {
        status: PAYMENT_STATUS.CAPTURED,
        signature_verified: payment.signature_verified || source === "verify",
        webhook_confirmed: webhookConfirmed,
        paid_at: payment.paid_at || new Date(),
      },
      { transaction },
    );
  } else if (webhookConfirmed && !payment.webhook_confirmed) {
    await payment.update({ webhook_confirmed: true }, { transaction });
  }

  if (![ORDER_PAYMENT_STATUS.CAPTURED, ORDER_PAYMENT_STATUS.PAID].includes(order.payment_status)) {
    await order.update(
      {
        payment_status: ORDER_PAYMENT_STATUS.CAPTURED,
        status: [ORDER_STATUS.PENDING, ORDER_STATUS.PAYMENT_INITIATED, ORDER_STATUS.PAYMENT_FAILED].includes(order.status) ? ORDER_STATUS.PAID : order.status,
        paid_at: order.paid_at || new Date(),
      },
      { transaction },
    );
  }

  await paymentService.createLog(
    {
      paymentId: payment.id,
      orderId: order.id,
      userId: payment.user_id,
      eventType: "WEBHOOK_PAYMENT_CAPTURED",
      source: PAYMENT_LOG_SOURCE.WEBHOOK,
      status: PAYMENT_STATUS.CAPTURED,
      requestId,
      message: "Webhook confirmed captured payment",
      metadata: { razorpayOrderId: payment.razorpay_order_id, razorpayPaymentId: payment.razorpay_payment_id },
    },
    { transaction },
  );
};

const processPaymentEvent = async ({ payload, eventType, requestId, transaction }) => {
  const entity = getEntity(payload);
  const razorpayOrderId = entity.order_id || entity.id;
  const razorpayPaymentId = entity.id?.startsWith("pay_") ? entity.id : null;
  if (!razorpayOrderId && !razorpayPaymentId) {
    return { status: WEBHOOK_PROCESSING_STATUS.IGNORED, message: "Webhook event did not include a supported Razorpay identifier" };
  }
  const payment = await Payment.findOne({
    where: {
      [Op.or]: [
        ...(razorpayPaymentId ? [{ razorpay_payment_id: razorpayPaymentId }] : []),
        ...(razorpayOrderId ? [{ razorpay_order_id: razorpayOrderId }] : []),
      ],
    },
    transaction,
    lock: transaction.LOCK.UPDATE,
  });
  if (!payment) return { status: WEBHOOK_PROCESSING_STATUS.IGNORED, message: "No local payment matched webhook event" };

  const order = await Order.findOne({ where: { id: payment.order_id }, transaction, lock: transaction.LOCK.UPDATE });
  if (!order) return { status: WEBHOOK_PROCESSING_STATUS.IGNORED, message: "No local order matched webhook event" };
  if (Number(entity.amount) && Number(entity.amount) !== Number(payment.amount_paise)) {
    await paymentService.createLog(
      {
        paymentId: payment.id,
        orderId: order.id,
        userId: payment.user_id,
        eventType: "WEBHOOK_AMOUNT_MISMATCH",
        source: PAYMENT_LOG_SOURCE.WEBHOOK,
        status: payment.status,
        requestId,
        message: "Webhook amount did not match local payment amount",
        metadata: { webhookAmount: entity.amount, localAmount: payment.amount_paise },
      },
      { transaction },
    );
    return { status: WEBHOOK_PROCESSING_STATUS.FAILED, message: "Webhook amount mismatch" };
  }

  if (razorpayPaymentId && !payment.razorpay_payment_id) {
    await payment.update({ razorpay_payment_id: razorpayPaymentId, method: entity.method || payment.method }, { transaction });
  }

  if (eventType === "payment.authorized" && payment.status !== PAYMENT_STATUS.CAPTURED) {
    await payment.update({ status: PAYMENT_STATUS.AUTHORIZED, webhook_confirmed: true, method: entity.method || payment.method }, { transaction });
    await paymentService.createLog(
      {
        paymentId: payment.id,
        orderId: order.id,
        userId: payment.user_id,
        eventType: "WEBHOOK_PAYMENT_AUTHORIZED",
        source: PAYMENT_LOG_SOURCE.WEBHOOK,
        status: PAYMENT_STATUS.AUTHORIZED,
        requestId,
        message: "Webhook authorized payment",
      },
      { transaction },
    );
  }

  if (eventType === "payment.captured" || eventType === "order.paid") {
    await updateCaptured({ payment, order, transaction, source: "webhook", requestId });
  }

  if (eventType === "payment.failed" && payment.status !== PAYMENT_STATUS.CAPTURED) {
    await payment.update(
      {
        status: PAYMENT_STATUS.FAILED,
        webhook_confirmed: true,
        error_code: entity.error_code || payment.error_code,
        error_description: entity.error_description || entity.error_reason || payment.error_description,
        failed_at: payment.failed_at || new Date(),
      },
      { transaction },
    );
    if (![ORDER_PAYMENT_STATUS.CAPTURED, ORDER_PAYMENT_STATUS.PAID].includes(order.payment_status)) {
      await order.update({ payment_status: ORDER_PAYMENT_STATUS.FAILED, status: ORDER_STATUS.PAYMENT_FAILED }, { transaction });
    }
    await paymentService.createLog(
      {
        paymentId: payment.id,
        orderId: order.id,
        userId: payment.user_id,
        eventType: "WEBHOOK_PAYMENT_FAILED",
        source: PAYMENT_LOG_SOURCE.WEBHOOK,
        status: PAYMENT_STATUS.FAILED,
        requestId,
        message: "Webhook reported failed payment",
      },
      { transaction },
    );
  }

  return { status: WEBHOOK_PROCESSING_STATUS.PROCESSED, message: "Webhook event processed" };
};

const processRazorpayWebhook = async ({ rawBody, signature, requestId }) => {
  if (!signature) throw new AppError("Missing Razorpay webhook signature", 400);
  if (!env.razorpay.webhookSecret) throw new AppError("Missing Razorpay webhook configuration", 500);
  if (!Buffer.isBuffer(rawBody)) throw new AppError("Webhook raw body is required", 400);

  const valid = verifyWebhookSignature({ rawBody, signature, webhookSecret: env.razorpay.webhookSecret });
  if (!valid) throw new AppError("Invalid Razorpay webhook signature", 400);

  let payload;
  try {
    payload = JSON.parse(rawBody.toString("utf8"));
  } catch {
    throw new AppError("Invalid webhook JSON payload", 400);
  }

  const eventType = payload.event || "unknown";
  const entity = getEntity(payload);
  const providerEventId = getProviderEventId(payload, rawBody);

  return sequelize.transaction(async (transaction) => {
    const existing = await WebhookEvent.findOne({ where: { provider: "RAZORPAY", provider_event_id: providerEventId }, transaction });
    if (existing) {
      await paymentService.createLog(
        {
          eventType: "WEBHOOK_DUPLICATE_IGNORED",
          source: PAYMENT_LOG_SOURCE.WEBHOOK,
          status: existing.processing_status,
          requestId,
          message: "Duplicate Razorpay webhook ignored",
          metadata: { providerEventId, eventType },
        },
        { transaction },
      );
      return { duplicate: true, event: existing };
    }

    let event;
    try {
      event = await WebhookEvent.create(
        {
          provider: "RAZORPAY",
          provider_event_id: providerEventId,
          event_type: eventType,
          entity_id: entity.id || entity.order_id || null,
          signature,
          signature_verified: true,
          payload,
          processing_status: WEBHOOK_PROCESSING_STATUS.VERIFIED,
          processing_attempts: 1,
          received_at: new Date(),
        },
        { transaction },
      );
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        return { duplicate: true, event: await WebhookEvent.findOne({ where: { provider: "RAZORPAY", provider_event_id: providerEventId }, transaction }) };
      }
      throw error;
    }

    if (!supportedEvents.has(eventType)) {
      await event.update({ processing_status: WEBHOOK_PROCESSING_STATUS.IGNORED, processed_at: new Date() }, { transaction });
      return { duplicate: false, event, ignored: true };
    }

    const result = await processPaymentEvent({ payload, eventType, requestId, transaction });
    await event.update(
      {
        processing_status: result.status,
        processed_at: new Date(),
        last_error: result.status === WEBHOOK_PROCESSING_STATUS.FAILED ? result.message : null,
      },
      { transaction },
    );

    return { duplicate: false, event, ignored: result.status === WEBHOOK_PROCESSING_STATUS.IGNORED };
  });
};

module.exports = { processRazorpayWebhook };
