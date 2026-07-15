const swaggerJsdoc = require("swagger-jsdoc");

const successResponse = { $ref: "#/components/schemas/SuccessResponse" };
const errorResponse = { $ref: "#/components/schemas/ErrorResponse" };
const auth = [{ bearerAuth: [] }];

const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Payment Gateway Demo API",
      version: "1.0.0",
      description:
        "Backend APIs for product browsing, cart management, trusted order creation, payment history/log inspection, dashboards, and the raw Razorpay webhook foundation. Razorpay order creation, signature verification, and final webhook processing are intentionally reserved for Part 5.",
    },
    servers: [{ url: "http://localhost:5000/api/v1" }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        RegisterRequest: {
          type: "object",
          required: ["name", "email", "password"],
          properties: {
            name: { type: "string", example: "Demo Customer" },
            email: { type: "string", format: "email", example: "customer@example.com" },
            password: { type: "string", minLength: 8, example: "Password123" },
          },
        },
        LoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", format: "email", example: "customer@example.com" },
            password: { type: "string", example: "Password123" },
          },
        },
        ProductRequest: {
          type: "object",
          required: ["name", "sku", "price"],
          properties: {
            name: { type: "string", example: "Demo Product" },
            description: { type: "string", example: "Razorpay demo catalog item" },
            sku: { type: "string", example: "DEMO-001" },
            price: { type: "number", example: 499 },
            currency: { type: "string", example: "INR" },
            imageUrl: { type: "string", example: "https://example.com/product.png" },
            metadata: { type: "object" },
          },
        },
        CartItemRequest: {
          type: "object",
          required: ["productId", "quantity"],
          properties: {
            productId: { type: "integer", example: 1 },
            quantity: { type: "integer", minimum: 1, maximum: 99, example: 2 },
          },
        },
        CartQuantityRequest: {
          type: "object",
          required: ["quantity"],
          properties: {
            quantity: { type: "integer", minimum: 1, maximum: 99, example: 3 },
          },
        },
        OrderRequest: {
          type: "object",
          properties: {
            notes: { type: "string", example: "Deliver after 5 PM" },
          },
        },
        OrderStatusRequest: {
          type: "object",
          required: ["status"],
          properties: {
            status: {
              type: "string",
              enum: ["CONFIRMED", "PROCESSING", "COMPLETED", "CANCELLED", "FAILED"],
              example: "CONFIRMED",
            },
          },
        },
        SuccessResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string" },
            data: { type: "object" },
            statusCode: { type: "integer" },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string" },
            errors: { type: "array", items: { type: "object" } },
            statusCode: { type: "integer" },
            requestId: { type: "string", example: "REQ-000001" },
          },
        },
      },
    },
    paths: {
      "/auth/register": {
        post: {
          tags: ["Auth"],
          summary: "Register a customer",
          requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/RegisterRequest" } } } },
          responses: { 201: { description: "Registered", content: { "application/json": { schema: successResponse } } }, 400: { description: "Validation error", content: { "application/json": { schema: errorResponse } } }, 409: { description: "Duplicate email" } },
        },
      },
      "/auth/login": {
        post: {
          tags: ["Auth"],
          summary: "Log in",
          requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/LoginRequest" } } } },
          responses: { 200: { description: "JWT token and safe user details" }, 401: { description: "Invalid credentials" } },
        },
      },
      "/auth/logout": {
        post: {
          tags: ["Auth"],
          summary: "Stateless logout acknowledgement",
          security: auth,
          responses: { 200: { description: "Logout successful" }, 401: { description: "Missing or invalid token" } },
        },
      },
      "/auth/profile": {
        get: {
          tags: ["Auth"],
          summary: "Get authenticated profile",
          security: auth,
          responses: { 200: { description: "Profile with role" }, 401: { description: "Missing or invalid token" } },
        },
      },
      "/health": {
        get: {
          tags: ["System"],
          summary: "Health check",
          responses: { 200: { description: "Application and database status" } },
        },
      },
      "/products": {
        get: {
          tags: ["Products"],
          summary: "List active products",
          parameters: [
            { name: "page", in: "query", schema: { type: "integer", default: 1 } },
            { name: "limit", in: "query", schema: { type: "integer", default: 10 } },
            { name: "search", in: "query", schema: { type: "string" } },
            { name: "sortBy", in: "query", schema: { type: "string", enum: ["name", "price", "created_at"] } },
            { name: "sortOrder", in: "query", schema: { type: "string", enum: ["ASC", "DESC"] } },
          ],
          responses: { 200: { description: "Paginated product list" } },
        },
        post: {
          tags: ["Products"],
          summary: "Create product",
          security: auth,
          requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/ProductRequest" } } } },
          responses: { 201: { description: "Product created" }, 403: { description: "Admin role required" }, 409: { description: "Duplicate SKU or slug" } },
        },
      },
      "/products/{id}": {
        get: {
          tags: ["Products"],
          summary: "Get active product",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
          responses: { 200: { description: "Product details" }, 404: { description: "Product not found" } },
        },
        put: {
          tags: ["Products"],
          summary: "Update product",
          security: auth,
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
          requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/ProductRequest" } } } },
          responses: { 200: { description: "Product updated" }, 403: { description: "Admin role required" } },
        },
        patch: {
          tags: ["Products"],
          summary: "Partially update product",
          security: auth,
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
          requestBody: { content: { "application/json": { schema: { $ref: "#/components/schemas/ProductRequest" } } } },
          responses: { 200: { description: "Product updated" }, 403: { description: "Admin role required" } },
        },
        delete: {
          tags: ["Products"],
          summary: "Soft delete product",
          security: auth,
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
          responses: { 200: { description: "Product deleted" }, 403: { description: "Admin role required" } },
        },
      },
      "/products/{id}/status": {
        patch: {
          tags: ["Products"],
          summary: "Activate or deactivate a product",
          security: auth,
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
          requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["isActive"], properties: { isActive: { type: "boolean" } } } } } },
          responses: { 200: { description: "Product status updated" }, 403: { description: "Admin role required" } },
        },
      },
      "/cart": {
        get: { tags: ["Cart"], summary: "View authenticated customer's cart", security: auth, responses: { 200: { description: "Cart with trusted totals" } } },
        delete: { tags: ["Cart"], summary: "Clear authenticated customer's cart", security: auth, responses: { 200: { description: "Cart cleared" } } },
      },
      "/cart/items": {
        post: {
          tags: ["Cart"],
          summary: "Add item to cart",
          security: auth,
          requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/CartItemRequest" } } } },
          responses: { 201: { description: "Cart item added" }, 404: { description: "Product not available" } },
        },
      },
      "/cart/items/{id}": {
        patch: {
          tags: ["Cart"],
          summary: "Update cart item quantity",
          security: auth,
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
          requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/CartQuantityRequest" } } } },
          responses: { 200: { description: "Cart item updated" }, 404: { description: "Cart item not found" } },
        },
        delete: {
          tags: ["Cart"],
          summary: "Remove cart item",
          security: auth,
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
          responses: { 200: { description: "Cart item removed" } },
        },
      },
      "/orders": {
        post: {
          tags: ["Orders"],
          summary: "Create order from authenticated customer's active cart",
          description: "Totals and item snapshots are computed on the server from product prices. Client-supplied trusted totals are rejected.",
          security: auth,
          requestBody: { content: { "application/json": { schema: { $ref: "#/components/schemas/OrderRequest" } } } },
          responses: { 201: { description: "Order created" }, 409: { description: "Cart is empty" } },
        },
        get: {
          tags: ["Orders"],
          summary: "List orders",
          description: "Customers see their own orders; admins can list all orders.",
          security: auth,
          responses: { 200: { description: "Paginated order list" } },
        },
      },
      "/orders/{id}": {
        get: {
          tags: ["Orders"],
          summary: "Get order details",
          security: auth,
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
          responses: { 200: { description: "Order with item snapshots and payments" }, 404: { description: "Order not found" } },
        },
      },
      "/orders/{id}/items": {
        get: {
          tags: ["Orders"],
          summary: "Get order item snapshots",
          security: auth,
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
          responses: { 200: { description: "Order item snapshots" } },
        },
      },
      "/orders/{orderId}/payments": {
        get: {
          tags: ["Payments"],
          summary: "List payments for an order",
          security: auth,
          parameters: [{ name: "orderId", in: "path", required: true, schema: { type: "integer" } }],
          responses: { 200: { description: "Payments for the order" } },
        },
      },
      "/orders/{id}/status": {
        patch: {
          tags: ["Orders"],
          summary: "Admin order status update",
          security: auth,
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
          requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/OrderStatusRequest" } } } },
          responses: { 200: { description: "Order status updated" }, 403: { description: "Admin role required" } },
        },
      },
      "/payments": {
        get: {
          tags: ["Payments"],
          summary: "List payments",
          description: "Customers see their own payments; admins can list all payments. Sensitive signatures are never returned.",
          security: auth,
          responses: { 200: { description: "Paginated payment list" } },
        },
      },
      "/payments/history": {
        get: { tags: ["Payments"], summary: "Authenticated customer's payment history", security: auth, responses: { 200: { description: "Payment history" } } },
      },
      "/payments/{id}": {
        get: {
          tags: ["Payments"],
          summary: "Get payment details",
          security: auth,
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
          responses: { 200: { description: "Payment details without secret fields" }, 404: { description: "Payment not found" } },
        },
      },
      "/payments/{paymentId}/logs": {
        get: {
          tags: ["Payment Logs"],
          summary: "Admin payment logs for a payment",
          security: auth,
          parameters: [{ name: "paymentId", in: "path", required: true, schema: { type: "integer" } }],
          responses: { 200: { description: "Payment logs" }, 403: { description: "Admin role required" } },
        },
      },
      "/payment-logs": {
        get: {
          tags: ["Payment Logs"],
          summary: "Admin payment log list",
          security: auth,
          responses: { 200: { description: "Paginated payment logs" }, 403: { description: "Admin role required" } },
        },
      },
      "/payment-logs/{id}": {
        get: {
          tags: ["Payment Logs"],
          summary: "Admin payment log details",
          security: auth,
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
          responses: { 200: { description: "Payment log details" }, 403: { description: "Admin role required" } },
        },
      },
      "/dashboard/customer": {
        get: { tags: ["Dashboard"], summary: "Customer dashboard summary", security: auth, responses: { 200: { description: "Customer order, cart, and payment summary" } } },
      },
      "/dashboard/admin": {
        get: { tags: ["Dashboard"], summary: "Admin dashboard summary", security: auth, responses: { 200: { description: "Admin aggregate metrics" }, 403: { description: "Admin role required" } } },
      },
      "/dashboard/summary": {
        get: { tags: ["Dashboard"], summary: "Admin summary alias", security: auth, responses: { 200: { description: "Admin aggregate metrics" }, 403: { description: "Admin role required" } } },
      },
      "/dashboard/recent-payments": {
        get: { tags: ["Dashboard"], summary: "Admin recent payments", security: auth, responses: { 200: { description: "Recent payments" }, 403: { description: "Admin role required" } } },
      },
      "/webhooks/razorpay": {
        post: {
          tags: ["Webhooks"],
          summary: "Razorpay webhook foundation only",
          description: "Preserves raw request body handling. It does not verify signatures or process payment events yet.",
          responses: { 200: { description: "Placeholder response" } },
        },
      },
    },
  },
  apis: [],
});

module.exports = swaggerSpec;
