from collections import defaultdict, deque
from contextlib import asynccontextmanager
from datetime import date, datetime, timedelta, timezone
from decimal import Decimal, ROUND_HALF_UP
import hashlib
import hmac
import json
import time
from uuid import UUID, uuid4
from zoneinfo import ZoneInfo
import httpx
from fastapi import Depends, FastAPI, File, HTTPException, Query, Request, Response, UploadFile
from fastapi.responses import JSONResponse
from sqlalchemy import func, or_, select, update
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from .auth import current_user, dummy_hash, passwords, role, set_session, user_view
from .config import settings
from .contracts import ApprovalInput, AvailabilityInput, BookingInput, Login, OfferInput, OfferValidationInput, PhotoOrderInput, Signup, VenueInput, VerifyPayment
from .db import get_db
from .models import Availability, Booking, Category, Offer, Payment, User, Venue, VenuePhoto, Wishlist, now
from .storage import objects


@asynccontextmanager
async def lifespan(app):
    settings().validate_runtime()
    yield


app = FastAPI(title='CelebrateCG API', version='0.1.0', lifespan=lifespan)
login_attempts: dict[str, deque] = defaultdict(deque)


@app.middleware('http')
async def browser_security(request: Request, call_next):
    if request.method not in ('GET', 'HEAD', 'OPTIONS') and request.url.path != '/api/webhooks/razorpay':
        origin = request.headers.get('origin')
        if origin and origin not in settings().origins:
            return JSONResponse({'detail': 'Origin is not allowed.'}, status_code=403)
        if request.headers.get('sec-fetch-site') == 'cross-site':
            return JSONResponse({'detail': 'Cross-site requests are not allowed.'}, status_code=403)
    response = await call_next(request)
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
    if request.url.path.startswith(('/api/auth', '/api/bookings', '/api/admin', '/api/vendor', '/api/payments')):
        response.headers['Cache-Control'] = 'no-store'
    return response


def expire_holds(db: Session):
    db.execute(update(Booking).where(Booking.status == 'pending', Booking.expires_at <= now()).values(status='cancelled', cancelled_at=now(), cancellation_reason='Reservation expired'))


def aware(value):
    return value.replace(tzinfo=timezone.utc) if value.tzinfo is None else value


def business_today():
    return now().astimezone(ZoneInfo('Asia/Kolkata')).date()


def venue_view(db, venue):
    photos = db.scalars(select(VenuePhoto).where(VenuePhoto.venue_id == venue.id).order_by(VenuePhoto.sort_order)).all()
    category = db.get(Category, venue.category_id)
    return {'id': venue.id, 'name': venue.name, 'description': venue.description, 'location_text': venue.location_text,
            'price_per_day': str(venue.price_per_day), 'max_guests': venue.max_guests, 'facilities': venue.facilities,
            'category': category.name, 'category_id': venue.category_id, 'category_slug': category.slug,
            'photos': [photo_url(photo) for photo in photos],
            'photo_items': [{'id': photo.id, 'url': photo_url(photo), 'sort_order': photo.sort_order} for photo in photos],
            'rules': venue.rules, 'cancellation_policy': venue.cancellation_policy,
            'approval_status': venue.approval_status}


def photo_url(photo):
    return f'/api/media/{photo.url.removeprefix("object://")}' if photo.url.startswith('object://') else photo.url


def owned_venue(db, venue_id, user):
    venue = db.get(Venue, str(venue_id))
    if not venue or venue.vendor_id != user.id:
        raise HTTPException(404, 'Venue not found.')
    return venue


def image_kind(data: bytes):
    if data.startswith(b'\xff\xd8\xff'):
        return 'image/jpeg', 'jpg'
    if data.startswith(b'\x89PNG\r\n\x1a\n'):
        return 'image/png', 'png'
    if len(data) >= 12 and data[:4] == b'RIFF' and data[8:12] == b'WEBP':
        return 'image/webp', 'webp'
    raise HTTPException(422, 'Only JPEG, PNG, and WebP images are accepted.')


