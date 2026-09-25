from datetime import date, datetime
from decimal import Decimal
from typing import Literal
from uuid import UUID
from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator, model_validator


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
    offer_code: str = Field(default='', max_length=40)

    @field_validator('offer_code')
    @classmethod
    def normalize_offer_code(cls, value):
        value = value.upper()
        if value and (not value.replace('-', '').isalnum() or len(value) < 3):
            raise ValueError('Offer code must contain letters, numbers, or hyphens.')
        return value


class OfferValidationInput(Input):
    venue_id: UUID
    code: str = Field(min_length=3, max_length=40)

    @field_validator('code')
    @classmethod
    def normalize_code(cls, value):
        value = value.upper()
        if not value.replace('-', '').isalnum():
            raise ValueError('Offer code must contain letters, numbers, or hyphens.')
        return value


class OfferInput(Input):
    code: str = Field(min_length=3, max_length=40)
    name: str = Field(min_length=3, max_length=150)
    discount_type: Literal['percentage', 'fixed']
    discount_value: Decimal = Field(gt=0, le=10000000, decimal_places=2)
    starts_at: datetime
    expires_at: datetime
    minimum_booking_amount: Decimal = Field(default=0, ge=0, le=10000000, decimal_places=2)
    usage_limit: int | None = Field(default=None, gt=0, le=10000000)
    is_active: bool = True

    @field_validator('code')
    @classmethod
    def valid_code(cls, value):
        value = value.upper()
        if not value.replace('-', '').isalnum():
            raise ValueError('Offer code must contain letters, numbers, or hyphens.')
        return value

    @model_validator(mode='after')
    def valid_discount(self):
        if self.expires_at <= self.starts_at:
            raise ValueError('Expiry must be after the start date.')
        if self.discount_type == 'percentage' and self.discount_value >= 100:
            raise ValueError('Percentage discounts must be less than 100%.')
        return self


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
