from datetime import timedelta
import pytest
from sqlalchemy.exc import OperationalError
from app.config import Settings
from app.db import get_db
from app.main import app
from app.models import Booking, now
from app.reservations import expire_holds


def test_readiness_database_failure_is_not_healthy(context):
    client = context['client']
    assert client.get('/api/ready').status_code == 200
    previous = app.dependency_overrides[get_db]

    class BrokenDatabase:
        def execute(self, statement):
            raise OperationalError('SELECT 1', {}, Exception('private connection details'))

    app.dependency_overrides[get_db] = lambda: BrokenDatabase()
    try:
        response = client.get('/api/ready')
        assert response.status_code == 503
        assert response.json() == {'status': 'unavailable'}
        assert response.headers['cache-control'] == 'no-store'
    finally:
        app.dependency_overrides[get_db] = previous


@pytest.mark.parametrize('origin', ['', '*', 'http://example.com', 'https://example.com/', 'https://example.com/path'])
def test_production_rejects_invalid_frontend_origins(origin):
    cfg = Settings(_env_file=None, app_env='production', demo_mode=False,
                   database_url='postgresql+psycopg://user:password@localhost/db',
                   jwt_secret='x' * 48, storage_backend='s3', allowed_origins=origin)
    with pytest.raises(RuntimeError, match='origin|ALLOWED_ORIGINS'):
        cfg.validate_runtime()


def test_production_accepts_exact_frontend_origins(monkeypatch):
    for key in ('AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_ENDPOINT_URL_S3', 'AWS_REGION'):
        monkeypatch.setenv(key, 'test-value')
    cfg = Settings(_env_file=None, app_env='production', demo_mode=False,
                   database_url='postgresql+psycopg://user:password@localhost/db',
                   jwt_secret='x' * 48, storage_backend='s3',
                   allowed_origins='https://celebratecg.vercel.app,https://example.com')
    cfg.validate_runtime()


def test_cleanup_is_repeatable_and_preserves_confirmed_and_active_holds(context):
    with context['sessions']() as db:
        records = []
        for index, (status, expiry) in enumerate([
            ('pending', now() - timedelta(minutes=1)),
            ('pending', now() + timedelta(minutes=10)),
            ('confirmed', now() - timedelta(minutes=1)),
        ]):
            booking = Booking(customer_id=context['users']['customer'], venue_id=context['venue_id'],
                              booking_date=(now() + timedelta(days=index + 1)).date(), guest_count=10,
                              base_amount=100, total_amount=100, status=status, expires_at=expiry)
            db.add(booking)
            records.append(booking)
        db.commit()
        assert expire_holds(db) == 1
        db.commit()
        assert expire_holds(db) == 0
        assert [item.status for item in records] == ['cancelled', 'pending', 'confirmed']
