"""Read-only database connectivity check; never prints connection credentials."""
from pathlib import Path
import sys
import re
from urllib.parse import parse_qs, urlsplit

root = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(root / 'backend'))
from app.config import Settings
from sqlalchemy import create_engine, inspect, text

cfg = Settings(_env_file=root / 'backend/.env')
try:
    url = urlsplit(cfg.database_url)
    if '--normalize' in sys.argv and url.scheme in ('postgres', 'postgresql', 'postgresql+psycopg'):
        query = url.query
        if 'sslmode' not in parse_qs(query):
            query += ('&' if query else '') + 'sslmode=require'
        normalized = url._replace(scheme='postgresql+psycopg', query=query).geturl()
        env_path = root / 'backend/.env'
        content = env_path.read_text(encoding='utf-8')
        content, count = re.subn(r'^DATABASE_URL=.*$', lambda _: 'DATABASE_URL=' + normalized, content, flags=re.M)
        if count != 1:
            print('Expected one DATABASE_URL entry; no changes made.'); sys.exit(1)
        env_path.write_text(content, encoding='utf-8')
        cfg = Settings(_env_file=env_path)
        url = urlsplit(cfg.database_url)
        print('Updated database driver prefix/TLS configuration; credentials preserved.')
    print('PostgreSQL psycopg URL:', url.scheme == 'postgresql+psycopg')
    print('Password present:', bool(url.password))
    print('Session pooler port:', url.port == 5432)
    print('Database TLS configured:', parse_qs(url.query).get('sslmode', [''])[0] in ('require', 'verify-ca', 'verify-full'))
    print('Demo mode disabled:', not cfg.demo_mode)
    if url.scheme != 'postgresql+psycopg':
        print('Result: Set DATABASE_URL to the postgresql+psycopg connection string.'); sys.exit(1)
    engine = create_engine(cfg.database_url, connect_args={'connect_timeout': 10})
    with engine.connect() as connection:
        connection.execute(text('SELECT 1'))
        print('Database connection: successful')
        tables = inspect(connection).get_table_names(schema='public')
        print('Public table names:', ', '.join(sorted(tables)) or '(empty)')
        if 'alembic_version' in tables:
            print('Migration revision:', connection.execute(text('SELECT version_num FROM public.alembic_version')).scalar())
    engine.dispose()
except Exception as exc:
    message = str(exc).lower()
    reason = ('authentication failed' if 'password authentication failed' in message else
              'host could not be resolved' if 'resolve' in message or 'getaddrinfo' in message else
              'connection timed out' if 'timeout' in message or 'timed out' in message else
              'TLS configuration failed' if 'ssl' in message else 'connection/configuration error')
    print(f'Database connection: failed ({reason}; {type(exc).__name__}). Credentials omitted.')
    sys.exit(1)
