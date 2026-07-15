const { DataTypes, Model } = require("sequelize");
const { PAYMENT_STATUS } = require("../utils/constants");

module.exports = (sequelize) => {
  class Payment extends Model {}

  Payment.init(
    {
      id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
      order_id: { type: DataTypes.BIGINT, allowNull: false },
      user_id: { type: DataTypes.BIGINT, allowNull: false },
      razorpay_order_id: { type: DataTypes.STRING(100) },
      razorpay_payment_id: { type: DataTypes.STRING(100) },
      razorpay_signature: { type: DataTypes.STRING(255) },
      amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false, validate: { min: 0 } },
      amount_paise: { type: DataTypes.BIGINT, allowNull: false, validate: { min: 0 } },
      currency: { type: DataTypes.STRING(3), allowNull: false, defaultValue: "INR", validate: { isIn: [["INR"]] } },
      status: { type: DataTypes.STRING(30), allowNull: false, defaultValue: PAYMENT_STATUS.CREATED, validate: { isIn: [Object.values(PAYMENT_STATUS)] } },
      method: { type: DataTypes.STRING(50) },
      error_code: { type: DataTypes.STRING(100) },
      error_description: { type: DataTypes.TEXT },
      signature_verified: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      webhook_confirmed: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      attempt_number: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1, validate: { min: 1 } },
      paid_at: { type: DataTypes.DATE },
      failed_at: { type: DataTypes.DATE },
      created_by: { type: DataTypes.BIGINT },
      updated_by: { type: DataTypes.BIGINT },
      is_deleted: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      deleted_at: { type: DataTypes.DATE },
      deleted_by: { type: DataTypes.BIGINT },
    },
    {
      sequelize,
      modelName: "Payment",
      tableName: "payments",
      underscored: true,
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      paranoid: false,
      defaultScope: { where: { is_deleted: false } },
    },
  );

  return Payment;
};

