'use client';
import { useState } from 'react';
import { ArrowUpRight, MapPin } from 'lucide-react';
import { categories } from '@/lib/site-content';
import VenueBookingCard, { BookingCardVenue } from '@/components/venue-booking-card';

export default function VenuePreviews() {
  const [bookingVenue, setBookingVenue] = useState<BookingCardVenue | null>(null);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(() => new Set());
  function enquire(category: typeof categories[number]) {
    setBookingVenue({ id: `preview-${category.slug}`, name: category.name, category: category.name,
      location_text: 'Across Chhattisgarh', photos: [`https://images.hostinger.com/${category.image}.png`] });
  }
  return <div>
    <p className="venue-preview-note">Explore popular venue styles and send us your date and guest count for matching options.</p>
    <div className="venue-grid">
      {categories.slice(0, 6).map(category => <button type="button" className={`venue-card venue-preview-card ${loadedImages.has(category.slug) ? 'image-loaded' : 'image-loading'}`} key={category.slug} onClick={() => enquire(category)} aria-label={`Enquire about ${category.name}`} aria-haspopup="dialog" aria-busy={!loadedImages.has(category.slug)}>
        <div className="card-image">
          <img className="card-image-media venue-preview-image" src={`https://images.hostinger.com/${category.image}.png`}
            alt={`${category.name} inspiration for your next celebration`} width={900} height={600} loading="lazy" decoding="async" onLoad={() => setLoadedImages(current => new Set(current).add(category.slug))} />
          <span className="card-badge-stack"><span className="category-badge">{category.name}</span>{['resort', 'banquet-hall', 'lawn'].includes(category.slug) && <span className="market-badge">Great for weddings</span>}</span>
        </div>
        <div className="card-body">
          <p className="location"><MapPin size={13} /> Across Chhattisgarh</p>
          <h3>{category.name}</h3>
          <p className="capacity">{category.description}</p>
          <div className="card-bottom"><span className="muted">Options across CG</span><span className="view-link">Enquire <ArrowUpRight size={15} /></span></div>
        </div>
      </button>)}
    </div>
    {bookingVenue && <VenueBookingCard venue={bookingVenue} preview onClose={() => setBookingVenue(null)} />}
  </div>;
}
