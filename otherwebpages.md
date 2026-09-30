CelebrateCG — Categories & Cities Pages Design Specification

Purpose

The Home page is already implemented. Build two new pages that feel like they belong to the exact same brand and design system:

/categories

/cities or /cities-map

These pages are for a premium celebration/venue booking platform covering villas, farmhouses, resorts, hotels, event venues, services, and events.

The most important requirement is visual consistency with the existing Home page. Do not create generic SaaS/dashboard/listing pages.

1. Existing Home Page Design Language

The existing Home page has this visual direction:

Full-screen / large cinematic photography

Dark cinematic overlays

Black / charcoal navigation

Warm white / cream typography

Warm orange accent

Large editorial serif headings

Small uppercase labels with letter spacing

Rounded containers and cards

Minimal UI

Premium hospitality / luxury event feel

Spacious layouts

Strong photography

Subtle borders

Smooth, refined interactions

Modern but editorial rather than corporate

Existing Home page feel

The visual hierarchy is approximately:

NAVBAR
    ↓
FULL-SCREEN CINEMATIC HERO
    ↓
Large serif headline
    ↓
Short supporting text
    ↓
Primary CTA + secondary CTA
    ↓
Premium venue imagery

The new pages must reuse this design language.

Do NOT introduce unrelated colors such as bright blue, purple, neon green, or generic SaaS gradients.

2. Global Design Rules

Typography

Use the same font family already used by the Home page.

If the existing project already has a serif display font and sans-serif body font, reuse them instead of introducing new fonts.

Display headings

Use a large editorial serif style.

Examples:

Explore what's possible.

Discover by destination.

Find your place to celebrate.

Where will you celebrate?

Labels

Use uppercase small labels with letter spacing:

EXPLORE BY SPACE
DISCOVER BY DESTINATION
EVENT SERVICES
POPULAR DESTINATIONS
FIND VENUES AROUND YOU

Body text

Use the existing Home page sans-serif font.

Keep body copy short and readable.

Color direction

Reuse the existing Home page palette.

Approximate direction:

Background: near-black / charcoal
Primary text: warm white / cream
Secondary text: muted white
Accent: warm orange
Borders: subtle grey / transparent white
Cards: dark charcoal / image based

Do not create a new visual theme for these pages.

3. /categories Page

Purpose

The Categories page answers:

"WHAT am I looking for?"

It should help users visually discover different types of venues and event services.

The page should feel like a premium visual catalog, not a normal product grid.

Section 1 — Navbar

Reuse the exact existing navbar from the Home page.

Navigation should remain consistent:

Logo

Find a venue
Categories
Cities & map
Contact

List your space ↗
Sign in

Do not redesign the navbar for this page.

The active navigation item can have a subtle visual state.

4. Categories Hero

Create a full-width cinematic hero similar to the Home page.

Use a beautiful high-quality image of a villa, farmhouse, resort, or celebration venue.

Use a dark gradient overlay to keep text readable.

Content

Small label:

EXPLORE WHAT'S POSSIBLE

Large serif heading:

Find the perfect
place to celebrate.

Supporting text:

Discover villas, farmhouses, resorts, hotels
and spaces made for unforgettable moments.

Do not overcrowd the hero.

Keep generous whitespace.

The hero should feel premium and editorial.

5. Category Gallery

After the hero, create the main category discovery section.

Section label:

EXPLORE BY SPACE

Optional heading:

Spaces for every kind of celebration.

Important

Do NOT use a boring equal 3-column card grid.

Avoid:

[Card] [Card] [Card]
[Card] [Card] [Card]

Instead, create an asymmetric editorial image layout.

Use different card sizes.

Example structure:

┌──────────────────────────────┐ ┌───────────────┐
│                              │ │               │
│                              │ │   FARMHOUSE   │
│           VILLAS             │ │               │
│                              │ │   Explore →   │
│                              │ │               │
└──────────────────────────────┘ └───────────────┘

┌───────────────┐ ┌──────────────────────────────┐
│               │ │                              │
│    RESORTS    │ │       BANQUET HALLS          │
│               │ │                              │
│   Explore →   │ │       Explore →              │
└───────────────┘ └──────────────────────────────┘

┌──────────────────────┐ ┌──────────────────────┐
│                      │ │                      │
│       HOTELS         │ │        LAWNS         │
│                      │ │                      │
│      Explore →       │ │      Explore →       │
└──────────────────────┘ └──────────────────────┘

The exact layout can be adapted responsively.

6. Category Card Design

Every category card should use a strong full-bleed image.

Do not use simple icon-only cards.

Each card should have:

