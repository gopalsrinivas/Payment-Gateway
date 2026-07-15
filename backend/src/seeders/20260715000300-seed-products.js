"use strict";

const products = [
  {
    name: "Interview Preparation Guide",
    slug: "interview-preparation-guide",
    description: "A practical guide for preparing technical interviews.",
    sku: "DEMO-IPG-001",
    price: "499.00",
  },
  {
    name: "Node.js API Starter",
    slug: "nodejs-api-starter",
    description: "A small starter package for building Node.js REST APIs.",
    sku: "DEMO-NAS-002",
    price: "999.00",
  },
  {
    name: "Next.js Dashboard Template",
    slug: "nextjs-dashboard-template",
    description: "A responsive dashboard starter for Next.js applications.",
    sku: "DEMO-NDT-003",
    price: "1499.00",
  },
  {
    name: "Full Stack Demo Package",
    slug: "full-stack-demo-package",
    description: "A complete demo package for full-stack interview practice.",
    sku: "DEMO-FSD-004",
    price: "2499.00",
  },
];

module.exports = {
  async up(queryInterface) {
    for (const product of products) {
      await queryInterface.sequelize.query(
        `
          INSERT INTO products
            (name, slug, description, sku, price, currency, is_active, created_at, updated_at, is_deleted)
          SELECT
            :name, :slug, :description, :sku, :price, 'INR', TRUE, NOW(), NOW(), FALSE
          WHERE NOT EXISTS (
            SELECT 1 FROM products
            WHERE is_deleted = FALSE
              AND (LOWER(slug) = LOWER(:slug) OR LOWER(sku) = LOWER(:sku))
          )
        `,
        { replacements: product },
      );
    }
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(
      `
        DELETE FROM products
        WHERE sku IN ('DEMO-IPG-001', 'DEMO-NAS-002', 'DEMO-NDT-003', 'DEMO-FSD-004')
      `,
    );
  },
};

