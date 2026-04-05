import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import { authorize } from "../../middleware/rbac.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import {
  recordCreateSchema,
  recordUpdateSchema,
  recordListSchema,
} from "./record.validation.js";
import {
  createRecord,
  listRecords,
  getRecord,
  updateRecord,
  deleteRecord,
} from "./record.controller.js";
import { ROLES } from "../../utils/constants.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Records
 *     description: Financial transaction record management
 */

/**
 * @swagger
 * /api/records:
 *   post:
 *     tags: [Records]
 *     summary: Create a financial record
 *     description: |
 *       Admins can create records tied to their user ID. Record creation is subject to the
 *       global rate limit (100 requests / 15 minutes).
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - type
 *               - category
 *               - date
 *             properties:
 *               amount:
 *                 type: number
 *               type:
 *                 type: string
 *                 enum:
 *                   - INCOME
 *                   - EXPENSE
 *               category:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Record created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Record"
 */
router.post(
  "/",
  authenticate,
  authorize([ROLES.ADMIN]),
  validate(recordCreateSchema),
  createRecord
);

/**
 * @swagger
 * /api/records:
 *   get:
 *     tags: [Records]
 *     summary: List financial records
 *     description: |
 *       Admins and analysts can see all records, while viewers receive only their own.
 *       Supports filtering by date range, category, and type plus pagination.
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
 *           enum:
 *             - INCOME
 *             - EXPENSE
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Paginated records
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/RecordListResponse"
 */
router.get(
  "/",
  authenticate,
  authorize([ROLES.ADMIN, ROLES.ANALYST, ROLES.VIEWER]),
  validate(recordListSchema, "query"),
  listRecords
);

/**
 * @swagger
 * /api/records/{id}:
 *   get:
 *     tags: [Records]
 *     summary: Fetch a single record
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Record data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Record"
 *       403:
 *         description: Viewers cannot read other users' records
 */
router.get(
  "/:id",
  authenticate,
  authorize([ROLES.ADMIN, ROLES.ANALYST, ROLES.VIEWER]),
  getRecord
);

/**
 * @swagger
 * /api/records/{id}:
 *   patch:
 *     tags: [Records]
 *     summary: Update a record (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *               type:
 *                 type: string
 *                 enum:
 *                   - INCOME
 *                   - EXPENSE
 *               category:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated record
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Record"
 */
router.patch(
  "/:id",
  authenticate,
  authorize([ROLES.ADMIN]),
  validate(recordUpdateSchema),
  updateRecord
);

/**
 * @swagger
 * /api/records/{id}:
 *   delete:
 *     tags: [Records]
 *     summary: Delete a record (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Record deleted
 */
router.delete(
  "/:id",
  authenticate,
  authorize([ROLES.ADMIN]),
  deleteRecord
);

export default router;