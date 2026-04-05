# Finance Data Processing and Access Control Backend 
# URL = https://fincore-api-58ge.onrender.com

This project implements a finance dashboard API with role-based access control, transactional record management, and summary analytics.

## Key highlights
- **Structured RBAC**—`ADMIN`, `ANALYST`, and `VIEWER` roles control who can mutate data, read analytics, or just view their records.
- **Prisma + PostgreSQL** for persistence, including migrations and a development seed for the default admin user.
- **Express + Zod** for clean routing, validation, and sensible error payloads.
- **Utility endpoints** for dashboard summaries and trends plus Swagger documentation at `https://fincore-api-58ge.onrender.com/api-docs`.
- **UUID-based identifiers**—`User` and `Record` IDs are UUID strings, so clients should send the full string from the API or Swagger.
- **Rate limiting**—all routes are subject to the global policy (100 requests per 15 minutes) enforced via middleware and documented in Swagger responses/descriptions.

## Getting started
1. **Install dependencies**
   ```bash
   npm install
   ```
2. **Copy environment variables**
   ```bash
   cp .example.env .env
   ```
   Update `.env` with your database credentials and any secrets you want to change.
3. **Generate Prisma client**
   ```bash
   npx prisma generate
   ```
4. **Run migrations**
   ```bash
   npx prisma migrate reset --force
   ```
5. **Start the server**
   ```bash
   npm start
   ```

> The server will ensure a default admin exists. Credentials are derived from `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `.env` (defaults: `admin@fincore.local` / `DevAdmin123!`). Update those values before deploying.

## API overview
| Endpoint | Method | Role | Description |
| --- | --- | --- | --- |
| `/api/auth/login` | POST | Anyone with credentials | Returns a JWT for subsequent calls. |
| `/api/users` | POST | ADMIN | Create users and assign roles/status. |
| `/api/users` | GET | ADMIN | Paginated listing with optional `role` / `status` filters. |
| `/api/users/me` | GET | Authenticated | Returns the caller's profile (no password). |
| `/api/users/:id` | GET | Admin/owner | Admins can fetch anyone; other users can fetch only their own record. |
| `/api/users/:id` | PATCH | ADMIN | Update name, email, password, role, or status. |
| `/api/records` | POST | ADMIN | Create a transaction linked to the authenticated user. |
| `/api/records` | GET | ADMIN / ANALYST / VIEWER | Paginated/filtered view (VIEWERs only see their own). Supports `startDate`, `endDate`, `category`, `type`, `page`, `limit`. |
| `/api/records/:id` | GET | ADMIN / ANALYST / VIEWER | View a single record (VIEWERs only their own). |
| `/api/records/:id` | PATCH | ADMIN | Update record details. |
| `/api/records/:id` | DELETE | ADMIN | Remove a record. |
| `/api/dashboard/summary` | GET | ADMIN / ANALYST | Aggregated totals, category breakdown, and recent activity. |
| `/api/dashboard/trends` | GET | ADMIN / ANALYST | Monthly income/expense trends (default last 6 months). |

All payloads and responses follow a normalized shape with a `status` and optional `data`/`errors` object.

## Update validation guarantees
- **Users:** `PATCH /api/users/:id` is guarded by the `updateUserSchema` in `src/modules/user/user.validation.js`; it requires at least one updatable field and enforces the same constraints as creation, so bad email formats, weak passwords, or invalid roles/statuses are rejected before touching the database.
- **Records:** `PATCH /api/records/:id` uses `recordUpdateSchema`, which only allows the whitelisted properties (`amount`, `type`, `category`, `date`, `notes`) and enforces positive amounts and valid enum values. Every update passes through this Zod layer to avoid partial writes or invalid enums.

## Access control and validation
- **Roles** are enforced via middleware (`authenticate` + `authorize`). Admins manage data, analysts read records and analytics, viewers can only read their data.
- **Validation** is powered by Zod schemas per route. Invalid inputs return `422` with granular issue details.
- **Errors** are propagated through a centralized middleware that returns `{ status: "error", message, errors? }`.
- **Rate limiting** is enabled globally (100 requests / 15 minutes) to keep the assessment backend safe.

## Database & seeding
- The Prisma schema defines `User` and `Record` models plus enums for roles, statuses, and record types.
- Run `npx prisma migrate reset --force` to apply the migrations (this drops any existing data and builds the UUID-based schema) and `npx prisma generate` to refresh the client.
- On server start, the backend ensures an `ADMIN` user exists using `ADMIN_EMAIL` and `ADMIN_PASSWORD` from `.env`. Change those before production use.

## Running & verifying
- Start the server: `npm start`.
- Swagger/OpenAPI documentation is available at `http://localhost:5000/api-docs` after boot.
- Use the default admin credentials to hit protected endpoints, then spin up other roles via `/api/users`.



## Additional Notes
- Swagger is fully self-descriptive; once you log in via `/api/auth/login` with the seeded admin credentials you can click “Try it out,” copy the bearer token into the UI’s authorization modal, and exercise the RBAC-protected endpoints without leaving the browser.
- The user/record update flows reuse the same validation logic as creation, so any future frontend that “edits” records/users can pass the same schema structure listed in Swagger without extra helpers.

## Assumptions
1. All records belong to the authenticated user who created them; admins manage across users while viewers see their own data.
2. The dashboard trends endpoint returns a fixed number of months (default `6`) with zero-filled periods to keep charts predictable.
3. JWT secrets and admin credentials are safe to seed in development but must be rotated before any deployment.
