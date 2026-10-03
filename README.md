# CelebrateCG

First working increment of the venue, services, and events marketplace described in `project.md`. Built with Next.js App Router, FastAPI, SQLAlchemy, and a Supabase-compatible PostgreSQL schema.

## What works now

- Responsive venue catalogue with city/name, category, date, capacity, and budget filters.
- Venue detail pages, availability checks, and 15-minute unpaid reservations.
- Email/password registration and login; Google sign-in through Supabase Auth; Argon2 password hashing; expiring HTTP-only JWT cookies; logout revokes existing sessions.
- Customer booking history and unpaid cancellation.
- Pending vendor registration, approved vendor listing creation/editing, and date blocking.
- Admin vendor/listing approval queues, platform counts, and late-payment review list.
- Razorpay order creation, Checkout integration, server-side signature/payment capture verification, and signed `payment.captured` webhook handling. Requires your credentials; no simulated payment confirmation.
- Server-authoritative prices, ownership checks, database protection against duplicate active venue reservations, and reservation expiry.
- Repeatable local sample data, PostgreSQL baseline migration, and automated API tests.

## Run on Windows

Prerequisites: Node.js 22+ and Python 3.12+. From the repository root:

```powershell
.\scripts\setup-local.ps1
```

If the Windows `py` launcher is broken, pass a working Python executable:

```powershell
.\scripts\setup-local.ps1 -Python 'C:\path\to\python.exe'
```

Setup creates a Python virtual environment, installs locked dependencies, and generates a random local JWT secret. On first run it creates `backend/.env` and asks you to add a Supabase PostgreSQL connection string; the next run applies the same Alembic migrations used in production. Existing `.env` files are preserved.

PostgreSQL is the only database used by the running application in both local and production environments. Use separate Supabase development and production databases to avoid exposing production data during development. To add fictional sample records to a development database, set `DEMO_MODE=true` and run `./scripts/setup-local.ps1 -SeedDemoData`.

Open two terminals from the project root:

```powershell
# Terminal 1
.\scripts\start-backend.ps1

# Terminal 2
.\scripts\start-frontend.ps1
```

Visit http://127.0.0.1:3000. API documentation: http://127.0.0.1:8000/docs.

Use the same hostname consistently during a session because cookies are host-specific.

Optional demo accounts after running setup with `-SeedDemoData` (password for each: `CelebrateDemo123!`):

| Account | Role |
| --- | --- |
| customer@example.com | Customer |
| vendor@example.com | Approved vendor |
| admin@example.com | Admin |

When explicitly seeded, the sample venues are fictional. The category-matched photographs are illustrative venue references; see [image sources](docs/image-sources.md) for original properties and attribution. Cormorant Garamond and DM Sans are bundled locally through Fontsource with system fallbacks. Neither implies a real venue partnership.

## Connect Supabase

1. Create a separate development Supabase project and obtain its PostgreSQL connection string. Production uses the same PostgreSQL schema and migrations with a different `DATABASE_URL`.
2. Update `backend/.env`: set `DATABASE_URL=postgresql+psycopg://...` (URL-encode password characters), keep SSL enabled using `?sslmode=require`, set `DEMO_MODE=false`, and retain a strong random `JWT_SECRET`.
3. For Google sign-in, enable the Google provider in Supabase Auth and copy the same project URL and publishable key into `backend/.env` as `SUPABASE_URL` / `SUPABASE_PUBLISHABLE_KEY` and into `frontend/.env.local` as `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Add `http://127.0.0.1:3000/auth/callback` to the Supabase redirect URLs for local development.
4. From `backend`, apply the migration to an **empty database**:

```powershell
.\.venv\Scripts\python.exe -m alembic upgrade head
.\.venv\Scripts\python.exe -m app.bootstrap --categories
.\.venv\Scripts\python.exe -m app.bootstrap --admin-email your-admin@example.com
```

The admin command prompts privately for a password. It never promotes an existing account. Production data and credentials are not included in this repository.

