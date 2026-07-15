const { DataTypes, Model } = require("sequelize");
const { PAYMENT_LOG_SOURCE } = require("../utils/constants");

module.exports = (sequelize) => {
  class PaymentLog extends Model {}

  PaymentLog.init(
    {
      id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
      payment_id: { type: DataTypes.BIGINT },
      order_id: { type: DataTypes.BIGINT },
      user_id: { type: DataTypes.BIGINT },
      event_type: { type: DataTypes.STRING(80), allowNull: false, validate: { notEmpty: true } },
      source: { type: DataTypes.STRING(30), allowNull: false, validate: { isIn: [Object.values(PAYMENT_LOG_SOURCE)] } },
      status: { type: DataTypes.STRING(30) },
      request_id: { type: DataTypes.STRING(100) },
      message: { type: DataTypes.TEXT },
      metadata: { type: DataTypes.JSONB },
      created_by: { type: DataTypes.BIGINT },
      updated_by: { type: DataTypes.BIGINT },
      is_deleted: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      deleted_at: { type: DataTypes.DATE },
      deleted_by: { type: DataTypes.BIGINT },
    },
    {
      sequelize,
      modelName: "PaymentLog",
      tableName: "payment_logs",
      underscored: true,
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      paranoid: false,
      defaultScope: { where: { is_deleted: false } },
    },
  );

  return PaymentLog;
};

