const { DataTypes, Model } = require("sequelize");
const { WEBHOOK_PROCESSING_STATUS } = require("../utils/constants");

module.exports = (sequelize) => {
  class WebhookEvent extends Model {}

  WebhookEvent.init(
    {
      id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
      provider: { type: DataTypes.STRING(30), allowNull: false, defaultValue: "RAZORPAY", validate: { isIn: [["RAZORPAY"]] } },
      provider_event_id: { type: DataTypes.STRING(150) },
      event_type: { type: DataTypes.STRING(100), allowNull: false, validate: { notEmpty: true } },
      entity_id: { type: DataTypes.STRING(100) },
      signature: { type: DataTypes.STRING(255) },
      signature_verified: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      payload: { type: DataTypes.JSONB, allowNull: false },
      processing_status: {
        type: DataTypes.STRING(30),
        allowNull: false,
        defaultValue: WEBHOOK_PROCESSING_STATUS.RECEIVED,
        validate: { isIn: [Object.values(WEBHOOK_PROCESSING_STATUS)] },
      },
      processing_attempts: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0, validate: { min: 0 } },
      processed_at: { type: DataTypes.DATE },
      last_error: { type: DataTypes.TEXT },
      received_at: { type: DataTypes.DATE },
      created_by: { type: DataTypes.BIGINT },
      updated_by: { type: DataTypes.BIGINT },
      is_deleted: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      deleted_at: { type: DataTypes.DATE },
      deleted_by: { type: DataTypes.BIGINT },
    },
    {
      sequelize,
      modelName: "WebhookEvent",
      tableName: "webhook_events",
      underscored: true,
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      paranoid: false,
      defaultScope: { where: { is_deleted: false } },
    },
  );

  return WebhookEvent;
};

