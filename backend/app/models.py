from datetime import datetime, timezone
from uuid import uuid4
from sqlalchemy import Boolean, CheckConstraint, Date, DateTime, Enum, ForeignKey, Index, Integer, JSON, Numeric, String, Text, UniqueConstraint, Uuid, text
from sqlalchemy.orm import Mapped, mapped_column
from .db import Base


def now():
    return datetime.now(timezone.utc)


def uid():
    return str(uuid4())


role_type = Enum('customer', 'vendor', 'admin', name='user_role')
approval_type = Enum('pending', 'approved', 'rejected', name='approval_status')
listing_type = Enum('venue', 'service', name='listing_type')
booking_status_type = Enum('pending', 'confirmed', 'cancelled', 'completed', name='booking_status')
payment_type = Enum('created', 'paid', 'failed', 'refunded', 'partial_refund', name='payment_status')


class User(Base):
    __tablename__ = 'users'
    id: Mapped[str] = mapped_column(Uuid(as_uuid=False), primary_key=True, default=uid)
    name: Mapped[str] = mapped_column(String(150))
    email: Mapped[str] = mapped_column(String(255), unique=True)
    password_hash: Mapped[str] = mapped_column(Text)
    role: Mapped[str] = mapped_column(role_type)
    approval_status: Mapped[str] = mapped_column(approval_type, default='approved')
    is_email_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    token_version: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now, onupdate=now)


class Category(Base):
    __tablename__ = 'categories'
    id: Mapped[str] = mapped_column(Uuid(as_uuid=False), primary_key=True, default=uid)
    type: Mapped[str] = mapped_column(listing_type, default='venue')
    name: Mapped[str] = mapped_column(String(100))
    slug: Mapped[str] = mapped_column(String(100), unique=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)


class Venue(Base):
    __tablename__ = 'venues'
    id: Mapped[str] = mapped_column(Uuid(as_uuid=False), primary_key=True, default=uid)
    vendor_id: Mapped[str] = mapped_column(ForeignKey('users.id'))
    category_id: Mapped[str] = mapped_column(ForeignKey('categories.id'))
    name: Mapped[str] = mapped_column(String(200))
    description: Mapped[str | None] = mapped_column(Text)
    location_text: Mapped[str] = mapped_column(String(255))
    price_per_day: Mapped[float] = mapped_column(Numeric(12, 2))
    max_guests: Mapped[int] = mapped_column(Integer)
    facilities: Mapped[list] = mapped_column(JSON, default=list)
    rules: Mapped[str | None] = mapped_column(Text)
    cancellation_policy: Mapped[str | None] = mapped_column(Text)
    approval_status: Mapped[str] = mapped_column(approval_type, default='pending')
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now, onupdate=now)
    __table_args__ = (CheckConstraint('price_per_day > 0'), CheckConstraint('max_guests > 0'))


class VenuePhoto(Base):
    __tablename__ = 'venue_photos'
    id: Mapped[str] = mapped_column(Uuid(as_uuid=False), primary_key=True, default=uid)
    venue_id: Mapped[str] = mapped_column(ForeignKey('venues.id', ondelete='CASCADE'))
    url: Mapped[str] = mapped_column(Text)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)


class Wishlist(Base):
    __tablename__ = 'wishlists'
    id: Mapped[str] = mapped_column(Uuid(as_uuid=False), primary_key=True, default=uid)
    customer_id: Mapped[str] = mapped_column(ForeignKey('users.id', ondelete='CASCADE'))
    target_type: Mapped[str] = mapped_column(String(20), default='venue')
    target_id: Mapped[str] = mapped_column(Uuid(as_uuid=False))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)
    __table_args__ = (UniqueConstraint('customer_id', 'target_type', 'target_id'),)


class Availability(Base):
    __tablename__ = 'venue_availability'
    id: Mapped[str] = mapped_column(Uuid(as_uuid=False), primary_key=True, default=uid)
    venue_id: Mapped[str] = mapped_column(ForeignKey('venues.id', ondelete='CASCADE'))
    date: Mapped[object] = mapped_column(Date)
    is_available: Mapped[bool] = mapped_column(Boolean, default=True)
    __table_args__ = (UniqueConstraint('venue_id', 'date'),)


class Offer(Base):
    __tablename__ = 'offers'
    id: Mapped[str] = mapped_column(Uuid(as_uuid=False), primary_key=True, default=uid)
    code: Mapped[str] = mapped_column(String(40), unique=True)
    name: Mapped[str] = mapped_column(String(150))
    discount_type: Mapped[str] = mapped_column(String(20))
    discount_value: Mapped[float] = mapped_column(Numeric(12, 2))
    starts_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    minimum_booking_amount: Mapped[float] = mapped_column(Numeric(12, 2), default=0)
    usage_limit: Mapped[int | None] = mapped_column(Integer)
    times_used: Mapped[int] = mapped_column(Integer, default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now, onupdate=now)
    __table_args__ = (
        CheckConstraint('discount_value > 0'),
        CheckConstraint('minimum_booking_amount >= 0'),
        CheckConstraint('usage_limit IS NULL OR usage_limit > 0'),
        CheckConstraint('times_used >= 0'),
        CheckConstraint('expires_at > starts_at'),
    )


class Booking(Base):
    __tablename__ = 'bookings'
    id: Mapped[str] = mapped_column(Uuid(as_uuid=False), primary_key=True, default=uid)
    customer_id: Mapped[str] = mapped_column(ForeignKey('users.id'))
    booking_type: Mapped[str] = mapped_column(listing_type, default='venue')
    venue_id: Mapped[str] = mapped_column(ForeignKey('venues.id'))
    booking_date: Mapped[object] = mapped_column(Date)
    guest_count: Mapped[int] = mapped_column(Integer)
    base_amount: Mapped[float] = mapped_column(Numeric(12, 2))
    discount_amount: Mapped[float] = mapped_column(Numeric(12, 2), default=0)
    offer_id: Mapped[str | None] = mapped_column(ForeignKey('offers.id'))
    offer_code_snapshot: Mapped[str | None] = mapped_column(String(40))
    total_amount: Mapped[float] = mapped_column(Numeric(12, 2))
    status: Mapped[str] = mapped_column(booking_status_type, default='pending')
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    cancellation_policy_snapshot: Mapped[str | None] = mapped_column(Text)
    cancelled_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    cancellation_reason: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)
    __table_args__ = (
        CheckConstraint('total_amount > 0'), CheckConstraint('guest_count > 0'),
        Index('uq_active_venue_date', 'venue_id', 'booking_date', unique=True,
              postgresql_where=text("venue_id IS NOT NULL AND status IN ('pending', 'confirmed', 'completed')"),
              sqlite_where=text("venue_id IS NOT NULL AND status IN ('pending', 'confirmed', 'completed')")),
    )


class Payment(Base):
    __tablename__ = 'payments'
    id: Mapped[str] = mapped_column(Uuid(as_uuid=False), primary_key=True, default=uid)
    booking_id: Mapped[str] = mapped_column(ForeignKey('bookings.id'))
    razorpay_order_id: Mapped[str] = mapped_column(String(100), unique=True)
    razorpay_payment_id: Mapped[str | None] = mapped_column(String(100), unique=True)
    amount: Mapped[float] = mapped_column(Numeric(12, 2))
    status: Mapped[str] = mapped_column(payment_type, default='created')
    requires_refund: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)