Background image

Dark gradient overlay

Category name

Short description if useful

Explore → action

Subtle hover animation

Example:

Villa

VILLAS

Private spaces.
Made for your moments.

Explore villas →

Farmhouse

FARMHOUSES

Open spaces.
Big celebrations.

Explore farmhouses →

Resorts

RESORTS

Escape.
Stay.
Celebrate.

Explore resorts →

Hotels

HOTELS

Comfort for every occasion.

Explore hotels →

Banquet Halls

BANQUET HALLS

Designed for grand celebrations.

Explore banquet halls →

Lawns

LAWNS

Open-air celebrations.

Explore lawns →

The images should be relevant to the category.

7. Dynamic Category Architecture

The backend already has a generalized category system.

Do not hard-code the frontend so that it only supports:

DJ

Catering

Decoration

Photography

The UI should be able to receive categories from the backend and render them dynamically.

Conceptually:

GET /api/categories

The exact endpoint should follow the existing backend architecture.

If an admin adds a new category later, the frontend should be capable of displaying it without requiring a complete UI rewrite.

8. Event Services Section

After venue categories, create a separate section:

EVENT SERVICES

Everything you need
to celebrate.

Services currently include:

DJ

Catering

Decoration

Photography

Use image-based cards.

Example:

┌───────────────────────┐
│                       │
│       PHOTOGRAPHY     │
│                       │
│       Explore →       │
└───────────────────────┘

┌───────────────┐ ┌───────────────┐
│      DJ       │ │   CATERING    │
│   Explore →   │ │   Explore →   │
└───────────────┘ └───────────────┘

Again, do not make these look like dashboard widgets.

9. Categories Page CTA

At the bottom, before the footer, add a strong editorial CTA.

Example:

YOUR CELEBRATION
STARTS HERE.

Find a space that feels like yours.

[ Explore venues ↗ ]

Keep it visually similar to the Home page CTA style.

10. Categories Page User Flow

The intended flow is:

Categories
    ↓
Villa / Farmhouse / Resort / Hotel / etc.
    ↓
Category Listing Page
    ↓
Filters
    ↓
Venue Detail
    ↓
Availability
    ↓
Booking

For example:

Categories
    ↓
Villas
    ↓
Villas listing
    ↓
Location + date + guests + price + facilities + rating
    ↓
Villa detail
    ↓
Availability calendar
    ↓
Booking

The Categories page itself is primarily a discovery page.

11. /cities or /cities-map Page

Purpose

The Cities page answers:

"WHERE am I looking?"

It should feel like a combination of:

destination guide

venue discovery

map exploration

It should NOT look identical to the Categories page.

Categories = visual category discovery.

Cities = destination discovery + map.

12. Cities Hero

Create another full-width cinematic hero using a different location/destination image.

Keep the same typography and overlay treatment as the Home page.

Small label:

DISCOVER BY DESTINATION

Large serif heading:

Discover by destination.

Supporting text:

Explore venues, stays and experiences
across your favourite cities.

Add a clean search field:

[ Search a city or location                     🔍 ]

The search should visually match the existing brand.

13. Featured City Section

After the hero:

EXPLORE DESTINATIONS

Where will you celebrate?

Use an editorial layout instead of equal cards.

Example:

┌─────────────────────────────────────────┐
│                                         │
│                 RAIPUR                  │
│                                         │
│       Venues · Farmhouses · Events      │
│                                         │
│                  ↗                      │
└─────────────────────────────────────────┘

┌──────────────────┐  ┌──────────────────┐
│                  │  │                  │
│     BILASPUR     │  │      BHILAI      │
│                  │  │                  │
│       ↗          │  │        ↗         │
└──────────────────┘  └──────────────────┘

Use actual cities supported by the application/database.

Do not invent venue counts.

If counts are unavailable, omit them.

14. Cities and Map Section

This is the functional part of the page.

Section label:

FIND VENUES AROUND YOU

Heading:

Explore properties on the map.

Use a split layout on desktop:

┌──────────────────────┬──────────────────────────┐
│                      │                          │
│  VENUE LIST          │                          │
│                      │          MAP             │
│  Villa               │                          │
│  Gurugram             │      ●       ●          │
│  ★ 4.8               │           ●              │
│  ₹15,000/day          │   ●               ●     │
│                      │                          │
│  ─────────────────   │                          │
│                      │                          │
│  Farmhouse            │                          │
│  Raipur               │                          │
│                      │                          │
└──────────────────────┴──────────────────────────┘

Recommended desktop ratio:

Listing: 40–45%
Map:     55–60%

The map can use the existing Google Maps integration specified in the project.

