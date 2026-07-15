const { Op } = require("sequelize");
const { CartItem, Order, Payment, Product, User, Role } = require("../models");
const { ORDER_STATUS, PAYMENT_STATUS } = require("../utils/constants");

const todayRange = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  return { [Op.gte]: start };
};

const customerDashboard = async (userId) => {
  const [
    activeCartItemCount,
    totalOrders,
    pendingOrders,
    completedOrders,
    successfulPayments,
    failedPayments,
    pendingPayments,
    totalPaid,
  ] = await Promise.all([
    CartItem.count({ where: { user_id: userId } }),
    Order.count({ where: { user_id: userId } }),
    Order.count({ where: { user_id: userId, status: ORDER_STATUS.PENDING } }),
    Order.count({ where: { user_id: userId, status: { [Op.in]: [ORDER_STATUS.COMPLETED, ORDER_STATUS.PAID] } } }),
    Payment.count({ where: { user_id: userId, status: PAYMENT_STATUS.CAPTURED } }),
    Payment.count({ where: { user_id: userId, status: PAYMENT_STATUS.FAILED } }),
    Payment.count({ where: { user_id: userId, status: { [Op.in]: [PAYMENT_STATUS.CREATED, PAYMENT_STATUS.AUTHORIZED] } } }),
    Payment.sum("amount", { where: { user_id: userId, status: PAYMENT_STATUS.CAPTURED } }),
  ]);

  return {
    activeCartItemCount,
    totalOrders,
    pendingOrders,
    completedOrders,
    successfulPayments,
    failedPayments,
    pendingPayments,
    totalPaidAmount: totalPaid || "0.00",
  };
};

const adminDashboard = async () => {
  const customerRole = await Role.findOne({ where: { name: "Customer" } });
  const [
    totalProducts,
    activeProducts,
    totalCustomers,
    totalOrders,
    pendingOrders,
    completedOrders,
    cancelledOrders,
    successfulPayments,
    failedPayments,
    pendingPayments,
    totalCollectedAmount,
    ordersCreatedToday,
    paymentsCompletedToday,
    recentOrders,
    recentPayments,
  ] = await Promise.all([
    Product.count(),
    Product.count({ where: { is_active: true } }),
    customerRole ? User.count({ where: { role_id: customerRole.id } }) : 0,
    Order.count(),
    Order.count({ where: { status: ORDER_STATUS.PENDING } }),
    Order.count({ where: { status: { [Op.in]: [ORDER_STATUS.COMPLETED, ORDER_STATUS.PAID] } } }),
    Order.count({ where: { status: ORDER_STATUS.CANCELLED } }),
    Payment.count({ where: { status: PAYMENT_STATUS.CAPTURED } }),
    Payment.count({ where: { status: PAYMENT_STATUS.FAILED } }),
    Payment.count({ where: { status: { [Op.in]: [PAYMENT_STATUS.CREATED, PAYMENT_STATUS.AUTHORIZED] } } }),
    Payment.sum("amount", { where: { status: PAYMENT_STATUS.CAPTURED } }),
    Order.count({ where: { created_at: todayRange() } }),
    Payment.count({ where: { paid_at: todayRange(), status: PAYMENT_STATUS.CAPTURED } }),
    Order.findAll({ order: [["created_at", "DESC"]], limit: 5 }),
    Payment.findAll({ attributes: { exclude: ["razorpay_signature"] }, order: [["created_at", "DESC"]], limit: 5 }),
  ]);

  return {
    totalProducts,
    activeProducts,
    totalCustomers,
    totalOrders,
    pendingOrders,
    completedOrders,
    cancelledOrders,
    successfulPayments,
    failedPayments,
    pendingPayments,
    totalCollectedAmount: totalCollectedAmount || "0.00",
    ordersCreatedToday,
    paymentsCompletedToday,
    recentOrders,
    recentPayments,
  };
};

const recentPayments = async (limit = 10) =>
  Payment.findAll({
    attributes: { exclude: ["razorpay_signature"] },
    include: [{ model: Order, as: "order", attributes: ["id", "order_number"] }],
    order: [["created_at", "DESC"]],
    limit: Math.min(Number(limit) || 10, 50),
  });

module.exports = { adminDashboard, customerDashboard, recentPayments };