def public_venue(db, venue_id):
    venue = db.get(Venue, str(venue_id))
    if not venue or venue.approval_status != 'approved' or not venue.is_active:
        raise HTTPException(404, 'Venue not found.')
    vendor = db.get(User, venue.vendor_id)
    category = db.get(Category, venue.category_id)
    if vendor.approval_status != 'approved' or not category.is_active:
        raise HTTPException(404, 'Venue not found.')
    return venue


def booking_view(db, booking):
    venue = db.get(Venue, booking.venue_id)
    return {'id': booking.id, 'venue_id': booking.venue_id, 'venue_name': venue.name, 'booking_date': str(booking.booking_date),
            'guest_count': booking.guest_count, 'base_amount': str(booking.base_amount),
            'discount_amount': str(booking.discount_amount), 'offer_id': booking.offer_id,
            'offer_code': booking.offer_code_snapshot, 'total_amount': str(booking.total_amount), 'status': booking.status,
            'expires_at': aware(booking.expires_at).isoformat(), 'created_at': booking.created_at.isoformat()}


def offer_view(offer):
    moment = now()
    status = 'inactive'
    if offer.is_active:
        if aware(offer.expires_at) <= moment:
            status = 'expired'
        elif aware(offer.starts_at) > moment:
            status = 'scheduled'
        elif offer.usage_limit is not None and offer.times_used >= offer.usage_limit:
            status = 'used_up'
        else:
            status = 'active'
    return {'id': offer.id, 'code': offer.code, 'name': offer.name, 'discount_type': offer.discount_type,
            'discount_value': str(offer.discount_value), 'starts_at': aware(offer.starts_at).isoformat(),
            'expires_at': aware(offer.expires_at).isoformat(),
            'minimum_booking_amount': str(offer.minimum_booking_amount), 'usage_limit': offer.usage_limit,
            'times_used': offer.times_used, 'is_active': offer.is_active, 'status': status}


def calculate_offer(db: Session, code: str, amount: Decimal, lock: bool = False):
    query = select(Offer).where(Offer.code == code)
    if lock:
        query = query.with_for_update()
    offer = db.scalar(query.execution_options(populate_existing=True))
    if not offer:
        raise HTTPException(422, 'Offer code was not found.')
    moment = now()
    if not offer.is_active:
        raise HTTPException(422, 'This offer is not active.')
    if aware(offer.starts_at) > moment:
        raise HTTPException(422, 'This offer has not started yet.')
    if aware(offer.expires_at) <= moment:
        raise HTTPException(422, 'This offer has expired.')
    if amount < Decimal(offer.minimum_booking_amount):
        raise HTTPException(422, f'This offer requires a minimum booking amount of ₹{offer.minimum_booking_amount}.')
    if offer.usage_limit is not None and offer.times_used >= offer.usage_limit:
        raise HTTPException(422, 'This offer has reached its usage limit.')
    discount = amount * Decimal(offer.discount_value) / Decimal(100) if offer.discount_type == 'percentage' else Decimal(offer.discount_value)
    discount = discount.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
    if discount >= amount:
        raise HTTPException(422, 'This offer discount must be less than the booking amount.')
    return offer, discount, amount - discount


def own_booking(db, booking_id, user):
    booking = db.scalar(select(Booking).where(Booking.id == str(booking_id)).with_for_update().execution_options(populate_existing=True))
    if not booking or booking.customer_id != user.id:
        raise HTTPException(404, 'Booking not found.')
    return booking


@app.get('/api/health')
def health():
    return {'status': 'ok', 'demo_mode': settings().demo_mode, 'payments_enabled': bool(settings().razorpay_key_id and settings().razorpay_key_secret)}


@app.get('/api/media/{key:path}')
def media(key: str):
    if not key.startswith('venues/') or '..' in key.split('/'):
        raise HTTPException(404, 'Image not found.')
    try:
        data, content_type = objects.get(key)
    except (FileNotFoundError, ValueError):
        raise HTTPException(404, 'Image not found.')
    return Response(data, media_type=content_type, headers={'Cache-Control': 'public, max-age=31536000, immutable'})


