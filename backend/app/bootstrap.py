"""Explicit local demo setup. Never invoked automatically by the API."""
import argparse
import getpass
from sqlalchemy import select
from .auth import passwords
from .config import settings
from .db import Base, engine, SessionLocal
from .models import Category, User, Venue, VenuePhoto

PHOTOS = [
    # Category-matched venue references; provenance is recorded in docs/image-sources.md.
    'https://cdn.spalba.com/venue_images/1730785544921-Vatika_20Lawn.webp',
    'https://sayajihotels.com/images/hotels/Sayaji%20Raipur/banquet/Mahal%202.webp',
    'https://portal-tourism.cgstate.gov.in/files/JDP3d1014e.jpg',
    'https://familyfarms.in/images/farm_house_image/DOC1691492108523.6.jpg',
    'https://cdn.venuelook.com/uploads/space_40506/1740113191_595x400.png',
    'https://sayajihotels.com/images/hotels/Sayaji%20Raipur/banquet/pearl.webp',
]


def seed_categories(db):
    for name, slug in [('Banquet halls', 'banquet-hall'), ('Lawns & gardens', 'lawn'), ('Resorts', 'resort'), ('Farmhouses', 'farmhouse')]:
        if not db.scalar(select(Category).where(Category.slug == slug)):
            db.add(Category(name=name, slug=slug, type='venue'))
    db.commit()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--demo', action='store_true')
    parser.add_argument('--refresh-demo-photos', action='store_true', help='Replace original stock images on existing seeded venues only; requires --demo.')
    parser.add_argument('--admin-email')
    parser.add_argument('--categories', action='store_true')
    args = parser.parse_args()
    if args.refresh_demo_photos and not args.demo:
        parser.error('--refresh-demo-photos requires --demo')
    settings().validate_runtime()
    if args.demo:
        if settings().app_env == 'production' or not settings().demo_mode or not settings().database_url.startswith('sqlite'):
            raise SystemExit('Demo setup requires local SQLite, development mode, and DEMO_MODE=true.')
        Base.metadata.create_all(engine)
    with SessionLocal() as db:
        if args.demo or args.categories:
            seed_categories(db)
        if args.admin_email:
            password = getpass.getpass('New admin password (at least 12 characters): ')
            if len(password) < 12:
                raise SystemExit('Password is too short.')
            email = args.admin_email.strip().lower()
            if db.scalar(select(User).where(User.email == email)):
                raise SystemExit('Account already exists. No changes made.')
            db.add(User(name='Platform admin', email=email, password_hash=passwords.hash(password), role='admin', approval_status='approved'))
            db.commit()
        if not args.demo:
            return
        for role in ['customer', 'vendor', 'admin']:
            if not db.scalar(select(User).where(User.email == f'{role}@example.com')):
                db.add(User(name={'customer': 'Aarav', 'vendor': 'The Celebration Collective', 'admin': 'CelebrateCG Admin'}[role], email=f'{role}@example.com', password_hash=passwords.hash('CelebrateDemo123!'), role=role, approval_status='approved'))
        db.commit()
        vendor = db.scalar(select(User).where(User.email == 'vendor@example.com'))
        records = [
            ('The Marigold Gardens', 'Raipur, Chhattisgarh', 'lawn', 45000, 500, ['Open-air lawn', 'Parking', 'Bridal suite']),
            ('Amara Grand Ballroom', 'Raipur, Chhattisgarh', 'banquet-hall', 65000, 350, ['Air conditioning', 'Parking', 'Stage & sound']),
            ('Saanjh Riverside Retreat', 'Bilaspur, Chhattisgarh', 'resort', 38000, 150, ['Riverside setting', 'Guest rooms', 'Parking']),
            ('The Mango Grove', 'Durg, Chhattisgarh', 'farmhouse', 28000, 120, ['Private garden', 'Pool', 'Parking']),
            ('Gulmohar Courtyard', 'Bilaspur, Chhattisgarh', 'lawn', 35000, 250, ['Open-air lawn', 'Covered dining', 'Parking']),
            ('Aangan Celebration Hall', 'Durg, Chhattisgarh', 'banquet-hall', 48000, 400, ['Air conditioning', 'Bridal suite', 'Parking']),
        ]
        for i, (name, location, slug, price, guests, facilities) in enumerate(records):
            existing = db.scalar(select(Venue).where(Venue.name == name, Venue.vendor_id == vendor.id))
            if existing:
                if args.refresh_demo_photos:
                    for photo in db.scalars(select(VenuePhoto).where(VenuePhoto.venue_id == existing.id)):
                        if photo.url.startswith('https://images.unsplash.com/'):
                            photo.url = PHOTOS[i]
                continue
            category = db.scalar(select(Category).where(Category.slug == slug))
            venue = Venue(vendor_id=vendor.id, category_id=category.id, name=name, location_text=location, price_per_day=price, max_guests=guests,
                          description='A welcoming setting for the moments that matter. Gather your favourite people for weddings, birthdays, and everything worth celebrating. With thoughtful spaces to dine, dance, and unwind, there is room to make the day your own. This is a fictional sample listing for the local preview; images are illustrative.',
                          facilities=facilities, rules='Venue hire is for one day. Catering and decoration are arranged separately. Please respect the venue capacity and discuss event timings with your host.',
                          cancellation_policy='Unpaid reservations can be cancelled immediately. Paid cancellations require support review; no automatic refund is promised in this preview.', approval_status='approved')
            db.add(venue)
            db.flush()
            db.add(VenuePhoto(venue_id=venue.id, url=PHOTOS[i]))
        db.commit()
    print('Local demo ready. Accounts: customer@example.com, vendor@example.com, admin@example.com. Password: CelebrateDemo123!')


if __name__ == '__main__':
    main()
