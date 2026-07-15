const { Op } = require("sequelize");
const { sequelize, CartItem, Order, OrderItem, Payment, Product } = require("../models");
const AppError = require("../utils/appError");
const { ORDER_PAYMENT_STATUS, ORDER_STATUS } = require("../utils/constants");
const { generateOrderNumber } = require("../utils/orderNumber");
const { buildPagination, getPagination } = require("../utils/pagination");
const { buildDateRange, getSafeOrder } = require("../utils/queryHelpers");

const includeOrder = [
  { model: OrderItem, as: "items" },
  { model: Payment, as: "payments", attributes: { exclude: ["razorpay_signature"] } },
];

const createOrder = async ({ userId, notes }) =>
  sequelize.transaction(async (transaction) => {
    const cartItems = await CartItem.findAll({
      where: { user_id: userId },
      include: [{ model: Product, as: "product" }],
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!cartItems.length) throw new AppError("Cart is empty", 409);
    if (cartItems.some((item) => !item.product || !item.product.is_active)) {
      throw new AppError("Cart contains unavailable products", 409);
    }

    const subtotal = cartItems.reduce((sum, item) => sum + Number(item.product.price) * Number(item.quantity), 0);
    const order = await Order.create(
      {
        order_number: generateOrderNumber(),
        user_id: userId,
        subtotal_amount: subtotal.toFixed(2),
        tax_amount: "0.00",
        discount_amount: "0.00",
        total_amount: subtotal.toFixed(2),
        currency: "INR",
        status: ORDER_STATUS.PENDING,
        payment_status: ORDER_PAYMENT_STATUS.PENDING,
        notes,
        created_by: userId,
        updated_by: userId,
      },
      { transaction },
    );

    const items = await OrderItem.bulkCreate(
      cartItems.map((item) => ({
        order_id: order.id,
        product_id: item.product.id,
        product_name: item.product.name,
        product_sku: item.product.sku,
        unit_price: item.product.price,
        quantity: item.quantity,
        line_total: (Number(item.product.price) * Number(item.quantity)).toFixed(2),
        created_by: userId,
        updated_by: userId,
      })),
      { transaction },
    );

    await CartItem.update(
      { is_deleted: true, deleted_at: new Date(), deleted_by: userId, updated_by: userId },
      { where: { user_id: userId, is_deleted: false }, transaction },
    );

    return { ...order.get({ plain: true }), items: items.map((item) => item.get({ plain: true })), payments: [] };
  });

const listOrders = async ({ query, user }) => {
  const { page, limit, offset } = getPagination(query);
  const where = {};
  if (user.role !== "Admin") where.user_id = user.id;
  if (query.status) where.status = query.status;
  if (query.paymentStatus || query.payment_status) where.payment_status = query.paymentStatus || query.payment_status;
  const range = buildDateRange(query.fromDate || query.from_date, query.toDate || query.to_date);
  if (range) where.created_at = range;
  if (query.search) where.order_number = { [Op.iLike]: `%${query.search}%` };

  const { rows, count } = await Order.findAndCountAll({
    where,
    include: [{ model: OrderItem, as: "items" }],
    order: getSafeOrder(query, ["created_at", "updated_at", "order_number", "total_amount"]),
    limit,
    offset,
    distinct: true,
  });
  return { items: rows, pagination: buildPagination(page, limit, count) };
};

const getOrder = async ({ id, user }) => {
  const where = { id };
  if (user.role !== "Admin") where.user_id = user.id;
  const order = await Order.findOne({ where, include: includeOrder });
  if (!order) throw new AppError("Order not found", 404);
  return order;
};

const getOrderItems = async ({ id, user }) => {
  const order = await getOrder({ id, user });
  return order.items || [];
};

const updateStatus = async ({ id, status, userId }) => {
  const order = await Order.findByPk(id);
  if (!order) throw new AppError("Order not found", 404);
  const allowed = {
    [ORDER_STATUS.PENDING]: [ORDER_STATUS.CONFIRMED, ORDER_STATUS.CANCELLED],
    [ORDER_STATUS.CONFIRMED]: [ORDER_STATUS.PROCESSING, ORDER_STATUS.CANCELLED],
    [ORDER_STATUS.PROCESSING]: [ORDER_STATUS.COMPLETED, ORDER_STATUS.CANCELLED],
  };
  if (!allowed[order.status]?.includes(status)) throw new AppError("Invalid order status transition", 409);
  await order.update({ status, updated_by: userId });
  return order;
};

module.exports = { createOrder, getOrder, getOrderItems, listOrders, updateStatus };