@app.post('/api/auth/signup', status_code=201)
def signup(data: Signup, response: Response, db: Session = Depends(get_db)):
    user = User(name=data.name, email=str(data.email).lower(), password_hash=passwords.hash(data.password), role=data.role,
                approval_status='pending' if data.role == 'vendor' else 'approved')
    db.add(user)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(409, 'An account already exists with this email.')
    set_session(response, user)
    return user_view(user)


@app.post('/api/auth/login')
def login(data: Login, request: Request, response: Response, db: Session = Depends(get_db)):
    key = str(data.email).lower()
    attempts = login_attempts[key]
    while attempts and attempts[0] < time.monotonic() - 900:
        attempts.popleft()
    if len(attempts) >= 10:
        raise HTTPException(429, 'Too many attempts. Try again in 15 minutes.')
    attempts.append(time.monotonic())
    user = db.scalar(select(User).where(User.email == key))
    valid = passwords.verify(data.password, user.password_hash if user else dummy_hash)
    if not user or not valid:
        raise HTTPException(401, 'Incorrect email or password.')
    login_attempts.pop(key, None)
    set_session(response, user)
    return user_view(user)


@app.get('/api/auth/me')
def me(user: User = Depends(current_user)):
    return user_view(user)


@app.post('/api/auth/logout')
def logout(response: Response, user: User = Depends(current_user), db: Session = Depends(get_db)):
    user.token_version += 1
    db.commit()
    response.delete_cookie('cg_session', path='/')
    return {'ok': True}


@app.get('/api/categories')
def categories(db: Session = Depends(get_db)):
    return [{'id': c.id, 'name': c.name, 'slug': c.slug} for c in db.scalars(select(Category).where(Category.type == 'venue', Category.is_active.is_(True)).order_by(Category.name))]


@app.get('/api/venues')
def venues(q: str = '', category: str = '', guests: int = Query(0, ge=0), max_price: Decimal | None = Query(None, gt=0), booking_date: date | None = None, db: Session = Depends(get_db)):
    query = select(Venue).join(Category).join(User, Venue.vendor_id == User.id).where(Venue.approval_status == 'approved', Venue.is_active.is_(True), Category.is_active.is_(True), User.approval_status == 'approved')
    if q:
        query = query.where(or_(Venue.name.icontains(q, autoescape=True), Venue.location_text.icontains(q, autoescape=True)))
    if category:
        query = query.where(Category.slug == category)
    if guests:
        query = query.where(Venue.max_guests >= guests)
    if max_price:
        query = query.where(Venue.price_per_day <= max_price)
    if booking_date:
        occupied = select(Booking.venue_id).where(Booking.booking_date == booking_date, or_(Booking.status.in_(['confirmed', 'completed']), (Booking.status == 'pending') & (Booking.expires_at > now())))
        blocked = select(Availability.venue_id).where(Availability.date == booking_date, Availability.is_available.is_(False))
        query = query.where(Venue.id.not_in(occupied), Venue.id.not_in(blocked))
    return [venue_view(db, v) for v in db.scalars(query.order_by(Venue.created_at).limit(100))]


@app.get('/api/venues/{venue_id}')
def venue_detail(venue_id: UUID, db: Session = Depends(get_db)):
    return venue_view(db, public_venue(db, venue_id))


@app.get('/api/venues/{venue_id}/availability')
def availability(venue_id: UUID, day: date, db: Session = Depends(get_db)):
    public_venue(db, venue_id)
    block = db.scalar(select(Availability).where(Availability.venue_id == str(venue_id), Availability.date == day))
    active = db.scalar(select(Booking).where(Booking.venue_id == str(venue_id), Booking.booking_date == day, or_(Booking.status.in_(['confirmed', 'completed']), (Booking.status == 'pending') & (Booking.expires_at > now()))))
    return {'date': str(day), 'available': day >= business_today() and not active and not (block and not block.is_available)}


