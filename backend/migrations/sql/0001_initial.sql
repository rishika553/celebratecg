-- Venue, Services & Event Booking Marketplace
-- Core PostgreSQL schema (v1) — designed to run as-is in the Supabase SQL editor
-- Use as the reference contract before writing FastAPI models / Alembic migrations.
-- gen_random_uuid() requires the pgcrypto extension, which Supabase enables by default.

CREATE TYPE user_role AS ENUM ('customer', 'vendor', 'admin');
CREATE TYPE approval_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');
CREATE TYPE payment_status AS ENUM ('created', 'paid', 'failed', 'refunded', 'partial_refund');
CREATE TYPE listing_type AS ENUM ('venue', 'service');
CREATE TYPE ticket_tier AS ENUM ('general', 'vip', 'early_bird');

-- ============================
-- USERS
-- ============================
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role            user_role NOT NULL,
    name            VARCHAR(150) NOT NULL,
    email           VARCHAR(255) UNIQUE NOT NULL,
    password_hash   TEXT NOT NULL,
    token_version   INT NOT NULL DEFAULT 0,
    phone           VARCHAR(20),
    is_email_verified BOOLEAN DEFAULT FALSE,
    approval_status approval_status DEFAULT 'approved', -- vendors may start 'pending'
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE password_resets (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token       TEXT NOT NULL,
    expires_at  TIMESTAMPTZ NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT now()
);

-- ============================
-- CATEGORIES (extensible — venues, services, events all reference this)
-- ============================
CREATE TABLE categories (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type        listing_type NOT NULL,   -- 'venue' or 'service'
    name        VARCHAR(100) NOT NULL,   -- e.g. Resort, Hotel, DJ, Catering
    slug        VARCHAR(100) UNIQUE NOT NULL,
    is_active   BOOLEAN DEFAULT TRUE
);

