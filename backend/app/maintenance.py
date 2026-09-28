"""Run with `python -m app.maintenance`; exits after one cleanup pass."""
import logging
from .config import settings
from .db import SessionLocal, engine
from .reservations import expire_holds


def main():
    logging.basicConfig(level=logging.INFO)
    cfg = settings()
    if cfg.app_env == 'production' and (cfg.demo_mode or not cfg.database_url.startswith('postgresql+psycopg://')):
        raise RuntimeError('Production maintenance requires PostgreSQL and DEMO_MODE=false.')
    try:
        with SessionLocal.begin() as db:
            count = expire_holds(db)
        logging.info('Expired %s unpaid reservations.', count)
    finally:
        engine.dispose()


if __name__ == '__main__':
    main()