@app.get('/api/favourites')
def favourites(user: User = Depends(role('customer')), db: Session = Depends(get_db)):
    query = (select(Venue)
             .join(Wishlist, Wishlist.target_id == Venue.id)
             .join(Category, Venue.category_id == Category.id)
             .join(User, Venue.vendor_id == User.id)
             .where(Wishlist.customer_id == user.id, Wishlist.target_type == 'venue',
                    Venue.approval_status == 'approved', Venue.is_active.is_(True),
                    Category.is_active.is_(True), User.approval_status == 'approved')
             .order_by(Wishlist.created_at.desc()))
    return [venue_view(db, venue) for venue in db.scalars(query)]


@app.get('/api/favourites/ids')
def favourite_ids(user: User = Depends(role('customer')), db: Session = Depends(get_db)):
    return list(db.scalars(select(Wishlist.target_id).where(
        Wishlist.customer_id == user.id, Wishlist.target_type == 'venue')))


@app.post('/api/favourites/{venue_id}', status_code=201)
def add_favourite(venue_id: UUID, user: User = Depends(role('customer')), db: Session = Depends(get_db)):
    venue = public_venue(db, venue_id)
    existing = db.scalar(select(Wishlist).where(
        Wishlist.customer_id == user.id, Wishlist.target_type == 'venue', Wishlist.target_id == venue.id))
    if not existing:
        db.add(Wishlist(customer_id=user.id, target_type='venue', target_id=venue.id))
        try:
            db.commit()
        except IntegrityError:
            db.rollback()
    return {'saved': True, 'venue_id': venue.id}


@app.delete('/api/favourites/{venue_id}')
def remove_favourite(venue_id: UUID, user: User = Depends(role('customer')), db: Session = Depends(get_db)):
    favourite = db.scalar(select(Wishlist).where(
        Wishlist.customer_id == user.id, Wishlist.target_type == 'venue', Wishlist.target_id == str(venue_id)))
    if favourite:
        db.delete(favourite)
        db.commit()
    return {'saved': False, 'venue_id': str(venue_id)}


@app.post('/api/bookings', status_code=201)
def create_booking(data: BookingInput, user: User = Depends(role('customer')), db: Session = Depends(get_db)):
    venue = public_venue(db, data.venue_id)
    db.execute(select(Venue).where(Venue.id == venue.id).with_for_update())
    if data.booking_date < business_today():
        raise HTTPException(422, 'Choose today or a future date.')
    if data.guest_count > venue.max_guests:
        raise HTTPException(422, 'Guest count exceeds the venue capacity.')
    expire_holds(db)
    block = db.scalar(select(Availability).where(Availability.venue_id == venue.id, Availability.date == data.booking_date))
    if block and not block.is_available:
        raise HTTPException(409, 'The venue is unavailable on this date.')
    base_amount = Decimal(venue.price_per_day)
    offer, discount_amount, final_amount = None, Decimal('0.00'), base_amount
    if data.offer_code:
        offer, discount_amount, final_amount = calculate_offer(db, data.offer_code, base_amount, lock=True)
        offer.times_used += 1
    booking = Booking(customer_id=user.id, venue_id=venue.id, booking_date=data.booking_date, guest_count=data.guest_count,
                      base_amount=base_amount, discount_amount=discount_amount, offer_id=offer.id if offer else None,
                      offer_code_snapshot=offer.code if offer else None, total_amount=final_amount,
                      expires_at=now() + timedelta(minutes=15), cancellation_policy_snapshot=venue.cancellation_policy)
    db.add(booking)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(409, 'This date was just reserved. Please choose another date.')
    return booking_view(db, booking)


@app.post('/api/offers/validate')
def validate_offer(data: OfferValidationInput, db: Session = Depends(get_db)):
    venue = public_venue(db, data.venue_id)
    amount = Decimal(venue.price_per_day)
    offer, discount, final_amount = calculate_offer(db, data.code, amount)
    return {'offer': offer_view(offer), 'base_amount': str(amount), 'discount_amount': str(discount),
            'final_amount': str(final_amount)}


