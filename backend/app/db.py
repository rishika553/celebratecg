from sqlalchemy import create_engine, event
from sqlalchemy.orm import DeclarativeBase, sessionmaker
from .config import settings


class Base(DeclarativeBase):
    pass


cfg = settings()
url = cfg.database_url
test_sqlite = cfg.app_env == 'test' and url.startswith('sqlite')
if not test_sqlite and not url.startswith('postgresql+psycopg://'):
    raise RuntimeError('Set DATABASE_URL to a PostgreSQL psycopg connection string before starting the application.')
engine = create_engine(
    url, pool_pre_ping=True,
    connect_args={'check_same_thread': False, 'timeout': 20} if test_sqlite else {'connect_timeout': 10},
    **({} if test_sqlite else {'pool_size': 5, 'max_overflow': 5, 'pool_timeout': 10, 'pool_recycle': 300}),
)
if test_sqlite:
    @event.listens_for(engine, 'connect')
    def sqlite_foreign_keys(connection, _):
        connection.execute('PRAGMA foreign_keys=ON')

SessionLocal = sessionmaker(bind=engine, expire_on_commit=False)


def get_db():
    with SessionLocal() as db:
        yield db
