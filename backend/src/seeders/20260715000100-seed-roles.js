"use strict";

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert(
      "roles",
      [
        { name: "Admin", description: "Application administrator", is_active: true, created_at: new Date(), updated_at: new Date() },
        { name: "Customer", description: "Registered customer", is_active: true, created_at: new Date(), updated_at: new Date() },
      ],
      { ignoreDuplicates: true },
    );
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("roles", { name: ["Admin", "Customer"] });
  },
};