`schema.sql` is the database contract. `backend/migrations/sql/0001_initial.sql` is its initial immutable deployment snapshot. Do not run both manually against the same database. Future changes require a new Alembic revision and a corresponding contract update. Existing manually created databases need an audited baseline migration, not blindly stamping this revision.

Supabase direct connections are preferred for migrations and persistent servers when reachable; the session pooler supports IPv4-only environments. Tables have RLS enabled and browser Data API grants removed: this architecture authorizes requests through FastAPI, using an owner/privileged server database connection. Do not expose that connection string to the frontend. See https://supabase.com/docs/guides/database/connecting-to-postgres.

## Connect Razorpay test mode

Set these in `backend/.env`, then restart FastAPI:

```dotenv
RAZORPAY_KEY_ID=your_test_key_id
RAZORPAY_KEY_SECRET=your_test_key_secret
RAZORPAY_WEBHOOK_SECRET=your_independent_webhook_secret
```

Configure automatic payment capture in Razorpay. Register a reachable HTTPS `/api/webhooks/razorpay` endpoint for `payment.captured`. Razorpay cannot reach a plain localhost address. The UI's payment button remains disabled until keys are configured.

Checkout creates an order for the server-calculated amount in paise. Confirmation requires an authentic signature and a captured payment for the matching order, currency, and amount. The webhook provides recovery when the browser closes. Repeated captured notifications have no duplicate effect. Payments received after expiry/cancellation are recorded for manual refund review; they never reclaim a date reserved by another customer. Actual refund execution is not implemented yet.

## Verify

```powershell
# backend
.\.venv\Scripts\python.exe -m pytest -q

# frontend
npm.cmd run typecheck
npm.cmd run build
```

Tests use isolated, test-only SQLite databases and mocked payment provider calls; SQLite cannot be selected by a running development or production app. They cover concurrent reservation attempts, expiry, access controls, approval flow, forged/mismatched payments, duplicate notifications, late payments, and logout revocation. They do **not** replace PostgreSQL integration tests or a real Razorpay test-mode payment.

## Deployment preparation

- Follow [the Vercel + Render deployment guide](docs/deployment.md). The repository includes `frontend/vercel.json` and a root `render.yaml` for the API and scheduled reservation cleanup.
- Keep Vercel's Root Directory set to `frontend`; Render uses `backend`. The Blueprint runs migrations before API deployment and checks database readiness at `/api/ready`.
- Deploy the Next.js application with `BACKEND_URL` set to the reachable API URL **before building**; browser requests stay on `/api` through a Next.js rewrite.
- Run the backend with `uvicorn app.main:app --host 0.0.0.0 --port <platform-port>` and `APP_ENV=production`, `DEMO_MODE=false`, PostgreSQL, HTTPS, a unique JWT secret, and exact frontend `ALLOWED_ORIGINS`.
- Run migrations once as a release step. Never auto-create production tables at startup.
- Replace the single-process login limiter with shared throttling; add signup/payment rate limits, email verification/reset, audit logs, monitoring, backups, and full PostgreSQL concurrency/UAT checks before launch.

## Remaining scope

This is the first venue milestone, not the finished marketplace. Next increments are:

1. Email verification/password reset and Resend confirmations with durable retry handling.
2. Generalized services marketplace and category administration.
3. Events, ticket tiers, inventory, and ticket confirmations.
4. Refund execution, deposits/balance payments, invoices, commission snapshots, earnings, and completion workflows.
5. Vendor portfolios, managed image uploads, reviews, wishlist, offers, and Google Maps.
6. Production hardening, PostgreSQL integration tests, real payment UAT, and deployment.

Current venue booking rules: one exclusive venue per calendar day (Asia/Kolkata), full payment only, automatic confirmation after capture, and manual review for paid cancellation. Admin approval is required for new/edited listings; editing temporarily removes a listing from the public catalogue. Backend ORM classes currently cover the venue milestone; the SQL baseline retains the future service/event entities from the specification.
