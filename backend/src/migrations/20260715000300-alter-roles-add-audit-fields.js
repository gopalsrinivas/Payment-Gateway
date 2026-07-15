"use strict";

const addColumnIfMissing = async (queryInterface, tableName, columnName, definition) => {
  const table = await queryInterface.describeTable(tableName);
  if (!table[columnName]) {
    await queryInterface.addColumn(tableName, columnName, definition);
  }
};

const removeColumnIfExists = async (queryInterface, tableName, columnName) => {
  const table = await queryInterface.describeTable(tableName);
  if (table[columnName]) {
    await queryInterface.removeColumn(tableName, columnName);
  }
};

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await addColumnIfMissing(queryInterface, "roles", "created_by", {
        type: Sequelize.BIGINT,
        allowNull: true,
        references: { model: "users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      });
      await addColumnIfMissing(queryInterface, "roles", "updated_by", {
        type: Sequelize.BIGINT,
        allowNull: true,
        references: { model: "users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      });
      await addColumnIfMissing(queryInterface, "roles", "is_deleted", {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      });
      await addColumnIfMissing(queryInterface, "roles", "deleted_by", {
        type: Sequelize.BIGINT,
        allowNull: true,
        references: { model: "users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      });

      await queryInterface.sequelize.query('UPDATE "roles" SET "is_deleted" = FALSE WHERE "is_deleted" IS NULL', { transaction });
    });
  },

  async down(queryInterface) {
    await queryInterface.sequelize.transaction(async () => {
      await removeColumnIfExists(queryInterface, "roles", "deleted_by");
      await removeColumnIfExists(queryInterface, "roles", "is_deleted");
      await removeColumnIfExists(queryInterface, "roles", "updated_by");
      await removeColumnIfExists(queryInterface, "roles", "created_by");
    });
  },
};