15. Map Filters

The map/listing section should support the project's actual venue filters:

Location

Date

Guests

Price

Facilities

Rating

Category

Availability

Keep the filter UI visually minimal.

Avoid making it look like an admin dashboard.

Example:

Location
[ Raipur ▼ ]

Category
[ Villas ▼ ]

Price
₹5,000 ───────── ₹50,000

Facilities
☐ Swimming pool
☐ Parking
☐ AC
☐ Wi-Fi

The exact filters should follow the actual backend API/schema.

16. City Detail Flow

When the user selects a city:

Cities
   ↓
Raipur
   ↓
Raipur venue listing
   ↓
Category / date / guest / price / facility filters
   ↓
Venue detail
   ↓
Availability
   ↓
Booking

A city detail page can contain:

RAIPUR

Villas, farmhouses, resorts &
event venues in Raipur.

[ Search ]

Popular in Raipur

[ Villas ] [ Farmhouses ] [ Resorts ]

Recommended venues
[ Property ] [ Property ] [ Property ]

Explore Raipur on map
[ Map ]

17. Responsive Behavior

Both pages MUST be fully responsive.

Desktop

Use:

large cinematic hero

asymmetric layouts

generous spacing

large photography

map/list split layout

Tablet

Adapt the editorial grid while preserving the visual hierarchy.

Mobile

Do not simply shrink desktop.

For Categories:

Hero
↓
Category cards stacked
↓
Services
↓
CTA

For Cities:

Hero
↓
City cards
↓
Filters
↓
List / Map toggle
↓
Venue cards

For the map section on mobile, use:

[ List ] [ Map ]

or an equivalent clear toggle.

The map should not make the mobile page unusable.

18. Animation and Interaction

Keep animations subtle and premium.

Use:

image scale on hover

smooth card transitions

fade/slide reveal

subtle text movement

smooth navigation

gentle image zoom

Avoid:

excessive bouncing

flashy animations

neon effects

excessive parallax

distracting motion

The experience should feel like a premium hospitality website.

19. Do Not Do These Things

Do NOT:

create a generic SaaS dashboard

use bright blue/purple gradients

use excessive icons

make every card identical

use huge amounts of text

introduce a completely different navbar

introduce a different font system

use placeholder-looking UI

hard-code fake venue counts

invent database data

break existing Home page styling

duplicate backend logic unnecessarily

create fake API endpoints without checking the existing project structure

20. Important Technical Requirement

Before implementing:

Inspect the existing Home page.

Reuse its:

navbar

fonts

colors

buttons

spacing system

border radius

animation patterns

responsive behavior

Inspect the existing routing structure.

Inspect the existing API/category/city models before creating new API assumptions.

Reuse existing components wherever possible.

Do not modify unrelated Home page functionality.

Keep frontend/backend responsibilities separated.

Follow the existing project architecture.

Use real backend data where available.

Do not create fake data that looks like production data.

21. Final Visual Direction

The three pages should feel like one brand:

HOME
↓
Cinematic luxury introduction
"Plan. Book. Celebrate."

CATEGORIES
↓
Visual category discovery
"Find the perfect place to celebrate."

CITIES & MAP
↓
Destination discovery
"Discover by destination."

The visual progression should be:

HOME
  → Brand / emotion

CATEGORIES
  → What can I book?

CITIES & MAP
  → Where can I book?

LISTING
  → What is available?

DETAIL
  → Tell me about this venue.

BOOKING
  → Reserve it.

The goal is to preserve the premium editorial identity of the existing CelebrateCG Home page while making Categories and Cities genuinely useful for





CelebrateCG — Find Venue Page Specification

Goal

Create a dedicated /find-venue page that acts as the complete venue marketplace.

The existing landing page should not be disturbed.

Landing page: curated/featured venues only.

Find Venue page: all approved venues listed by vendors.

Vendor listings automatically appear on Find Venue after admin approval.

Vendor listings do not automatically appear on the landing page.

Admin can manually mark approved venues as featured for the landing page.

1. Core Flow

Vendor
  ↓
Registers / signs in
  ↓
Creates venue listing
  ↓
Adds name, location, type, capacity, price, facilities, images
  ↓
Submits listing
  ↓
Admin reviews
  ↓
Admin approves
  ↓
status = APPROVED
  ↓
Venue automatically appears on /find-venue

The landing page remains curated:

Vendor adds venue
  ↓
Admin approves
  ↓
Appears on Find Venue
  ↓
Does NOT automatically appear on Home

2. Landing Page vs Find Venue

Landing Page

Keep the existing venue cards and design exactly as they are.

