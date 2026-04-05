import { Router } from "express";
import { login } from "./auth.controller.js";
import { loginSchema } from "./auth.validation.js";
import { validate } from "../../middleware/validate.middleware.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Authentication endpoints including token issuance
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Authenticate a user and receive a JWT
 *     description: |
 *       Submit valid credentials to obtain a bearer token plus sanitized user information.
 *       The endpoint is bound by the global rate limit (100 requests / 15 minutes).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       200:
 *         description: Authentication success and token details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                       description: Bearer JWT for subsequent calls
 *                     user:
 *                       $ref: "#/components/schemas/User"
 *       401:
 *         description: Invalid credentials or deactivated account
 */
router.post("/login", validate(loginSchema), login);

export default router;
