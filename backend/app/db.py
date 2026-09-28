from sqlalchemy import create_engine, event
from sqlalchemy.orm import DeclarativeBase, sessionmaker
from .config import settings


class Base(DeclarativeBase):
    pass


url = settings().database_url
engine = create_engine(
    url, pool_pre_ping=True,
    connect_args={'check_same_thread': False, 'timeout': 20} if url.startswith('sqlite') else {'connect_timeout': 10},
    **({} if url.startswith('sqlite') else {'pool_size': 5, 'max_overflow': 5, 'pool_timeout': 10, 'pool_recycle': 300}),
)
if url.startswith('sqlite'):
    @event.listens_for(engine, 'connect')
    def sqlite_foreign_keys(connection, _):
        connection.execute('PRAGMA foreign_keys=ON')

SessionLocal = sessionmaker(bind=engine, expire_on_commit=False)


def get_db():
    with SessionLocal() as db:
        yield db
