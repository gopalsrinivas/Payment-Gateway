"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("webhook_events", {
      id: { type: Sequelize.BIGINT, autoIncrement: true, primaryKey: true },
      provider: { type: Sequelize.STRING(30), allowNull: false, defaultValue: "RAZORPAY" },
      provider_event_id: { type: Sequelize.STRING(150), allowNull: true },
      event_type: { type: Sequelize.STRING(100), allowNull: false },
      entity_id: { type: Sequelize.STRING(100), allowNull: true },
      signature: { type: Sequelize.STRING(255), allowNull: true },
      signature_verified: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      payload: { type: Sequelize.JSONB, allowNull: false },
      processing_status: { type: Sequelize.STRING(30), allowNull: false, defaultValue: "RECEIVED" },
      processing_attempts: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      processed_at: { type: Sequelize.DATE, allowNull: true },
      last_error: { type: Sequelize.TEXT, allowNull: true },
      received_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn("NOW") },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn("NOW") },
      created_by: {
        type: Sequelize.BIGINT,
        allowNull: true,
        references: { model: "users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn("NOW") },
      updated_by: {
        type: Sequelize.BIGINT,
        allowNull: true,
        references: { model: "users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      is_deleted: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      deleted_at: { type: Sequelize.DATE, allowNull: true },
      deleted_by: {
        type: Sequelize.BIGINT,
        allowNull: true,
        references: { model: "users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("webhook_events");
  },
};