Use a curated set of featured venues.

Recommended query:

status = APPROVED
AND show_on_home = TRUE

Find Venue

Display all approved venues.

Recommended query:

status = APPROVED

If there are 300 approved venues, Find Venue can display all 300.

3. Visual Design

The page must use the same premium editorial style as the existing CelebrateCG Home page.

Use:

Dark charcoal / near-black

Warm white / cream

Warm orange accent

Editorial serif headings

Clean sans-serif body text

Large cinematic venue photography

Subtle borders

Premium hospitality/event feel

Spacious layout

Avoid:

Generic SaaS dashboard styling

Bright blue/purple/neon colors

Flat generic card grids

Excessive icons

Unrelated typography

A visually different navbar

4. Hero Section

Use a cinematic venue background image or video with a dark overlay.

Suggested content:

Eyebrow

FIND YOUR PERFECT VENUE

Heading

Spaces made for
your celebration.

Supporting copy

Discover verified venues across Chhattisgarh,
from intimate gardens and villas to grand
banquet halls and luxury resorts.

Search

[ Search city, venue or location ]

Examples:

Raipur
Bilaspur
Durg
Bhilai
Raigarh

5. Marketplace Section

After the hero:

EXPLORE VENUES

Find a space that feels right for your celebration.

Category tabs:

[ All ]
[ Villas ]
[ Farmhouses ]
[ Resorts ]
[ Hotels ]
[ Banquet Halls ]
[ Lawns ]
[ Other ]

Categories should eventually be driven by the backend/category system where appropriate.

6. Results Header

Show a dynamic result count:

247 venues found

Do not hard-code the number in production.

Controls:

[ Filters ]
[ Sort: Featured ↓ ]

Sort options:

Featured
Price: Low to High
Price: High to Low
Rating
Newest

7. Filters

Location

Search location

Examples:

Raipur
Bilaspur
Durg
Bhilai
Raigarh
Korba
Jagdalpur

Date

Select date

Guests

Number of guests

Possible ranges:

Up to 50
50–100
100–250
250–500
500–1000
1000+

Price

Minimum price
Maximum price

Venue Type

□ Villa
□ Farmhouse
□ Resort
□ Hotel
□ Banquet Hall
□ Lawn
□ Wedding Palace
□ Other

Facilities

□ Parking
□ Swimming Pool
□ Air Conditioning
□ Catering
□ Kitchen
□ Rooms
□ Outdoor Area
□ Indoor Area
□ Power Backup
□ Decoration

Rating

4+ stars
3+ stars
Any rating

Availability

If the booking system supports it:

Available on selected date

8. Venue Card

Reuse the current Home-page venue card visual style.

Example:

┌─────────────────────────────────────┐
│             VENUE IMAGE             │
│                                     │
│  Farmhouses                    ♡    │
├─────────────────────────────────────┤
│ 📍 Raipur, Chhattisgarh             │
│                                     │
│ The Mango Grove                     │
│                                     │
│ 👥 Up to 120 guests · Private       │
│    garden                           │
│                                     │
│ ─────────────────────────────────── │
│ ₹45,000 / day                       │
└─────────────────────────────────────┘

Each card can contain:

Venue image

Category badge

Wishlist/save button

Location

Venue name

Guest capacity

Key feature

Price

Rating if available

Clicking the card:

/venues/[venueId]

9. Dynamic Backend Data

Do not hard-code the complete venue list in the frontend.

Example:

GET /api/venues

Example response:

[
  {
    "id": 1,
    "name": "The Mango Grove",
    "city": "Durg",
    "state": "Chhattisgarh",
    "venue_type": "Farmhouse",
    "capacity": 120,
    "price_per_day": 45000,
    "featured": false,
    "status": "APPROVED",
    "image_url": "..."
  }
]

The frontend renders the returned data.

10. Database Fields

Recommended venue fields:

id
vendor_id

name
description
venue_type

city
state
address

latitude
longitude

capacity
price_per_day

facilities
images

status
show_on_home

created_at
updated_at

Recommended status values:

PENDING
APPROVED
REJECTED

Optional future values:

SUSPENDED
ARCHIVED

11. Visibility Rules

Find Venue

status = APPROVED

Therefore:

PENDING   → hidden
REJECTED  → hidden
APPROVED  → visible

Landing Page

status = APPROVED
AND show_on_home = TRUE

This prevents every new vendor listing from changing the landing page.

12. Admin Controls

Admin should be able to:

Review venue

Approve venue

Reject venue

Edit venue

Suspend venue

Feature venue on Home

Remove venue from Home

