'use client';
import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, CalendarDays, Check, MapPin, Users, X } from 'lucide-react';
import { api, Booking, money, today, Venue } from '@/lib/api';
import { useSession } from '@/components/session';

export default function VenueBookingCard({ venue, onClose }: { venue: Venue; onClose: () => void }) {
  const router = useRouter();
  const { user } = useSession();
  const [error, setError] = useState('');
  const [date, setDate] = useState('');
  const [guests, setGuests] = useState('');
  const [busy, setBusy] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;
    setAvailable(null);
    setError('');
    if (date) {
      api<{ available: boolean }>(`/venues/${venue.id}/availability?day=${date}`)
        .then(result => { if (active) setAvailable(result.available); })
        .catch(e => { if (active) setError((e as Error).message); });
    }
    return () => { active = false; };
  }, [date, venue.id]);

  async function reserve(e: FormEvent) {
    e.preventDefault();
    if (!user) { router.push('/login'); return; }
    setBusy(true);
    setError('');
    try {
      await api<Booking>('/bookings', { method: 'POST', body: JSON.stringify({ venue_id: venue.id, booking_date: date, guest_count: Number(guests) }) });
      router.push('/dashboard');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return <div className="booking-modal" role="dialog" aria-modal="true" aria-labelledby="booking-title" onClick={onClose}>
    <aside className="booking-panel booking-now-card" onClick={e => e.stopPropagation()}>
      <button className="icon-button booking-close" type="button" aria-label="Close booking card" onClick={onClose}><X size={18} /></button>
      <div className="booking-now-media" style={{ backgroundImage: venue.photos[0] ? `url("${venue.photos[0]}")` : undefined }}>
        <span>{venue.category}</span>
      </div>
      <div className="booking-now-summary">
        <p className="location"><MapPin size={14} /> {venue.location_text}</p>
        <h2 id="booking-title">{venue.name}</h2>
        <p><Users size={15} /> Up to {venue.max_guests.toLocaleString('en-IN')} guests</p>
      </div>
      <div className="booking-price"><strong>{money(venue.price_per_day)}</strong><span> / day</span></div>
      <p className="muted">Choose your date and reserve this space directly from here.</p>
      <form onSubmit={reserve}>
        <label><CalendarDays size={15} /> Your celebration date<input type="date" required min={today()} value={date} onChange={e => setDate(e.target.value)} /></label>
        {available !== null && <p className={available ? 'success-text' : 'error-message'}>{available ? 'This date is available.' : 'This date is unavailable. Try another.'}</p>}
        <label><Users size={15} /> Number of guests<input type="number" required min="1" max={venue.max_guests} placeholder={`Up to ${venue.max_guests}`} value={guests} onChange={e => setGuests(e.target.value)} /></label>
        <div className="price-row"><span>Venue · 1 day</span><span>{money(venue.price_per_day)}</span></div>
        {error && <p className="error-message" role="alert">{error}</p>}
        {user && user.role !== 'customer' ? <p className="form-note">Sign in with a customer account to reserve this venue.</p> : <button className="button button-primary full" disabled={busy || available === false || (Boolean(date) && available === null)}>{busy ? 'Reserving...' : user ? 'Reserve this date' : 'Sign in to reserve'}<ArrowRight size={16} /></button>}
        <p className="booking-note"><Check size={14} /> Your date is held for 15 minutes. Complete payment from your dashboard to confirm.</p>
      </form>
    </aside>
  </div>;
}