@app.get('/api/bookings')
def bookings(user: User = Depends(current_user), db: Session = Depends(get_db)):
    expire_holds(db)
    db.commit()
    query = select(Booking).order_by(Booking.created_at.desc())
    if user.role == 'customer':
        query = query.where(Booking.customer_id == user.id)
    elif user.role == 'vendor':
        query = query.join(Venue).where(Venue.vendor_id == user.id)
    return [booking_view(db, b) for b in db.scalars(query.limit(200))]


@app.post('/api/bookings/{booking_id}/cancel')
def cancel(booking_id: UUID, user: User = Depends(role('customer')), db: Session = Depends(get_db)):
    booking = own_booking(db, booking_id, user)
    if booking.status != 'pending':
        raise HTTPException(409, 'Only unpaid reservations can be cancelled here. Paid bookings require support review.')
    booking.status, booking.cancelled_at = 'cancelled', now()
    db.commit()
    return booking_view(db, booking)


@app.get('/api/vendor/venues')
def vendor_venues(user: User = Depends(role('vendor')), db: Session = Depends(get_db)):
    return [venue_view(db, v) for v in db.scalars(select(Venue).where(Venue.vendor_id == user.id))]


def apply_venue(db, data, venue):
    category = db.get(Category, str(data.category_id))
    if not category or category.type != 'venue' or not category.is_active:
        raise HTTPException(422, 'Choose an active venue category.')
    for key, value in data.model_dump(exclude={'photo_url'}).items():
        setattr(venue, key, str(value) if key == 'category_id' else value)
    venue.approval_status = 'pending'
    db.add(venue)
    db.flush()
    if data.photo_url:
        for photo in db.scalars(select(VenuePhoto).where(VenuePhoto.venue_id == venue.id)):
            db.delete(photo)
        db.add(VenuePhoto(venue_id=venue.id, url=data.photo_url))
    db.commit()
    return venue_view(db, venue)


@app.post('/api/vendor/venues', status_code=201)
def add_venue(data: VenueInput, user: User = Depends(role('vendor')), db: Session = Depends(get_db)):
    return apply_venue(db, data, Venue(vendor_id=user.id))


@app.put('/api/vendor/venues/{venue_id}')
def edit_venue(venue_id: UUID, data: VenueInput, user: User = Depends(role('vendor')), db: Session = Depends(get_db)):
    venue = owned_venue(db, venue_id, user)
    return apply_venue(db, data, venue)


@app.post('/api/vendor/venues/{venue_id}/photos', status_code=201)
async def upload_photos(venue_id: UUID, files: list[UploadFile] = File(...), user: User = Depends(role('vendor')), db: Session = Depends(get_db)):
    venue = owned_venue(db, venue_id, user)
    existing = db.scalars(select(VenuePhoto).where(VenuePhoto.venue_id == venue.id)).all()
    if not files or len(existing) + len(files) > 10:
        raise HTTPException(422, 'A venue can have between 1 and 10 photos.')
    prepared = []
    for upload in files:
        data = await upload.read(8 * 1024 * 1024 + 1)
        if len(data) > 8 * 1024 * 1024:
            raise HTTPException(413, 'Each photo must be 8 MB or smaller.')
        content_type, extension = image_kind(data)
        if upload.content_type and upload.content_type not in ('image/jpeg', 'image/png', 'image/webp'):
            raise HTTPException(422, 'Only JPEG, PNG, and WebP images are accepted.')
        prepared.append((f'venues/{venue.id}/{uuid4().hex}.{extension}', data, content_type))
    created = []
    try:
        for offset, (key, data, content_type) in enumerate(prepared):
            objects.put(key, data, content_type)
            photo = VenuePhoto(venue_id=venue.id, url=f'object://{key}', sort_order=len(existing) + offset)
            db.add(photo)
            created.append(photo)
        venue.approval_status = 'pending'
        db.commit()
    except Exception:
        db.rollback()
        for key, _, _ in prepared:
            try:
                objects.delete(key)
            except Exception:
                pass
        raise
    return venue_view(db, venue)


