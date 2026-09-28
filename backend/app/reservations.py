"""Reservation cleanup shared by HTTP handlers and the scheduled job."""
from sqlalchemy import update
from sqlalchemy.orm import Session
from .models import Booking, now


def expire_holds(db: Session):
    moment = now()
    result = db.execute(
        update(Booking)
        .where(Booking.status == 'pending', Booking.expires_at <= moment)
        .values(status='cancelled', cancelled_at=moment, cancellation_reason='Reservation expired')
    )
    return result.rowcount
