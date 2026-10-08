'use client';

import { useState } from 'react';
import { ArrowUpRight, ChevronLeft, ChevronRight, MapPin, Sparkles, Users } from 'lucide-react';
import { money, Venue } from '@/lib/api';

export default function VenueCard({ venue, onBook }: {
  venue: Venue;
  onBook?: (venue: Venue) => void;
}) {
  const [photoIndex, setPhotoIndex] = useState(0);
  const photos = venue.photos?.length ? venue.photos : [];
  
  const signals = [
    venue.approval_status === 'approved' ? 'Verified' : '',
    ['resort', 'banquet-hall', 'lawn'].includes(venue.category_slug) ? 'Wedding favorite' : '',
  ].filter(Boolean);

  function prevPhoto(e: React.MouseEvent) {
    e.stopPropagation();
    setPhotoIndex((i) => (i === 0 ? photos.length - 1 : i - 1));
  }

  function nextPhoto(e: React.MouseEvent) {
    e.stopPropagation();
    setPhotoIndex((i) => (i === photos.length - 1 ? 0 : i + 1));
  }

  return (
    <article className="venue-card">
      <div className="card-image">
        <span
          className="card-image-media"
          aria-hidden="true"
          style={{ backgroundImage: photos[photoIndex] ? `url("${photos[photoIndex]}")` : undefined }}
        />
        <button
          type="button"
          className="card-image-link"
          aria-label={`Book ${venue.name}`}
          onClick={() => onBook?.(venue)}
        />
        
        <span className="card-badge-stack">
          <span className="category-badge">{venue.category}</span>
          {signals.map((signal) => (
            <span className="market-badge" key={signal}>
              {signal === 'Verified' && <Sparkles size={11} />} {signal}
            </span>
          ))}
        </span>

        {photos.length > 1 && (
          <div className="card-photo-controls" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="photo-nav-button photo-prev"
              onClick={prevPhoto}
              aria-label="Previous photo"
            >
              <ChevronLeft size={16} />
            </button>
            <div className="photo-dots">
              {photos.slice(0, 5).map((_, idx) => (
                <span
                  key={idx}
                  className={`photo-dot ${idx === photoIndex ? 'active' : ''}`}
                />
              ))}
            </div>
            <button
              type="button"
              className="photo-nav-button photo-next"
              onClick={nextPhoto}
              aria-label="Next photo"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      <button type="button" className="card-content-link" onClick={() => onBook?.(venue)}>
        <div className="card-body">
          <p className="location">
            <MapPin size={13} /> {venue.location_text}
          </p>
          <h3>{venue.name}</h3>

          {venue.facilities && venue.facilities.length > 0 && (
            <div className="card-facilities">
              {venue.facilities.slice(0, 3).map((f) => (
                <span className="facility-pill" key={f}>
                  {f}
                </span>
              ))}
            </div>
          )}

          <p className="capacity">
            <Users size={14} /> Up to {venue.max_guests.toLocaleString('en-IN')} guests
          </p>

          <div className="card-bottom">
            <span>
              <strong>{money(venue.price_per_day)}</strong>
              <span className="muted"> / day</span>
            </span>
            <span className="view-link">
              Book now <ArrowUpRight size={15} />
            </span>
          </div>
        </div>
      </button>
    </article>
  );
}