@app.put('/api/vendor/venues/{venue_id}/photos/order')
def reorder_photos(venue_id: UUID, data: PhotoOrderInput, user: User = Depends(role('vendor')), db: Session = Depends(get_db)):
    venue = owned_venue(db, venue_id, user)
    photos = db.scalars(select(VenuePhoto).where(VenuePhoto.venue_id == venue.id)).all()
    if set(map(str, data.photo_ids)) != {photo.id for photo in photos} or len(data.photo_ids) != len(photos):
        raise HTTPException(422, 'Photo order must include every venue photo exactly once.')
    by_id = {photo.id: photo for photo in photos}
    for index, photo_id in enumerate(data.photo_ids):
        by_id[str(photo_id)].sort_order = index
    venue.approval_status = 'pending'
    db.commit()
    return venue_view(db, venue)


@app.delete('/api/vendor/venues/{venue_id}/photos/{photo_id}')
def remove_photo(venue_id: UUID, photo_id: UUID, user: User = Depends(role('vendor')), db: Session = Depends(get_db)):
    venue = owned_venue(db, venue_id, user)
    photo = db.scalar(select(VenuePhoto).where(VenuePhoto.id == str(photo_id), VenuePhoto.venue_id == venue.id))
    if not photo:
        raise HTTPException(404, 'Photo not found.')
    key = photo.url.removeprefix('object://') if photo.url.startswith('object://') else None
    db.delete(photo)
    venue.approval_status = 'pending'
    db.flush()
    remaining = db.scalars(select(VenuePhoto).where(VenuePhoto.venue_id == venue.id).order_by(VenuePhoto.sort_order)).all()
    for index, item in enumerate(remaining):
        item.sort_order = index
    db.commit()
    if key:
        try:
            objects.delete(key)
        except Exception:
            pass
    return venue_view(db, venue)


@app.put('/api/vendor/venues/{venue_id}/availability')
def set_availability(venue_id: UUID, data: AvailabilityInput, user: User = Depends(role('vendor')), db: Session = Depends(get_db)):
    venue = db.scalar(select(Venue).where(Venue.id == str(venue_id), Venue.vendor_id == user.id).with_for_update())
    if not venue:
        raise HTTPException(404, 'Venue not found.')
    if data.date < business_today():
        raise HTTPException(422, 'Choose today or a future date.')
    expire_holds(db)
    if not data.is_available and db.scalar(select(Booking).where(Booking.venue_id == venue.id, Booking.booking_date == data.date, Booking.status.in_(['pending', 'confirmed']))):
        raise HTTPException(409, 'This date already has an active reservation.')
    row = db.scalar(select(Availability).where(Availability.venue_id == venue.id, Availability.date == data.date))
    if not row:
        row = Availability(venue_id=venue.id, date=data.date)
        db.add(row)
    row.is_available = data.is_available
    db.commit()
    return {'ok': True}


@app.get('/api/admin/overview')
def admin_overview(user: User = Depends(role('admin')), db: Session = Depends(get_db)):
    return {'users': db.scalar(select(func.count(User.id))), 'venues': db.scalar(select(func.count(Venue.id))),
            'bookings': db.scalar(select(func.count(Booking.id))),
            'vendors': [user_view(u) for u in db.scalars(select(User).where(User.role == 'vendor'))],
            'listings': [venue_view(db, v) for v in db.scalars(select(Venue))],
            'refunds_to_review': [{'payment_id': p.id, 'amount': str(p.amount)} for p in db.scalars(select(Payment).where(Payment.requires_refund.is_(True)))]}


@app.get('/api/admin/offers')
def admin_offers(user: User = Depends(role('admin')), db: Session = Depends(get_db)):
    return [offer_view(offer) for offer in db.scalars(select(Offer).order_by(Offer.created_at.desc()))]


