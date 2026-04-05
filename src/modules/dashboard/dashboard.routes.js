import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import { authorize } from "../../middleware/rbac.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import { summary, trends } from "./dashboard.controller.js";
import { dashboardQuerySchema } from "./dashboard.validation.js";
import { ROLES } from "../../utils/constants.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Dashboard
 *     description: Summary and trends endpoints for analytics consumers
 */

/**
 * @swagger
 * /api/dashboard/summary:
 *   get:
 *     tags: [Dashboard]
 *     summary: Retrieve financial summaries
 *     description: |
 *       Returns totals for income, expenses, net balance, category breakdowns, and the most
 *       recent five records. The route honors the global rate limit of 100 requests per 15 minutes.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [INCOME, EXPENSE]
 *     responses:
 *       200:
 *         description: Dashboard summary payload
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/DashboardSummary"
 */
router.get(
  "/summary",
  authenticate,
  authorize([ROLES.ADMIN, ROLES.ANALYST]),
  validate(dashboardQuerySchema, "query"),
  summary,
);

/**
 * @swagger
 * /api/dashboard/trends:
 *   get:
 *     tags: [Dashboard]
 *     summary: Return historical trends by month
 *     description: |
 *       Provides income/expense trends for the last N months (default 6). Each month is represented
 *       even if there were zero values to keep chart data predictable.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: months
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 6
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [INCOME, EXPENSE]
 *     responses:
 *       200:
 *         description: Trend series
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 trends:
 *                   type: array
 *                   items:
 *                     $ref: "#/components/schemas/DashboardTrend"
 */
router.get(
  "/trends",
  authenticate,
  authorize([ROLES.ADMIN, ROLES.ANALYST]),
  validate(dashboardQuerySchema, "query"),
  trends,
);

export default router;
