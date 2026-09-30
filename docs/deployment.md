# Deploy CelebrateCG to Vercel and Render

The existing `frontend/` and `backend/` directories deploy independently from the same repository. No folder move or authentication migration is required.

```text
Browser -> Vercel Next.js /api/* rewrite -> Render FastAPI -> Supabase PostgreSQL
                                                |-------> Supabase Storage (S3)
Razorpay --------------------------------------> /api/webhooks/razorpay
Render scheduled job --------------------------> expired reservation cleanup
```

The app uses FastAPI-managed, HTTP-only JWT cookies for its application session. Email/password auth is handled by FastAPI, and Google sign-in is verified through Supabase Auth before the backend creates the same application cookie. Supabase supplies PostgreSQL, Auth, and S3-compatible storage. Resend, password reset, and custom auth-email flows are not implemented yet.

## 1. Prepare Supabase

Use separate staging and production projects. Obtain a PostgreSQL direct or **session pooler** connection string from the Connect panel. Use the session pooler if the deployment cannot reach the direct IPv6 address; do not use the transaction pooler for this setup.

Change the scheme to `postgresql+psycopg://` and require SSL:

```dotenv
DATABASE_URL=postgresql+psycopg://USER:URL_ENCODED_PASSWORD@HOST:5432/postgres?sslmode=require
```

Copy the actual host, username, and port from Supabase. URL-encode special characters in the password. Do not put this value in Vercel or a `NEXT_PUBLIC_` variable.

Enable the Google provider in Supabase Auth. Add these redirect URLs in Supabase before testing sign-in:

```text
http://127.0.0.1:3000/auth/callback
https://YOUR-VERCEL-DOMAIN/auth/callback
```

Copy the project URL and publishable key. The publishable key is safe for the browser, but the service-role key must never be exposed or used by this frontend flow.

Create a private Storage bucket named `venue-images`. Generate S3 access credentials in Supabase and copy its S3 endpoint and region. These are S3 access credentials, not the publishable/anon key or service-role JWT. The existing backend reads/writes objects and serves public venue images through `/api/media/...`; the bucket does not need public access. Existing local uploads must be copied to the bucket with their original object keys before switching an existing installation.

## 2. Reserve the Vercel project URL

Import the repository into Vercel with **Root Directory = `frontend`** and framework **Next.js**. Select Node.js 22.x. Note the stable project domain or intended custom domain so Render can allow that exact origin. An initial build will fail until `BACKEND_URL` is supplied; complete the Render setup next and redeploy Vercel afterward.

## 3. Deploy the Render backend

Create a Render Blueprint from the repository's root `render.yaml`. It defines a web service and a five-minute reservation expiry cron job, both on paid compute. Review the selected plans before applying the Blueprint. No Render resources are created by committing these files.

The default region is Singapore; choose a region close to your Supabase project before creating services. Render cannot change a service's region in place.

Set the prompted environment values:

| Variable | Value |
| --- | --- |
| `DATABASE_URL` | Supabase SQLAlchemy connection string above |
| `ALLOWED_ORIGINS` | Exact frontend origin, e.g. `https://celebratecg.vercel.app`; comma-separated if multiple |
| `AWS_ACCESS_KEY_ID` | Supabase S3 access key ID |
| `AWS_SECRET_ACCESS_KEY` | Supabase S3 secret |
| `AWS_ENDPOINT_URL_S3` | S3 endpoint copied from Supabase |
| `AWS_REGION` | Storage region copied from Supabase |
| `SUPABASE_URL` | Supabase project URL, e.g. `https://PROJECT.supabase.co` |
| `SUPABASE_PUBLISHABLE_KEY` | Supabase publishable key used to validate Google sessions |

Origins must use HTTPS and have no path, wildcard, or trailing slash. Use your actual assigned domain, not the example. Add the custom domain and `www` origin if both serve the app.

The Blueprint sets production mode, disables demo mode, generates a JWT secret, and selects S3 storage. Preserve the JWT secret across deploys; changing it signs everyone out. No local filesystem uploads or SQLite are used in production.

Render runs these commands from `backend/`:

```sh
pip install -r requirements.lock.txt
# Separate pre-deploy step; failure stops the release:
python -m alembic upgrade head
# Start command:
python -m uvicorn app.main:app --host 0.0.0.0 --port $PORT --workers 1
```

The Blueprint uses paid compute for the release workflow. If configuring a free web service manually, check the platform's current limitations and run migrations from a trusted environment before starting the release; never move production migrations into application startup. The cron job is separately billed.

For a fresh database, Alembic installs the baseline and subsequent revisions. Do not run `schema.sql` as well. For an existing database, inspect its migration history before deploying; do not blindly stamp or recreate it. Back up existing production data before migrations. Only one service should own migrations, and future migrations must remain compatible with the previous app during rolling releases.

Once the API is healthy, initialize categories and the administrator in the Render Shell:

```sh
python -m app.bootstrap --categories
python -m app.bootstrap --admin-email your-admin@example.com
```

The administrator command prompts privately for a password and refuses to overwrite an existing account. Never run `--demo` in production.

## 4. Deploy the Vercel frontend

Set this server-only Vercel environment variable before building:

```dotenv
BACKEND_URL=https://YOUR-API.onrender.com
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY
```

Use the Render service origin only, without `/api`. `frontend/vercel.json` uses `npm ci` and `npm run build`; leave the output directory at the Next.js default. Rebuild after changing `BACKEND_URL`, because rewrites are resolved during the build.

Browser requests remain on the Vercel origin at `/api/*`; Next.js proxies them to Render. The backend's host-only `Secure; HttpOnly; SameSite=Lax` cookies are returned through that origin. Keep the existing relative API client. Direct browser fetches to Render would require a different cookie/CORS design.

The backend validates mutation request origins against `ALLOWED_ORIGINS`. A separate permissive CORS policy is unnecessary with this same-origin proxy. Do not allow `*.vercel.app`. For previews, use a staging backend/database and allow only trusted exact preview domains (prefer a stable staging domain). Set preview `BACKEND_URL` separately from production.

## 5. Configure integrations

### Razorpay

Set these only on the Render API service:

```dotenv
RAZORPAY_KEY_ID=YOUR_RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET=YOUR_RAZORPAY_KEY_SECRET
RAZORPAY_WEBHOOK_SECRET=YOUR_SEPARATE_WEBHOOK_SECRET
```

Start with test-mode keys. Configure automatic capture and the `payment.captured` webhook at:

```text
https://YOUR-API.onrender.com/api/webhooks/razorpay
```

Use the direct Render endpoint, not the frontend proxy. Test a real sandbox checkout, signature verification, duplicate delivery, and browser closure after capture. Checkout confirmation uses the existing client flow; no additional payment redirect URL is required. Refund execution and periodic provider reconciliation are not implemented; late captures remain in the manual review queue.

### Resend and Google Maps

Resend is not wired into this increment. Adding an unused `RESEND_API_KEY` would not enable notifications. A future email module should add that secret, a verified sender, and a durable outbox/worker together. There are no auth email callback URLs in the current custom-auth implementation.

The existing location component uses a Google Maps embed and directions links without a configured API key. No Maps environment variable is required by the current code. An authenticated Maps API integration would be a separate feature.

## 6. Background processing

The Render cron job runs `python -m app.maintenance` every five minutes. It uses the API's database URL, cancels only expired pending reservations, commits, and exits. It is safe to repeat; confirmed bookings are untouched. The request-time expiry checks remain active, so scheduling delay does not extend the checkout deadline.

The first cron invocation may precede the API's first migration and fail because tables are absent. After the API release completes, trigger a run and confirm success. Alert on subsequent failures. Do not run a scheduler inside each Uvicorn process. Email retries and payment reconciliation will need their own durable job implementation later.

## 7. Verify the deployment

1. Render `/api/health` returns status and feature flags; `/api/ready` returns 200 only when a database query succeeds. Render uses `/api/ready` as its health check. This is connectivity readiness, not verification of every table or provider.
2. Vercel `/api/health` reaches the same backend through the rewrite.
3. Register with email/password, sign in with Google, reload, and log out through the frontend; confirm cookies are secure and login persists across navigation. Confirm the Google user appears in Supabase Auth and in the backend `users` table.
4. Create/approve a real vendor and venue. Upload an image and confirm it survives a backend redeploy.
5. Reserve a venue, verify a second overlapping reservation is rejected, and verify expiry via the scheduled job.
6. Complete a Razorpay test payment and replay its webhook; the booking must confirm once.
7. Check API and scheduled-job logs and both platforms' build logs.

Local checks, run from the respective directories:

```sh
# backend (with its virtual environment active)
python -m pytest -q
# frontend
npm run typecheck
npm run build
```

The API test suite uses SQLite and mocked payment calls. A successful local build is not a live Vercel/Render deployment or a PostgreSQL integration test. Before public launch, complete PostgreSQL/payment UAT and the existing README's remaining production-hardening work, including shared rate limiting and account recovery. The current login limiter is per process; the Blueprint uses one API worker.

## Troubleshooting and rollback

- **Vercel build says BACKEND_URL is missing:** set it in the correct Vercel environment and rebuild.
- **403 on login/signup:** check the browser's exact Origin against Render's `ALLOWED_ORIGINS`.
- **502 through Vercel:** check the Render service URL and health, then rebuild after fixing the destination.
- **Backend fails startup:** check production variables, PostgreSQL driver scheme, and S3 credentials.
- **Images fail:** verify the bucket exists and S3 endpoint/region/keys match that project.
- **Database connection fails:** check network access, session pooler credentials, SSL, and password encoding.
- **Migration fails:** inspect the release logs and current revision; do not stamp over the failure.

Rollback application code using the platforms' previous deployment controls only when the database remains compatible. Do not automatically downgrade production migrations or erase data. Restore from a tested backup when a reviewed recovery procedure requires it.

## Platform references

- [Vercel monorepos and project roots](https://vercel.com/docs/monorepos)
- [Render Blueprint fields](https://render.com/docs/blueprint-spec)
- [Render scheduled jobs and billing](https://render.com/docs/cronjobs)
- [Supabase S3 credentials](https://supabase.com/docs/guides/storage/s3/authentication)
