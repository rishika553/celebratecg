from concurrent.futures import ThreadPoolExecutor
from datetime import date, timedelta
import hashlib
import hmac
import json
from fastapi.testclient import TestClient
from sqlalchemy import select
from app.main import app
from app.models import Booking, Offer, Payment, User, Venue, now
from conftest import login


def payload(ctx, **changes):
    return {'venue_id': ctx['venue_id'], 'booking_date': str(date.today() + timedelta(days=10)), 'guest_count': 40, **changes}


def reserve(ctx):
    login(ctx['client'])
    response = ctx['client'].post('/api/bookings', json=payload(ctx))
    assert response.status_code == 201, response.text
    return response.json()


def test_signup_cannot_escalate_and_vendor_requires_approval(context):
    client = context['client']
    base = {'name': 'New Vendor', 'email': 'new@example.com', 'password': 'Password1234!'}
    assert client.post('/api/auth/signup', json={**base, 'role': 'admin'}).status_code == 422
    result = client.post('/api/auth/signup', json={**base, 'role': 'vendor'})
    assert result.status_code == 201
    assert result.json()['approval_status'] == 'pending'
    assert client.get('/api/vendor/venues').status_code == 403
    assert client.get('/api/admin/overview').status_code == 403


def test_login_cookie_and_logout_revoke_token(context):
    client = context['client']
    response = login(client)
    assert 'HttpOnly' in response.headers['set-cookie']
    token = client.cookies.get('cg_session')
    assert client.post('/api/auth/logout').status_code == 200
    client.cookies.set('cg_session', token)
    assert client.get('/api/auth/me').status_code == 401


def test_pending_listings_hidden_and_filters_work(context):
    client = context['client']
    assert len(client.get('/api/venues?q=raipur&guests=40').json()) == 1
    assert client.get('/api/venues?guests=200').json() == []
    assert client.get('/api/venues?max_price=100').json() == []
    with context['sessions']() as db:
        db.get(Venue, context['venue_id']).approval_status = 'pending'
        db.commit()
    assert client.get('/api/venues').json() == []
    assert client.get(f'/api/venues/{context["venue_id"]}').status_code == 404


def test_customer_favourites_are_private_idempotent_and_removable(context):
    client = context['client']
    login(client)
    venue_path = f'/api/favourites/{context["venue_id"]}'
    for _ in range(2):
        saved = client.post(venue_path)
        assert saved.status_code == 201
        assert saved.json()['saved'] is True
    assert client.get('/api/favourites/ids').json() == [context['venue_id']]
    favourites = client.get('/api/favourites').json()
    assert [venue['id'] for venue in favourites] == [context['venue_id']]

    login(client, 'other')
    assert client.get('/api/favourites').json() == []
    assert client.delete(venue_path).json()['saved'] is False

    login(client)
    assert client.get('/api/favourites/ids').json() == [context['venue_id']]
    assert client.delete(venue_path).status_code == 200
    assert client.get('/api/favourites').json() == []


def test_only_customers_can_save_public_venues(context):
    client = context['client']
    login(client, 'vendor')
    assert client.post(f'/api/favourites/{context["venue_id"]}').status_code == 403
    login(client)
    with context['sessions']() as db:
        db.get(Venue, context['venue_id']).approval_status = 'pending'
        db.commit()
    assert client.post(f'/api/favourites/{context["venue_id"]}').status_code == 404


def test_server_price_capacity_and_duplicate_reservation(context):
    first = reserve(context)
    assert first['total_amount'] == '45000.00'
    client = context['client']
    assert client.post('/api/bookings', json=payload(context)).status_code == 409
    assert client.post('/api/bookings', json=payload(context, guest_count=101)).status_code == 422
    assert client.post('/api/bookings', json=payload(context, total_amount=1)).status_code == 422
    assert client.post('/api/bookings', json=payload(context, booking_date='2020-01-01')).status_code == 422


def offer_payload(**changes):
    moment = now()
    return {
        'code': 'WELCOME10', 'name': 'Welcome offer', 'discount_type': 'percentage', 'discount_value': 10,
        'starts_at': (moment - timedelta(hours=1)).isoformat(), 'expires_at': (moment + timedelta(days=5)).isoformat(),
        'minimum_booking_amount': 10000, 'usage_limit': 1, 'is_active': True, **changes,
    }


def test_admin_offer_is_validated_and_snapshotted_on_booking(context):
    client = context['client']
    login(client, 'admin')
    created = client.post('/api/admin/offers', json=offer_payload())
    assert created.status_code == 201, created.text
    login(client)
    validated = client.post('/api/offers/validate', json={'venue_id': context['venue_id'], 'code': 'welcome10'})
    assert validated.status_code == 200
    assert validated.json()['discount_amount'] == '4500.00'
    booking = client.post('/api/bookings', json=payload(context, offer_code='welcome10'))
    assert booking.status_code == 201, booking.text
    result = booking.json()
    assert result['base_amount'] == '45000.00'
    assert result['discount_amount'] == '4500.00'
    assert result['total_amount'] == '40500.00'
    assert result['offer_code'] == 'WELCOME10'
    with context['sessions']() as db:
        saved = db.get(Booking, result['id'])
        assert saved.offer_id is not None
        assert db.get(Offer, saved.offer_id).times_used == 1
    login(client, 'other')
    limited = client.post('/api/bookings', json=payload(context, booking_date=str(date.today() + timedelta(days=11)), offer_code='WELCOME10'))
    assert limited.status_code == 422
    assert 'usage limit' in limited.json()['detail']