def apply_offer_input(data: OfferInput, offer: Offer):
    for key, value in data.model_dump().items():
        setattr(offer, key, value)
    return offer


@app.post('/api/admin/offers', status_code=201)
def create_offer(data: OfferInput, user: User = Depends(role('admin')), db: Session = Depends(get_db)):
    if db.scalar(select(Offer).where(Offer.code == data.code)):
        raise HTTPException(409, 'An offer with this code already exists.')
    offer = apply_offer_input(data, Offer(times_used=0))
    db.add(offer)
    db.commit()
    return offer_view(offer)


@app.put('/api/admin/offers/{offer_id}')
def update_offer(offer_id: UUID, data: OfferInput, user: User = Depends(role('admin')), db: Session = Depends(get_db)):
    offer = db.get(Offer, str(offer_id))
    if not offer:
        raise HTTPException(404, 'Offer not found.')
    duplicate = db.scalar(select(Offer).where(Offer.code == data.code, Offer.id != offer.id))
    if duplicate:
        raise HTTPException(409, 'An offer with this code already exists.')
    apply_offer_input(data, offer)
    db.commit()
    return offer_view(offer)


@app.post('/api/admin/offers/{offer_id}/activate')
def activate_offer(offer_id: UUID, user: User = Depends(role('admin')), db: Session = Depends(get_db)):
    offer = db.get(Offer, str(offer_id))
    if not offer:
        raise HTTPException(404, 'Offer not found.')
    if aware(offer.expires_at) <= now():
        raise HTTPException(422, 'Edit the expiry date before activating this offer.')
    offer.is_active = True
    db.commit()
    return offer_view(offer)


@app.post('/api/admin/offers/{offer_id}/expire')
def expire_offer(offer_id: UUID, user: User = Depends(role('admin')), db: Session = Depends(get_db)):
    offer = db.get(Offer, str(offer_id))
    if not offer:
        raise HTTPException(404, 'Offer not found.')
    offer.is_active = False
    if aware(offer.expires_at) > now():
        offer.expires_at = now()
    db.commit()
    return offer_view(offer)


@app.post('/api/admin/vendors/{user_id}/approval')
def approve_vendor(user_id: UUID, data: ApprovalInput, admin: User = Depends(role('admin')), db: Session = Depends(get_db)):
    user = db.get(User, str(user_id))
    if not user or user.role != 'vendor':
        raise HTTPException(404, 'Vendor not found.')
    user.approval_status = data.status
    db.commit()
    return user_view(user)


@app.post('/api/admin/venues/{venue_id}/approval')
def approve_venue(venue_id: UUID, data: ApprovalInput, admin: User = Depends(role('admin')), db: Session = Depends(get_db)):
    venue = db.get(Venue, str(venue_id))
    if not venue:
        raise HTTPException(404, 'Venue not found.')
    if data.status == 'approved' and db.get(User, venue.vendor_id).approval_status != 'approved':
        raise HTTPException(409, 'Approve the vendor before approving their venue.')
    venue.approval_status = data.status
    db.commit()
    return venue_view(db, venue)


def razorpay(method, path, payload=None):
    cfg = settings()
    if not cfg.razorpay_key_id or not cfg.razorpay_key_secret:
        raise HTTPException(503, 'Payments are not configured yet. Your reservation is unpaid.')
    try:
        response = httpx.request(method, f'https://api.razorpay.com/v1/{path}', json=payload, auth=(cfg.razorpay_key_id, cfg.razorpay_key_secret), timeout=20)
        response.raise_for_status()
        return response.json()
    except (httpx.HTTPError, ValueError):
        raise HTTPException(502, 'The payment provider is unavailable. Please try again.')


