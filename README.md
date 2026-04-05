# Finance Data Processing and Access Control Backend

This project implements the backend requirements described in the Zorvyn assignment: a finance dashboard API with role-based access control, transactional record management, and summary analytics.

## Key highlights
- **Structured RBAC**—`ADMIN`, `ANALYST`, and `VIEWER` roles control who can mutate data, read analytics, or just view their records.
- **Prisma + PostgreSQL** for persistence, including migrations and a development seed for the default admin user.
- **Express + Zod** for clean routing, validation, and sensible error payloads.
- **Utility endpoints** for dashboard summaries and trends plus Swagger documentation at `/api-docs`.

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
4. **Run migrations (first setup)**
   ```bash
   npx prisma migrate dev --name init
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

## Access control and validation
- **Roles** are enforced via middleware (`authenticate` + `authorize`). Admins manage data, analysts read records and analytics, viewers can only read their data.
- **Validation** is powered by Zod schemas per route. Invalid inputs return `422` with granular issue details.
- **Errors** are propagated through a centralized middleware that returns `{ status: "error", message, errors? }`.
- **Rate limiting** is enabled globally (100 requests / 15 minutes) to keep the assessment backend safe.

## Database & seeding
- The Prisma schema defines `User` and `Record` models plus enums for roles, statuses, and record types.
- Run `npx prisma migrate dev --name init` to create the schema and `npx prisma generate` to refresh the client.
- On server start, the backend ensures an `ADMIN` user exists using `ADMIN_EMAIL` and `ADMIN_PASSWORD` from `.env`. Change those before production use.

## Running & verifying
- Start the server: `npm start`.
- Swagger/OpenAPI documentation is available at `http://localhost:5000/api-docs` after boot.
- Use the default admin credentials to hit protected endpoints, then spin up other roles via `/api/users`.

## Assumptions
1. All records belong to the authenticated user who created them; admins manage across users while viewers see their own data.
2. The dashboard trends endpoint returns a fixed number of months (default `6`) with zero-filled periods to keep charts predictable.
3. JWT secrets and admin credentials are safe to seed in development but must be rotated before any deployment.

If you need any additional analytics (category splits, rolling averages, etc.), let me know and I can extend the summary service.