def test_admin_can_edit_activate_and_expire_fixed_offer(context):
    client = context['client']
    login(client, 'admin')
    created = client.post('/api/admin/offers', json=offer_payload(
        code='SAVE5000', discount_type='fixed', discount_value=5000, minimum_booking_amount=50000,
        usage_limit=None, is_active=False,
    )).json()
    login(client)
    validation = {'venue_id': context['venue_id'], 'code': 'SAVE5000'}
    assert client.post('/api/offers/validate', json=validation).status_code == 422
    login(client, 'admin')
    assert client.post(f'/api/admin/offers/{created["id"]}/activate').status_code == 200
    login(client)
    assert 'minimum booking amount' in client.post('/api/offers/validate', json=validation).json()['detail']
    login(client, 'admin')
    updated = client.put(f'/api/admin/offers/{created["id"]}', json=offer_payload(
        code='SAVE5000', discount_type='fixed', discount_value=5000, minimum_booking_amount=40000,
        usage_limit=None, is_active=True,
    ))
    assert updated.status_code == 200, updated.text
    login(client)
    assert client.post('/api/offers/validate', json=validation).json()['final_amount'] == '40000.00'
    login(client, 'admin')
    assert client.post(f'/api/admin/offers/{created["id"]}/expire').json()['status'] == 'inactive'
    login(client)
    assert client.post('/api/offers/validate', json=validation).status_code == 422


def test_concurrent_customers_cannot_double_book(context):
    cookies = []
    for key in ['customer', 'other']:
        with TestClient(app) as client:
            login(client, key)
            cookies.append(client.cookies.get('cg_session'))
    def book(token):
        with TestClient(app) as client:
            client.cookies.set('cg_session', token)
            return client.post('/api/bookings', json=payload(context)).status_code
    with ThreadPoolExecutor(max_workers=2) as pool:
        statuses = list(pool.map(book, cookies))
    assert sorted(statuses) == [201, 409]


def test_expired_hold_releases_date(context):
    booking = reserve(context)
    with context['sessions']() as db:
        db.get(Booking, booking['id']).expires_at = now() - timedelta(minutes=1)
        db.commit()
    assert context['client'].post('/api/bookings', json=payload(context)).status_code == 201


def test_other_customer_cannot_cancel_booking(context):
    booking = reserve(context)
    login(context['client'], 'other')
    assert context['client'].get('/api/bookings').json() == []
    assert context['client'].post(f'/api/bookings/{booking["id"]}/cancel').status_code == 404


def test_vendor_cannot_edit_someone_elses_venue(context):
    client = context['client']
    login(client, 'intruder')
    body = {'category_id': context['category_id'], 'name': 'Stolen Venue', 'description': 'A description long enough to validate.', 'location_text': 'Raipur', 'price_per_day': 100, 'max_guests': 5}
    assert client.put(f'/api/vendor/venues/{context["venue_id"]}', json=body).status_code == 404
    assert client.get('/api/vendor/venues').json() == []


def test_blocked_availability_prevents_booking(context):
    client = context['client']
    login(client, 'vendor')
    assert client.put(f'/api/vendor/venues/{context["venue_id"]}/availability', json={'date': payload(context)['booking_date'], 'is_available': False}).status_code == 200
    login(client)
    assert client.post('/api/bookings', json=payload(context)).status_code == 409


def test_active_reservation_cannot_be_blocked(context):
    reserve(context)
    login(context['client'], 'vendor')
    assert context['client'].put(f'/api/vendor/venues/{context["venue_id"]}/availability', json={'date': payload(context)['booking_date'], 'is_available': False}).status_code == 409


def test_vendor_admin_customer_approval_loop(context):
    client = context['client']
    login(client, 'vendor')
    result = client.post('/api/vendor/venues', json={'category_id': context['category_id'], 'name': 'New Venue', 'description': 'A new venue for weddings and celebrations.', 'location_text': 'Durg', 'price_per_day': 10000, 'max_guests': 50})
    assert result.status_code == 201
    venue_id = result.json()['id']
    assert client.get(f'/api/venues/{venue_id}').status_code == 404
    login(client, 'admin')
    assert client.post(f'/api/admin/venues/{venue_id}/approval', json={'status': 'approved'}).status_code == 200
    login(client)
    assert client.post('/api/bookings', json=payload(context, venue_id=venue_id)).status_code == 201