@app.post('/api/payments/{booking_id}/order')
def create_order(booking_id: UUID, user: User = Depends(role('customer')), db: Session = Depends(get_db)):
    booking = own_booking(db, booking_id, user)
    db.execute(select(Booking).where(Booking.id == booking.id).with_for_update())
    if booking.status != 'pending' or aware(booking.expires_at) <= now():
        raise HTTPException(409, 'This reservation has expired or is no longer payable.')
    payment = db.scalar(select(Payment).where(Payment.booking_id == booking.id, Payment.status == 'created'))
    if not payment:
        order = razorpay('POST', 'orders', {'amount': int(Decimal(booking.total_amount) * 100), 'currency': 'INR', 'receipt': booking.id})
        payment = Payment(booking_id=booking.id, razorpay_order_id=order['id'], amount=booking.total_amount)
        db.add(payment)
        db.commit()
    return {'key': settings().razorpay_key_id, 'order_id': payment.razorpay_order_id, 'amount': int(Decimal(payment.amount) * 100), 'currency': 'INR'}


def reconcile(db, entity):
    payment = db.scalar(select(Payment).where(Payment.razorpay_order_id == entity.get('order_id')))
    if not payment:
        raise HTTPException(404, 'Payment order not found.')
    # Always lock booking before payment, matching checkout and cancellation.
    booking = db.scalar(select(Booking).where(Booking.id == payment.booking_id).with_for_update().execution_options(populate_existing=True))
    payment = db.scalar(select(Payment).where(Payment.id == payment.id).with_for_update().execution_options(populate_existing=True))
    if entity.get('currency') != 'INR' or entity.get('amount') != int(Decimal(payment.amount) * 100) or entity.get('status') != 'captured':
        raise HTTPException(409, 'Payment has not been captured for the expected amount.')
    if payment.status == 'paid':
        if payment.razorpay_payment_id != entity['id']:
            raise HTTPException(409, 'A different payment is already recorded for this order.')
        return payment
    payment.status, payment.razorpay_payment_id = 'paid', entity['id']
    if booking.status != 'pending' or aware(booking.expires_at) <= now():
        payment.requires_refund = True
        if booking.status == 'pending':
            booking.status, booking.cancelled_at = 'cancelled', now()
    else:
        booking.status = 'confirmed'
    db.commit()
    return payment


@app.post('/api/payments/verify')
def verify(data: VerifyPayment, user: User = Depends(role('customer')), db: Session = Depends(get_db)):
    if not settings().razorpay_key_secret:
        raise HTTPException(503, 'Payments are not configured.')
    payment = db.scalar(select(Payment).where(Payment.razorpay_order_id == data.razorpay_order_id))
    if not payment:
        raise HTTPException(404, 'Payment order not found.')
    own_booking(db, payment.booking_id, user)
    expected = hmac.new(settings().razorpay_key_secret.encode(), f'{payment.razorpay_order_id}|{data.razorpay_payment_id}'.encode(), hashlib.sha256).hexdigest()
    if not hmac.compare_digest(expected, data.razorpay_signature):
        raise HTTPException(400, 'Invalid payment signature.')
    entity = razorpay('GET', f'payments/{data.razorpay_payment_id}')
    if entity.get('order_id') != payment.razorpay_order_id:
        raise HTTPException(400, 'Payment does not belong to this order.')
    result = reconcile(db, entity)
    return {'status': result.status, 'requires_refund': result.requires_refund}


@app.post('/api/webhooks/razorpay')
async def webhook(request: Request, db: Session = Depends(get_db)):
    secret = settings().razorpay_webhook_secret
    if not secret:
        raise HTTPException(503, 'Webhook is not configured.')
    raw = await request.body()
    expected = hmac.new(secret.encode(), raw, hashlib.sha256).hexdigest()
    if not hmac.compare_digest(expected, request.headers.get('x-razorpay-signature', '')):
        raise HTTPException(400, 'Invalid webhook signature.')
    try:
        payload = json.loads(raw)
        if payload.get('event') == 'payment.captured':
            reconcile(db, payload['payload']['payment']['entity'])
    except (ValueError, KeyError, TypeError):
        raise HTTPException(400, 'Invalid webhook payload.')
    return {'ok': True}