Manage venue category

Review images

Review pricing

Review location

Useful admin fields:

Venue Status:
[ APPROVED ]

Show on Home:
[ ON / OFF ]

Vendor should not automatically control landing-page featuring.

13. Example

Vendor adds:

Royal Garden Palace
Raipur
Banquet Hall
Up to 600 guests
₹80,000/day

Initial state:

status = PENDING
show_on_home = FALSE

After admin approval:

status = APPROVED
show_on_home = FALSE

Result:

Find Venue → visible
Landing Page → not visible

If admin later sets:

show_on_home = TRUE

then:

Find Venue → visible
Landing Page → visible

14. Map Integration

Find Venue can include a map.

Desktop:

┌──────────────────────────┬────────────────────────────┐
│       VENUE RESULTS      │            MAP             │
│                          │                            │
│  Venue 1                 │        📍       📍         │
│  Venue 2                 │             📍             │
│  Venue 3                 │    📍                      │
│  Venue 4                 │                   📍       │
└──────────────────────────┴────────────────────────────┘

Recommended split:

40–45% venue results
55–60% map

Use Google Maps when the integration is ready.

Store:

latitude
longitude

for each venue.

15. Mobile

Use a mobile toggle:

[ List ] [ Map ]

Filters can open in:

Bottom sheet

Full-screen filter panel

Do not force the desktop split layout onto mobile.

16. Search and Filtering API

For a small prototype, browser filtering can work temporarily.

For production, send filters to the backend.

Example:

GET /api/venues?city=Raipur&venue_type=Farmhouse&guests=200&min_price=20000&max_price=80000

Use pagination for larger datasets:

GET /api/venues?page=1&limit=24

Example response:

{
  "items": [],
  "page": 1,
  "limit": 24,
  "total": 247,
  "total_pages": 11
}

Recommended initial page size:

24 venues

Use lazy/optimized image loading.

17. Venue Detail Flow

Find Venue
   ↓
Venue Card
   ↓
Venue Detail
   ↓
Select Date
   ↓
Check Availability
   ↓
Select Booking Options
   ↓
Payment
   ↓
Booking Confirmation

Recommended route:

/venues/[id]

18. Navbar

Keep the existing CelebrateCG navbar:

CelebrateCG

Find a venue
Categories
Cities & map
Contact

List your space ↗
Sign in

On Find Venue, give Find a venue a subtle active state.

Do not redesign the navbar.

19. Bottom CTA

Suggested CTA:

CAN'T FIND WHAT YOU'RE LOOKING FOR?

Tell us where and how you want to celebrate.

[ Explore cities ↗ ]

Optional vendor CTA:

HAVE A SPACE TO SHARE?

List your venue on CelebrateCG.

[ List your space ↗ ]

20. API Structure

Possible endpoints:

GET    /api/venues
GET    /api/venues/{id}

POST   /api/vendor/venues
PUT    /api/vendor/venues/{id}
DELETE /api/vendor/venues/{id}

GET    /api/admin/venues
PATCH  /api/admin/venues/{id}/approve
PATCH  /api/admin/venues/{id}/reject
PATCH  /api/admin/venues/{id}/feature

Follow the project's existing FastAPI naming conventions if different.

21. Initial Seed Data

While real vendor onboarding is not complete, seed the database with around 20–40 realistic Chhattisgarh venues for development/testing.

These are only seed/demo records.

Do not create separate frontend logic for demo venues.

The frontend should always consume the same venue API.

Later:

Real vendor listing
      ↓
Admin approval
      ↓
Same API
      ↓
Same Find Venue UI

22. UX Principle

The Find Venue page should feel like:

A premium venue discovery marketplace

not:

An admin dashboard

The user's journey should be obvious:

1. Search a location
2. Select date/guests
3. Filter venues
4. Browse venue cards
5. Open a venue
6. Check availability
7. Book

23. Final Architecture

                         CELEBRATECG
                              │
          ┌───────────────────┼────────────────────┐
          │                   │                    │
        HOME              FIND VENUE           CATEGORIES
          │                   │
          │                   │
   Curated venues       ALL APPROVED
   only                  VENUES
          │                   │
          │             Vendor venues
          │             automatically
          │             appear here
          │
   Admin-controlled
   featured venues

Core rule

Vendor lists venue
       ↓
Admin approves
       ↓
Find Venue page
       ↓
Venue becomes discoverable

Admin marks "Show on Home"
       ↓
Venue can also appear
on the curated landing page

This keeps the existing CelebrateCG landing page premium and controlled while allowing /find-venue to grow into the complete Chhattisgarh venue marketplace.