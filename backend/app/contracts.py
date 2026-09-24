from datetime import date
from decimal import Decimal
from typing import Literal
from uuid import UUID
from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


class Input(BaseModel):
    model_config = ConfigDict(extra='forbid', str_strip_whitespace=True)


class Login(Input):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class Signup(Login):
    name: str = Field(min_length=2, max_length=150)
    password: str = Field(min_length=10, max_length=128)
    role: Literal['customer', 'vendor'] = 'customer'


class VenueInput(Input):
    category_id: UUID
    name: str = Field(min_length=3, max_length=200)
    description: str = Field(min_length=20, max_length=10000)
    location_text: str = Field(min_length=2, max_length=255)
    price_per_day: Decimal = Field(gt=0, le=10000000, decimal_places=2)
    max_guests: int = Field(gt=0, le=100000)
    facilities: list[str] = Field(default_factory=list, max_length=30)
    rules: str = Field(default='', max_length=3000)
    cancellation_policy: str = Field(default='Contact the venue for cancellation terms. Paid cancellations require admin review.', max_length=3000)
    photo_url: str = Field(default='', max_length=2000)

    @field_validator('photo_url')
    @classmethod
    def safe_image(cls, value):
        if value and not value.startswith('https://'):
            raise ValueError('Photo URL must use HTTPS.')
        return value


class BookingInput(Input):
    venue_id: UUID
    booking_date: date
    guest_count: int = Field(gt=0, le=100000)


class AvailabilityInput(Input):
    date: date
    is_available: bool


class ApprovalInput(Input):
    status: Literal['approved', 'rejected']


class PhotoOrderInput(Input):
    photo_ids: list[UUID] = Field(min_length=1, max_length=10)


class VerifyPayment(Input):
    razorpay_order_id: str = Field(max_length=100, pattern=r'^order_[A-Za-z0-9]+$')
    razorpay_payment_id: str = Field(max_length=100, pattern=r'^pay_[A-Za-z0-9]+$')
    razorpay_signature: str = Field(max_length=256)
