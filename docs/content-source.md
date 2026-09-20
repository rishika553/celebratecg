# CelebrateCG editorial content and maps

Source: https://celebratecg.in/, reviewed in the browser on 20 September 2026.

The source is a pre-launch landing page announcing New Year's Eve 2026, eight property/service categories, eight launch cities, benefits for three audiences, referral rewards, seven FAQs, contact details, and a live waitlist form.

Imported into `frontend/lib/site-content.ts` and rendered by `frontend/components/site-sections.tsx`. The existing ivory/green theme and venue reservation flow are retained. The eight category images use the exact image URLs displayed on the source site. The existing venue sample photos remain unchanged.

The source's contact email and social handles use **celebrategc**, rather than **celebratecg**. They were preserved exactly: `bookings@celebrategc.com`, social handle `celebrategc`, phone `+91 98930 47100`.

Dynamic countdowns and inconsistent remaining-spot counters were not hard-coded. The source domain is a content reference only: no visitor links lead to it. Calls to action use local venue browsing, account registration, host registration, or the local contact section. Local accounts do not enroll visitors in the separate landing-page waitlist. Benefits and payment/service features not yet implemented locally are described as launch plans. Payment protection/escrow claims were not presented as implemented functionality.

Maps use the same public Google Maps iframe approach seen on the source contact section, without requiring a Maps API key. The home page supports all eight cities, plus a Raipur contact map. Venue pages map the supplied location text. City-level maps are labeled as approximate area views, not verified property pins; the source provides no exact office street address.

Maps load lazily and include an external Google Maps fallback link. No geolocation permission is requested. No forms on the source site were submitted during this update.
