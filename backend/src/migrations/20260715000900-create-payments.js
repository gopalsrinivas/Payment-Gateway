"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("payments", {
      id: { type: Sequelize.BIGINT, autoIncrement: true, primaryKey: true },
      order_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: { model: "orders", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      user_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: { model: "users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      razorpay_order_id: { type: Sequelize.STRING(100), allowNull: true },
      razorpay_payment_id: { type: Sequelize.STRING(100), allowNull: true },
      razorpay_signature: { type: Sequelize.STRING(255), allowNull: true },
      amount: { type: Sequelize.DECIMAL(12, 2), allowNull: false },
      amount_paise: { type: Sequelize.BIGINT, allowNull: false },
      currency: { type: Sequelize.STRING(3), allowNull: false, defaultValue: "INR" },
      status: { type: Sequelize.STRING(30), allowNull: false, defaultValue: "CREATED" },
      method: { type: Sequelize.STRING(50), allowNull: true },
      error_code: { type: Sequelize.STRING(100), allowNull: true },
      error_description: { type: Sequelize.TEXT, allowNull: true },
      signature_verified: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      webhook_confirmed: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      attempt_number: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 1 },
      paid_at: { type: Sequelize.DATE, allowNull: true },
      failed_at: { type: Sequelize.DATE, allowNull: true },
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
    await queryInterface.dropTable("payments");
  },
};

