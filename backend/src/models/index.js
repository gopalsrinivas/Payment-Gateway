const { Sequelize } = require("sequelize");
const dbConfig = require("../config/database")[process.env.NODE_ENV || "development"];

const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, dbConfig);

const Role = require("./Role")(sequelize);
const User = require("./User")(sequelize);
const Product = require("./Product")(sequelize);
const CartItem = require("./CartItem")(sequelize);
const Order = require("./Order")(sequelize);
const OrderItem = require("./OrderItem")(sequelize);
const Payment = require("./Payment")(sequelize);
const PaymentLog = require("./PaymentLog")(sequelize);
const WebhookEvent = require("./WebhookEvent")(sequelize);

Role.hasMany(User, { foreignKey: "role_id", as: "users" });
User.belongsTo(Role, { foreignKey: "role_id", as: "role" });

User.hasMany(CartItem, { foreignKey: "user_id", as: "cartItems" });
CartItem.belongsTo(User, { foreignKey: "user_id", as: "user" });
Product.hasMany(CartItem, { foreignKey: "product_id", as: "cartItems" });
CartItem.belongsTo(Product, { foreignKey: "product_id", as: "product" });

User.hasMany(Order, { foreignKey: "user_id", as: "orders" });
Order.belongsTo(User, { foreignKey: "user_id", as: "user" });

Order.hasMany(OrderItem, { foreignKey: "order_id", as: "items" });
OrderItem.belongsTo(Order, { foreignKey: "order_id", as: "order" });
Product.hasMany(OrderItem, { foreignKey: "product_id", as: "orderItems" });
OrderItem.belongsTo(Product, { foreignKey: "product_id", as: "product" });

Order.hasMany(Payment, { foreignKey: "order_id", as: "payments" });
Payment.belongsTo(Order, { foreignKey: "order_id", as: "order" });
User.hasMany(Payment, { foreignKey: "user_id", as: "payments" });
Payment.belongsTo(User, { foreignKey: "user_id", as: "user" });

Payment.hasMany(PaymentLog, { foreignKey: "payment_id", as: "logs" });
PaymentLog.belongsTo(Payment, { foreignKey: "payment_id", as: "payment" });
Order.hasMany(PaymentLog, { foreignKey: "order_id", as: "paymentLogs" });
PaymentLog.belongsTo(Order, { foreignKey: "order_id", as: "order" });
User.hasMany(PaymentLog, { foreignKey: "user_id", as: "paymentLogs" });
PaymentLog.belongsTo(User, { foreignKey: "user_id", as: "user" });

module.exports = {
  sequelize,
  Sequelize,
  Role,
  User,
  Product,
  CartItem,
  Order,
  OrderItem,
  Payment,
  PaymentLog,
  WebhookEvent,
};