-- ============================
-- VENUES
-- ============================
CREATE TABLE venues (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id     UUID NOT NULL REFERENCES categories(id),
    name            VARCHAR(200) NOT NULL,
    description     TEXT,
    location_text   VARCHAR(255),
    latitude        NUMERIC(9,6),
    longitude       NUMERIC(9,6),
    price_per_day   NUMERIC(12,2) NOT NULL,
    max_guests      INT,
    facilities      JSONB DEFAULT '[]',       -- ["parking","ac","catering_allowed"]
    rules           TEXT,
    cancellation_policy TEXT,
    approval_status approval_status DEFAULT 'pending',
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE venue_photos (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id    UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
    url         TEXT NOT NULL,
    sort_order  INT DEFAULT 0
);

CREATE TABLE venue_availability (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id    UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
    date        DATE NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    UNIQUE (venue_id, date)
);

-- ============================
-- SERVICES (generalized so new categories don't need schema changes)
-- ============================
CREATE TABLE services (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id     UUID NOT NULL REFERENCES categories(id), -- DJ / Catering / Decoration / Photography / future
    name            VARCHAR(200) NOT NULL,
    description     TEXT,
    price           NUMERIC(12,2) NOT NULL,
    price_unit      VARCHAR(50) DEFAULT 'per_event', -- per_event, per_hour, per_guest
    approval_status approval_status DEFAULT 'pending',
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE service_availability (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id  UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    date        DATE NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    UNIQUE (service_id, date)
);

-- ============================
-- EVENTS & TICKETS
-- ============================
CREATE TABLE events (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title           VARCHAR(200) NOT NULL,
    description     TEXT,
    location_text   VARCHAR(255),
    latitude        NUMERIC(9,6),
    longitude       NUMERIC(9,6),
    start_datetime  TIMESTAMPTZ NOT NULL,
    end_datetime    TIMESTAMPTZ,
    approval_status approval_status DEFAULT 'pending',
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE ticket_types (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id    UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    tier        ticket_tier NOT NULL,
    price       NUMERIC(12,2) NOT NULL,
    quantity_total     INT NOT NULL,
    quantity_sold      INT DEFAULT 0,
    sale_start  TIMESTAMPTZ,
    sale_end    TIMESTAMPTZ
);

-- ============================
-- BOOKINGS (polymorphic: venue OR service OR ticket)
-- ============================
CREATE TABLE bookings (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    booking_type    listing_type NOT NULL,      -- 'venue' or 'service'
    venue_id        UUID REFERENCES venues(id),
    service_id      UUID REFERENCES services(id),
    booking_date    DATE NOT NULL,
    guest_count     INT,
    total_amount    NUMERIC(12,2) NOT NULL,
    status          booking_status DEFAULT 'pending',
    cancelled_at    TIMESTAMPTZ,
    cancellation_reason TEXT,
    created_at      TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT chk_booking_target CHECK (
        (booking_type = 'venue' AND venue_id IS NOT NULL AND service_id IS NULL) OR
        (booking_type = 'service' AND service_id IS NOT NULL AND venue_id IS NULL)
    )
);

-- First implementation: exclusive, single-day venue reservations.
ALTER TABLE bookings ADD COLUMN expires_at TIMESTAMPTZ;
ALTER TABLE bookings ADD COLUMN cancellation_policy_snapshot TEXT;
ALTER TABLE bookings ADD CONSTRAINT chk_booking_amount CHECK (total_amount > 0);
ALTER TABLE bookings ADD CONSTRAINT chk_booking_guests CHECK (guest_count > 0);
CREATE UNIQUE INDEX uq_active_venue_date ON bookings(venue_id, booking_date)
    WHERE venue_id IS NOT NULL AND status IN ('pending', 'confirmed', 'completed');

CREATE TABLE ticket_purchases (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    ticket_type_id  UUID NOT NULL REFERENCES ticket_types(id),
    quantity        INT NOT NULL,
    total_amount    NUMERIC(12,2) NOT NULL,
    status          booking_status DEFAULT 'pending',
    created_at      TIMESTAMPTZ DEFAULT now()
);

-- ============================
-- PAYMENTS (Razorpay)
-- ============================
CREATE TABLE payments (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id          UUID REFERENCES bookings(id),
    ticket_purchase_id  UUID REFERENCES ticket_purchases(id),
    razorpay_order_id   VARCHAR(100),
    razorpay_payment_id VARCHAR(100),
    razorpay_signature  TEXT,
    amount              NUMERIC(12,2) NOT NULL,
    status              payment_status DEFAULT 'created',
    is_advance_payment  BOOLEAN DEFAULT FALSE,
    refunded_amount     NUMERIC(12,2) DEFAULT 0,
    requires_refund      BOOLEAN NOT NULL DEFAULT FALSE,
    created_at          TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT chk_payment_target CHECK (
        (booking_id IS NOT NULL AND ticket_purchase_id IS NULL) OR
        (booking_id IS NULL AND ticket_purchase_id IS NOT NULL)
    )
);

-- ============================
-- COMMISSIONS
-- ============================
CREATE TABLE commissions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id     UUID NOT NULL REFERENCES categories(id),
    percentage      NUMERIC(5,2) NOT NULL, -- e.g. 10.00 = 10%
    updated_at      TIMESTAMPTZ DEFAULT now()
);

-- ============================
-- REVIEWS (post-booking only)
-- ============================
CREATE TABLE reviews (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    booking_id      UUID REFERENCES bookings(id),
    ticket_purchase_id UUID REFERENCES ticket_purchases(id),
    target_type     VARCHAR(20) NOT NULL, -- 'venue' | 'service' | 'event'
    target_id       UUID NOT NULL,
    rating          SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment         TEXT,
    is_moderated    BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT now()
);

-- ============================
-- WISHLIST
-- ============================
CREATE TABLE wishlists (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_type     VARCHAR(20) NOT NULL, -- 'venue' | 'service' | 'event'
    target_id       UUID NOT NULL,
    created_at      TIMESTAMPTZ DEFAULT now(),
    UNIQUE (customer_id, target_type, target_id)
);

-- ============================
-- USEFUL INDEXES
-- ============================
CREATE INDEX idx_venues_category ON venues(category_id);
CREATE INDEX idx_venues_vendor ON venues(vendor_id);
CREATE INDEX idx_services_vendor ON services(vendor_id);
CREATE INDEX idx_bookings_customer ON bookings(customer_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_events_vendor ON events(vendor_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE UNIQUE INDEX uq_payment_order ON payments(razorpay_order_id);
CREATE UNIQUE INDEX uq_payment_provider_id ON payments(razorpay_payment_id);
CREATE INDEX idx_booking_venue_date ON bookings(venue_id, booking_date);
ALTER TABLE venues ADD CONSTRAINT chk_venue_price CHECK (price_per_day > 0);
ALTER TABLE venues ADD CONSTRAINT chk_venue_guests CHECK (max_guests > 0);

-- FastAPI owns authorization. Browser Data API roles must not bypass it.
-- The backend connects using the database owner (or a dedicated privileged server role).
DO $$
DECLARE table_name TEXT;
BEGIN
    FOREACH table_name IN ARRAY ARRAY['users','password_resets','categories','venues',
        'venue_photos','venue_availability','services','service_availability','events',
        'ticket_types','bookings','ticket_purchases','payments','commissions','reviews','wishlists']
    LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_name);
        IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
            EXECUTE format('REVOKE ALL ON TABLE public.%I FROM anon', table_name);
        END IF;
        IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
            EXECUTE format('REVOKE ALL ON TABLE public.%I FROM authenticated', table_name);
        END IF;
    END LOOP;
END $$;
