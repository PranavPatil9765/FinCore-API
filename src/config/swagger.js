import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "FinSight API",
      version: "1.0.0",
      description: "Finance Dashboard Backend with RBAC",
    },
    servers: [
      {
        url: "http://localhost:5000",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            id: { type: "integer" },
            name: { type: "string" },
            email: { type: "string", format: "email" },
            role: { type: "string", enum: ["VIEWER", "ANALYST", "ADMIN"] },
            status: { type: "string", enum: ["ACTIVE", "INACTIVE"] },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        Record: {
          type: "object",
          properties: {
            id: { type: "integer" },
            amount: { type: "number", format: "double" },
            type: { type: "string", enum: ["INCOME", "EXPENSE"] },
            category: { type: "string" },
            notes: { type: "string", nullable: true },
            date: { type: "string", format: "date-time" },
            user: {
              $ref: "#/components/schemas/User",
            },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        RecordListResponse: {
          type: "object",
          properties: {
            status: { type: "string" },
            data: {
              type: "object",
              properties: {
                meta: {
                  type: "object",
                  properties: {
                    total: { type: "integer" },
                    page: { type: "integer" },
                    limit: { type: "integer" },
                  },
                },
                records: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Record" },
                },
              },
            },
          },
        },
        DashboardSummary: {
          type: "object",
          properties: {
            totalIncome: { type: "number", format: "double" },
            totalExpenses: { type: "number", format: "double" },
            netBalance: { type: "number", format: "double" },
            categoryTotals: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  category: { type: "string" },
                  type: { type: "string", enum: ["INCOME", "EXPENSE"] },
                  total: { type: "number", format: "double" },
                },
              },
            },
            recentActivity: {
              type: "array",
              items: { $ref: "#/components/schemas/Record" },
            },
          },
        },
        DashboardTrend: {
          type: "object",
          properties: {
            period: { type: "string", description: "YYYY-MM key" },
            income: { type: "number", format: "double" },
            expense: { type: "number", format: "double" },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },

  apis: ["./src/modules/**/*.js"],
};

export const swaggerSpec = swaggerJsdoc(options);
