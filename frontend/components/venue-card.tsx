'use client';
import { MapPin, Users } from 'lucide-react';
import { money, Venue } from '@/lib/api';

export default function VenueCard({ venue, onBook }: {
  venue: Venue;
  onBook?: (venue: Venue) => void;
}) {
  return <article className="venue-card">
    <div className="card-image">
      <span className="card-image-media" aria-hidden="true" style={{ backgroundImage: venue.photos[0] ? `url("${venue.photos[0]}")` : undefined }} />
      <button type="button" className="card-image-link" aria-label={`Book ${venue.name}`} onClick={() => onBook?.(venue)} />
      <span className="category-badge">{venue.category}</span>
    </div>
    <button type="button" className="card-content-link" onClick={() => onBook?.(venue)}><div className="card-body"><p className="location"><MapPin size={13} /> {venue.location_text}</p><h3>{venue.name}</h3><p className="capacity"><Users size={14} /> Up to {venue.max_guests.toLocaleString('en-IN')} guests</p><div className="card-bottom"><span><strong>{money(venue.price_per_day)}</strong><span className="muted"> / day</span></span><span className="view-link">Book now</span></div></div></button>
  </article>;
}
