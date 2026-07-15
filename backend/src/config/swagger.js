const swaggerJsdoc = require("swagger-jsdoc");

const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Payment Gateway Demo API",
      version: "1.0.0",
      description: "Part 1 foundation API. Razorpay payment processing is intentionally not implemented yet.",
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
          requestBody: {
            required: true,
            content: { "application/json": { schema: { $ref: "#/components/schemas/RegisterRequest" } } },
          },
          responses: {
            201: { description: "Registered", content: { "application/json": { schema: { $ref: "#/components/schemas/SuccessResponse" } } } },
            400: { description: "Validation error", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
            409: { description: "Duplicate email" },
          },
        },
      },
      "/auth/login": {
        post: {
          tags: ["Auth"],
          summary: "Log in",
          requestBody: {
            required: true,
            content: { "application/json": { schema: { $ref: "#/components/schemas/LoginRequest" } } },
          },
          responses: {
            200: { description: "JWT token and safe user details" },
            401: { description: "Invalid credentials" },
          },
        },
      },
      "/auth/logout": {
        post: {
          tags: ["Auth"],
          summary: "Stateless logout acknowledgement",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "Logout successful" }, 401: { description: "Missing or invalid token" } },
        },
      },
      "/auth/profile": {
        get: {
          tags: ["Auth"],
          summary: "Get authenticated profile",
          security: [{ bearerAuth: [] }],
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
      "/webhooks/razorpay": {
        post: {
          tags: ["Webhooks"],
          summary: "Razorpay webhook foundation only",
          description: "Part 1 endpoint that preserves raw request body handling. It does not verify signatures or process payment events yet.",
          responses: { 200: { description: "Placeholder response" } },
        },
      },
    },
  },
  apis: [],
});

module.exports = swaggerSpec;

