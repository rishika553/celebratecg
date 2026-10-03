# Supabase database connection

Both local and production applications use **Next.js → FastAPI → Supabase PostgreSQL**. The same SQLAlchemy models and Alembic migrations run in both environments; each environment supplies its own server-only `DATABASE_URL`. The local URL is stored only in the ignored `backend/.env`, and browser requests use `/api` through the Next.js backend rewrite.

Database initialization applies versioned Alembic migrations and the required category catalogue. It does not copy the old SQLite demo database or create demo accounts/venues. Existing PostgreSQL tables without recognized migration tracking stop automatic initialization.

From the repository root, initialize or verify the database:

```powershell
.\backend\.venv\Scripts\python.exe scripts/initialize-supabase.py
```

This checks TLS, disables demo use, applies migrations through the latest revision, seeds categories, checks row-level security/browser grants, and verifies account/venue/booking ORM writes in a rolled-back transaction. It then checks the actual API dependencies. Output excludes credentials.

Start the application with the existing `scripts/start-backend.ps1` and `scripts/start-frontend.ps1`. Open http://127.0.0.1:3000. With both running, verify the complete proxy path:

```powershell
.\backend\.venv\Scripts\python.exe scripts/verify-connected-site.py
```

The real catalogue initially has no venues. New customer registrations and vendor applications use Supabase; vendor/listing approval requires an administrator. Create a real administrator with `app.bootstrap --admin-email` and its private password prompt when ready. No default administrator password is installed.

Google sign-in, S3 image storage, payment processing and email delivery remain separate integrations. Database connectivity does not configure or enable them. A deployed frontend needs its own backend URL, and the deployed backend needs its own securely configured database environment variables.
