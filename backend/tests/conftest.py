import os
os.environ['JWT_SECRET'] = 'test-only-secret-that-is-longer-than-32-characters'
os.environ['DATABASE_URL'] = 'sqlite://'
os.environ['DEMO_MODE'] = 'false'
os.environ['RAZORPAY_KEY_SECRET'] = 'test_provider_secret'
os.environ['RAZORPAY_WEBHOOK_SECRET'] = 'test_webhook_secret'

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.auth import passwords
from app.db import Base, get_db
from app.main import app, login_attempts
from app.models import Category, User, Venue


@pytest.fixture
def context(tmp_path):
    engine = create_engine(f'sqlite:///{tmp_path / "test.db"}', connect_args={'check_same_thread': False, 'timeout': 20})
    Base.metadata.create_all(engine)
    sessions = sessionmaker(bind=engine, expire_on_commit=False)
    with sessions() as db:
        hashed = passwords.hash('TestPassword123!')
        users = {}
        for key, role in [('customer', 'customer'), ('other', 'customer'), ('vendor', 'vendor'), ('intruder', 'vendor'), ('admin', 'admin')]:
            user = User(name=key, email=f'{key}@example.com', role=role, password_hash=hashed, approval_status='approved')
            db.add(user)
            db.flush()
            users[key] = user.id
        category = Category(name='Lawns', slug='lawn', type='venue')
        db.add(category)
        db.flush()
        venue = Venue(vendor_id=users['vendor'], category_id=category.id, name='Test Garden', description='A beautiful test venue for celebrations.', location_text='Raipur', price_per_day=45000, max_guests=100, facilities=['Parking'], approval_status='approved')
        db.add(venue)
        db.commit()
        venue_id, category_id = venue.id, category.id
    def override():
        with sessions() as db:
            yield db
    app.dependency_overrides[get_db] = override
    login_attempts.clear()
    with TestClient(app) as client:
        yield {'client': client, 'sessions': sessions, 'venue_id': venue_id, 'category_id': category_id, 'users': users}
    app.dependency_overrides.clear()
    engine.dispose()


def login(client, key='customer'):
    response = client.post('/api/auth/login', json={'email': f'{key}@example.com', 'password': 'TestPassword123!'})
    assert response.status_code == 200, response.text
    return response