def test_vendor_photo_upload_order_remove_and_reapproval(context):
    client = context['client']
    login(client, 'vendor')
    files = [
        ('files', ('garden.png', b'\x89PNG\r\n\x1a\nphoto-one', 'image/png')),
        ('files', ('hall.webp', b'RIFF\x08\x00\x00\x00WEBPphoto-two', 'image/webp')),
    ]
    uploaded = client.post(f'/api/vendor/venues/{context["venue_id"]}/photos', files=files)
    assert uploaded.status_code == 201, uploaded.text
    venue = uploaded.json()
    assert venue['approval_status'] == 'pending'
    assert len(venue['photo_items']) == 2
    assert all(photo['url'].startswith('/api/media/venues/') for photo in venue['photo_items'])
    assert client.get(venue['photo_items'][0]['url']).status_code == 200
    assert client.get(f'/api/venues/{context["venue_id"]}').status_code == 404

    reversed_ids = [photo['id'] for photo in reversed(venue['photo_items'])]
    ordered = client.put(f'/api/vendor/venues/{context["venue_id"]}/photos/order', json={'photo_ids': reversed_ids})
    assert ordered.status_code == 200
    assert [photo['id'] for photo in ordered.json()['photo_items']] == reversed_ids

    removed = client.delete(f'/api/vendor/venues/{context["venue_id"]}/photos/{reversed_ids[0]}')
    assert removed.status_code == 200
    assert len(removed.json()['photo_items']) == 1


def test_photo_upload_rejects_invalid_content_and_wrong_owner(context):
    client = context['client']
    login(client, 'vendor')
    invalid = client.post(f'/api/vendor/venues/{context["venue_id"]}/photos', files={'files': ('fake.jpg', b'not-an-image', 'image/jpeg')})
    assert invalid.status_code == 422
    login(client, 'intruder')
    forbidden = client.post(f'/api/vendor/venues/{context["venue_id"]}/photos', files={'files': ('photo.png', b'\x89PNG\r\n\x1a\nvalid', 'image/png')})
    assert forbidden.status_code == 404


def add_payment(context, booking_id):
    with context['sessions']() as db:
        payment = Payment(booking_id=booking_id, razorpay_order_id='order_test', amount=45000)
        db.add(payment)
        db.commit()
    return {'id': 'pay_test', 'order_id': 'order_test', 'amount': 4500000, 'currency': 'INR', 'status': 'captured'}


def send_webhook(client, entity, signature=None):
    raw = json.dumps({'event': 'payment.captured', 'payload': {'payment': {'entity': entity}}}).encode()
    signature = signature or hmac.new(b'test_webhook_secret', raw, hashlib.sha256).hexdigest()
    return client.post('/api/webhooks/razorpay', content=raw, headers={'x-razorpay-signature': signature, 'content-type': 'application/json'})


def test_duplicate_webhook_is_idempotent(context):
    booking = reserve(context)
    entity = add_payment(context, booking['id'])
    for _ in range(2):
        assert send_webhook(context['client'], entity).status_code == 200
    with context['sessions']() as db:
        assert db.get(Booking, booking['id']).status == 'confirmed'
        assert len(db.scalars(select(Payment)).all()) == 1


def test_invalid_webhook_signature_or_amount_cannot_confirm(context):
    booking = reserve(context)
    entity = add_payment(context, booking['id'])
    assert send_webhook(context['client'], entity, 'forged').status_code == 400
    assert send_webhook(context['client'], {**entity, 'amount': 1}).status_code == 409
    assert send_webhook(context['client'], {**entity, 'status': 'authorized'}).status_code == 409
    with context['sessions']() as db:
        assert db.get(Booking, booking['id']).status == 'pending'


def test_late_payment_does_not_steal_new_reservation(context):
    booking = reserve(context)
    entity = add_payment(context, booking['id'])
    with context['sessions']() as db:
        db.get(Booking, booking['id']).expires_at = now() - timedelta(minutes=1)
        db.commit()
    newer = context['client'].post('/api/bookings', json=payload(context)).json()
    assert send_webhook(context['client'], entity).status_code == 200
    with context['sessions']() as db:
        assert db.get(Booking, booking['id']).status == 'cancelled'
        assert db.get(Booking, newer['id']).status == 'pending'
        assert db.scalar(select(Payment)).requires_refund is True


def test_paid_booking_cannot_be_cancelled_as_unpaid(context):
    booking = reserve(context)
    send_webhook(context['client'], add_payment(context, booking['id']))
    assert context['client'].post(f'/api/bookings/{booking["id"]}/cancel').status_code == 409


def test_cross_site_cookie_mutation_rejected(context):
    login(context['client'])
    assert context['client'].post('/api/bookings', json=payload(context), headers={'origin': 'https://evil.example'}).status_code == 403


def test_payment_order_reuses_existing_order(context, monkeypatch):
    booking = reserve(context)
    calls = []
    def provider(*args):
        calls.append(args)
        return {'id': 'order_test'}
    monkeypatch.setattr('app.main.razorpay', provider)
    for _ in range(2):
        result = context['client'].post(f'/api/payments/{booking["id"]}/order')
        assert result.status_code == 200
        assert result.json()['amount'] == 4500000
    assert len(calls) == 1
