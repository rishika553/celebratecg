"""Initialize the configured Supabase database without demo accounts or credential output."""
from pathlib import Path
import os
import sys
from urllib.parse import parse_qs, urlsplit

root = Path(__file__).resolve().parents[1]
os.chdir(root / 'backend')
sys.path.insert(0, str(root / 'backend'))

def main():
    from app.config import settings
    from app.db import engine, SessionLocal
    from sqlalchemy import inspect, select, text
    from alembic import command
    from alembic.config import Config
    from alembic.script import ScriptDirectory
    from app.bootstrap import seed_categories
    from app.models import Booking, Category, User, Venue, now

    cfg = settings()
    url = urlsplit(cfg.database_url)
    if url.scheme != 'postgresql+psycopg' or cfg.demo_mode:
        raise RuntimeError('PostgreSQL with DEMO_MODE=false is required.')
    if parse_qs(url.query).get('sslmode', [''])[0] not in ('require', 'verify-ca', 'verify-full'):
        raise RuntimeError('Database TLS is required.')
    cfg.validate_runtime()
    config = Config(str(root / 'backend/alembic.ini'))
    known_revisions = {r.revision for r in ScriptDirectory.from_config(config).walk_revisions()}
    with engine.connect() as connection:
        tables = inspect(connection).get_table_names(schema='public')
        if tables and 'alembic_version' not in tables:
            raise RuntimeError('Existing unmanaged public tables found; refusing automatic initialization.')
        if 'alembic_version' in tables:
            revisions = set(connection.execute(text('SELECT version_num FROM alembic_version')).scalars())
            if revisions - known_revisions:
                raise RuntimeError('Unknown database migration revision; refusing changes.')
    print('Database preflight passed; applying versioned migrations.')
    command.upgrade(config, 'head')
    with SessionLocal() as db:
        seed_categories(db)
        db.commit()
        categories = db.scalars(select(Category)).all()
        print('Required categories initialized:', len(categories))
    with engine.connect() as connection:
        print('Migration revision:', connection.execute(text('SELECT version_num FROM alembic_version')).scalar())
        print('Public tables:', len(inspect(connection).get_table_names(schema='public')))
        names = connection.execute(text("SELECT relname FROM pg_class JOIN pg_namespace ON pg_namespace.oid = relnamespace WHERE nspname='public' AND relkind='r' AND relname <> 'alembic_version' AND NOT relrowsecurity")).scalars().all()
        if names:
            raise RuntimeError('Some application tables do not have row-level security.')
        print('Application table row-level security: enabled')
        for role in ('anon', 'authenticated'):
            unsafe = connection.execute(text("SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename <> 'alembic_version' AND has_table_privilege(:role, quote_ident(schemaname)||'.'||quote_ident(tablename), 'SELECT,INSERT,UPDATE,DELETE')"), {'role': role}).scalars().all()
            if unsafe:
                raise RuntimeError('Browser database role has application table privileges.')
        print('Browser roles: no direct application table privileges')
    # Exercise actual PostgreSQL ORM writes in a transaction that is always rolled back.
    from app.auth import passwords
    from datetime import timedelta
    from uuid import uuid4
    import secrets
    with SessionLocal() as db:
        try:
            password_hash = passwords.hash(secrets.token_urlsafe(32))
            customer = User(name='Connection check', email=f'connection-{uuid4().hex}@example.invalid', password_hash=password_hash, role='customer')
            vendor = User(name='Connection check host', email=f'connection-{uuid4().hex}@example.invalid', password_hash=password_hash, role='vendor', approval_status='approved')
            db.add_all([customer, vendor]); db.flush()
            category = db.scalar(select(Category).where(Category.type == 'venue'))
            venue = Venue(vendor_id=vendor.id, category_id=category.id, name='Temporary connection check', description='Temporary transaction for schema verification.', location_text='Raipur', price_per_day=100, max_guests=10, facilities=[], approval_status='approved')
            db.add(venue); db.flush()
            booking = Booking(customer_id=customer.id, venue_id=venue.id, booking_date=(now() + timedelta(days=1)).date(), guest_count=2, base_amount=100, total_amount=100, expires_at=now() + timedelta(minutes=15))
            db.add(booking); db.flush()
            print('PostgreSQL account, venue and booking writes: verified')
        finally:
            db.rollback()
    print('Temporary verification records: rolled back')
    # Verify the actual API dependencies use this database, without creating users.
    from fastapi.testclient import TestClient
    from app.main import app
    with TestClient(app) as client:
        for path in ('/api/ready', '/api/categories', '/api/cities', '/api/venues'):
            response = client.get(path)
            if response.status_code != 200:
                raise RuntimeError('API database verification failed: ' + path)
            print('API verification:', path, response.status_code)
        if client.get('/api/auth/me').status_code != 401:
            raise RuntimeError('Anonymous account access must require sign-in.')
    print('Database setup complete. No demo accounts or fictional venues were created.')

if __name__ == '__main__':
    try:
        main()
    except Exception as exc:
        if isinstance(exc, RuntimeError):
            print('Setup stopped:', str(exc))
        else:
            original = getattr(exc, 'orig', None)
            print('Setup stopped:', type(exc).__name__, 'database code:', getattr(original, 'sqlstate', None) or 'unavailable', '(credentials omitted)')
        sys.exit(1)
