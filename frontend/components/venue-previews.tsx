'use client';
import { useState } from 'react';
import { ArrowUpRight, MapPin } from 'lucide-react';
import { categories } from '@/lib/site-content';
import VenueBookingCard, { BookingCardVenue } from '@/components/venue-booking-card';

export default function VenuePreviews() {
  const [bookingVenue, setBookingVenue] = useState<BookingCardVenue | null>(null);
  function enquire(category: typeof categories[number]) {
    setBookingVenue({ id: `preview-${category.slug}`, name: category.name, category: category.name,
      location_text: 'Across Chhattisgarh', photos: [`https://images.hostinger.com/${category.image}.png`] });
  }
  return <div>
    <p className="venue-preview-note">Explore popular venue styles and send us your date and guest count for matching options.</p>
    <div className="venue-grid">
      {categories.slice(0, 6).map(category => <article className="venue-card" key={category.slug}>
        <div className="card-image">
          <img className="card-image-media venue-preview-image" src={`https://images.hostinger.com/${category.image}.png`}
            alt={`${category.name} inspiration for your next celebration`} width={900} height={600} loading="lazy" decoding="async" />
          <span className="category-badge">{category.name}</span>
        </div>
        <div className="card-body">
          <p className="location"><MapPin size={13} /> Across Chhattisgarh</p>
          <h3>{category.name}</h3>
          <p className="capacity">{category.description}</p>
          <div className="card-bottom"><span className="muted">Options across CG</span><button type="button" className="view-link" onClick={() => enquire(category)} aria-haspopup="dialog">Enquire <ArrowUpRight size={15} /></button></div>
        </div>
      </article>)}
    </div>
    {bookingVenue && <VenueBookingCard venue={bookingVenue} preview onClose={() => setBookingVenue(null)} />}
  </div>;
}
