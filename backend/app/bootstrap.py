"""Explicit local demo setup. Never invoked automatically by the API."""
import argparse
import getpass
from sqlalchemy import select
from .auth import passwords
from .config import settings
from .db import SessionLocal
from .models import Category, User, Venue, VenuePhoto

PHOTOS = [
    # Unique venue-style references for local demo cards.
    'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1523217582562-09d0def993a6?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
]


def seed_categories(db):
    category_groups = {
        'venue': [('Banquet halls', 'banquet-hall'), ('Lawns & gardens', 'lawn'), ('Resorts', 'resort'),
                  ('Farmhouses', 'farmhouse'), ('Luxury villas', 'luxury-villa'), ('Hotels', 'hotel'),
                  ('Eco stays & homestays', 'eco-stay'), ('Picnic destinations', 'picnic-destination')],
        'service': [('DJ & entertainment', 'dj-entertainment'), ('Catering', 'catering'),
                    ('Decoration & themes', 'decoration'), ('Photography & video', 'photography-video'),
                    ('Mehndi & makeup', 'mehndi-makeup'), ('Sound, lights & stage', 'sound-light-stage'),
                    ('Tent & furniture', 'tent-furniture'), ('Party planners', 'party-planners')],
    }
    for category_type, records in category_groups.items():
        for name, slug in records:
            category = db.scalar(select(Category).where(Category.slug == slug))
            if category:
                category.name = name
                category.type = category_type
                category.is_active = True
            else:
                db.add(Category(name=name, slug=slug, type=category_type))
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
        if settings().app_env != 'development' or not settings().demo_mode or not settings().database_url.startswith('postgresql+psycopg://'):
            raise SystemExit('Demo setup requires a development PostgreSQL database and DEMO_MODE=true.')
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
            ('Arpa River View Resort', 'Bilaspur, Chhattisgarh', 'resort', 52000, 220, ['Riverside setting', 'Guest rooms', 'Pool', 'Parking']),
            ('Kanan Celebration Lawn', 'Bilaspur, Chhattisgarh', 'lawn', 42000, 450, ['Open-air lawn', 'Covered dining', 'Stage & sound', 'Parking']),
            ('Bilasa Heritage Banquet', 'Bilaspur, Chhattisgarh', 'banquet-hall', 58000, 500, ['Air conditioning', 'Bridal suite', 'Stage & sound', 'Covered dining']),
            ('Seepat Garden Villa', 'Bilaspur, Chhattisgarh', 'luxury-villa', 36000, 80, ['Private garden', 'Pool', 'Guest rooms', 'Parking']),
            ('Shivnath Riverside Greens', 'Bhilai, Chhattisgarh', 'lawn', 39000, 300, ['Riverside setting', 'Open-air lawn', 'Stage & sound', 'Parking']),
            ('Mahua Eco Retreat', 'Jagdalpur, Chhattisgarh', 'eco-stay', 24000, 60, ['Guest rooms', 'Private garden', 'Covered dining', 'Parking']),
            ('Hasdeo Pool Villa', 'Korba, Chhattisgarh', 'luxury-villa', 44000, 90, ['Pool', 'Guest rooms', 'Air conditioning', 'Private garden']),
            ('Sirpur Picnic Estate', 'Mahasamund, Chhattisgarh', 'picnic-destination', 22000, 180, ['Open-air lawn', 'Covered dining', 'Parking', 'Private garden']),
            ('Raigarh Royal Courtyard', 'Raigarh, Chhattisgarh', 'banquet-hall', 54000, 420, ['Air conditioning', 'Bridal suite', 'Stage & sound', 'Parking']),
            ('Ambikapur Hill Garden', 'Ambikapur, Chhattisgarh', 'farmhouse', 30000, 140, ['Private garden', 'Open-air lawn', 'Guest rooms', 'Parking']),
        ]
        for i, (name, location, slug, price, guests, facilities) in enumerate(records):
            existing = db.scalar(select(Venue).where(Venue.name == name, Venue.vendor_id == vendor.id))
            if existing:
                if args.refresh_demo_photos:
                    photo = db.scalar(select(VenuePhoto).where(VenuePhoto.venue_id == existing.id).order_by(VenuePhoto.sort_order))
                    if photo:
                        photo.url = PHOTOS[i]
                    else:
                        db.add(VenuePhoto(venue_id=existing.id, url=PHOTOS[i]))
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
