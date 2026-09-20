import Link from 'next/link';
import { ArrowUpRight, MapPin, Users } from 'lucide-react';
import { money, Venue } from '@/lib/api';
export default function VenueCard({ venue }: { venue: Venue }) {
  return <Link href={`/venues/${venue.id}`} className="venue-card"><div className="card-image" style={{ backgroundImage: venue.photos[0] ? `url("${venue.photos[0]}")` : undefined }}><span className="category-badge">{venue.category}</span><span className="card-arrow"><ArrowUpRight size={19} /></span></div><div className="card-body"><p className="location"><MapPin size={13} /> {venue.location_text}</p><h3>{venue.name}</h3><p className="capacity"><Users size={14} /> Up to {venue.max_guests.toLocaleString('en-IN')} guests <span>·</span> {venue.facilities[0] || 'Private venue'}</p><div className="card-bottom"><span><strong>{money(venue.price_per_day)}</strong><span className="muted"> / day</span></span><span className="view-link">Explore venue <ArrowUpRight size={14} /></span></div></div></Link>;
}
