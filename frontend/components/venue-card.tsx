'use client';
import Link from 'next/link';
import { Heart, MapPin, Users } from 'lucide-react';
import { money, Venue } from '@/lib/api';

export default function VenueCard({ venue, saved = false, saving = false, onToggleSave }: {
  venue: Venue;
  saved?: boolean;
  saving?: boolean;
  onToggleSave?: (venue: Venue) => void;
}) {
  return <article className="venue-card">
    <div className="card-image">
      <span className="card-image-media" aria-hidden="true" style={{ backgroundImage: venue.photos[0] ? `url("${venue.photos[0]}")` : undefined }} />
      <Link href={`/venues/${venue.id}`} className="card-image-link" aria-label={`View ${venue.name}`} />
      <span className="category-badge">{venue.category}</span>
      <button className={`save-button ${saved ? 'saved' : ''}`} type="button" aria-label={saved ? `Remove ${venue.name} from saved venues` : `Save ${venue.name}`} aria-pressed={saved} disabled={saving} onClick={() => onToggleSave?.(venue)}>
        <Heart size={17} fill={saved ? 'currentColor' : 'none'} /> <span>{saved ? 'Saved' : 'Save'}</span>
      </button>
    </div>
    <Link href={`/venues/${venue.id}`} className="card-content-link"><div className="card-body"><p className="location"><MapPin size={13} /> {venue.location_text}</p><h3>{venue.name}</h3><p className="capacity"><Users size={14} /> Up to {venue.max_guests.toLocaleString('en-IN')} guests <span>·</span> {venue.facilities[0] || 'Private venue'}</p><div className="card-bottom"><span><strong>{money(venue.price_per_day)}</strong><span className="muted"> / day</span></span></div></div></Link>
  </article>;
}
