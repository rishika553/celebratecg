from alembic import context
from app.db import engine


if context.is_offline_mode():
    raise RuntimeError('Run migrations online against a fresh PostgreSQL database.')
with engine.connect() as connection:
    context.configure(connection=connection)
    with context.begin_transaction():
        context.run_migrations()
