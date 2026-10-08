'use client';
import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, CalendarDays, Check, MapPin, Minus, Plus, Users, X } from 'lucide-react';
import { api, Booking, money, today, Venue } from '@/lib/api';
import { useSession } from '@/components/session';
import { site } from '@/lib/site-content';

export type BookingCardVenue = Pick<Venue, 'id' | 'name' | 'photos' | 'category' | 'location_text'> & Partial<Pick<Venue, 'max_guests' | 'price_per_day'>>;

function daysBetween(start: string, end: string) {
  if (!start || !end) return 1;
  const diff = Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / 86400000);
  return diff > 0 ? diff : 1;
}

export default function VenueBookingCard({ venue, onClose, preview = false }: { venue: BookingCardVenue; onClose: () => void; preview?: boolean }) {
  const router = useRouter();
  const { user } = useSession();
  const [error, setError] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [guests, setGuests] = useState(1);
  const [busy, setBusy] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const maxGuests = venue.max_guests ?? 10000;
  const days = daysBetween(startDate, endDate);

  useEffect(() => {
    let active = true;
    setAvailable(null);
    setError('');
    if (startDate && !preview) {
      api<{ available: boolean }>(`/venues/${venue.id}/availability?day=${startDate}`)
        .then(result => { if (active) setAvailable(result.available); })
        .catch(e => { if (active) setError((e as Error).message); });
    }
    return () => { active = false; };
  }, [startDate, venue.id, preview]);

  function adjustGuests(delta: number) {
    setGuests(prev => {
      const next = prev + delta;
      if (next < 1) return 1;
      if (!preview && next > maxGuests) return maxGuests;
      return next;
    });
  }

  async function reserve(e: FormEvent) {
    e.preventDefault();
    if (preview) {
      const dateRange = endDate && endDate !== startDate ? `${startDate} to ${endDate}` : startDate;
      const message = `Hello CelebrateCG, I'd like to enquire about booking ${venue.name} from ${dateRange} for ${guests} guests. Please share available venues and prices.`;
      window.open(`${site.whatsapp}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
      return;
    }
    if (!user) { router.push('/login'); return; }
    setBusy(true);
    setError('');
    try {
      await api<Booking>('/bookings', { method: 'POST', body: JSON.stringify({ venue_id: venue.id, booking_date: startDate, guest_count: guests }) });
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
        <p><Users size={15} /> {preview ? 'Preview - Availability to be confirmed' : `Up to ${venue.max_guests?.toLocaleString('en-IN')} guests`}</p>
      </div>
      <div className="booking-price"><strong>{preview ? 'Request a quote' : money(venue.price_per_day ?? '0')}</strong>{!preview && <span> / day</span>}</div>
      <p className="muted">{preview ? 'Choose your dates and guests to enquire about a reservation. This preview is not a confirmed venue listing.' : 'Choose your dates and reserve this space directly from here.'}</p>
      <form onSubmit={reserve}>
        <label className="booking-dates-label"><CalendarDays size={15} /> Celebration dates</label>
        <div className="booking-date-range">
          <input type="date" required min={today()} value={startDate} onChange={e => { setStartDate(e.target.value); if (endDate && e.target.value > endDate) setEndDate(e.target.value); }} aria-label="Start date" />
          <span className="date-separator">to</span>
          <input type="date" required min={startDate || today()} value={endDate} onChange={e => setEndDate(e.target.value)} aria-label="End date" />
        </div>
        {available !== null && <p className={available ? 'success-text' : 'error-message'}>{available ? 'Start date is available.' : 'Start date is unavailable. Try another.'}</p>}
        <label className="booking-dates-label"><Users size={15} /> Guests</label>
        <div className="guest-counter">
          <button type="button" className="guest-btn" onClick={() => adjustGuests(-1)} disabled={guests <= 1} aria-label="Decrease guests"><Minus size={14} /></button>
          <input type="number" required min="1" max={preview ? undefined : maxGuests} value={guests} onChange={e => setGuests(Math.max(1, Number(e.target.value) || 1))} className="guest-input" />
          <button type="button" className="guest-btn" onClick={() => adjustGuests(1)} disabled={!preview && guests >= maxGuests} aria-label="Increase guests"><Plus size={14} /></button>
        </div>
        {!preview && <div className="price-row"><span>{`Venue - ${days} ${days === 1 ? 'day' : 'days'}`}</span><span>{money(Number(venue.price_per_day ?? 0) * days)}</span></div>}
        {error && <p className="error-message" role="alert">{error}</p>}
        {!preview && user && user.role !== 'customer' ? <p className="form-note">Sign in with a customer account to reserve this venue.</p> : <button className="button button-primary full" disabled={busy || (!preview && (available === false || (Boolean(startDate) && available === null)))}>{preview ? 'Send booking enquiry' : busy ? 'Reserving...' : user ? 'Reserve this date' : 'Sign in to reserve'}<ArrowRight size={16} /></button>}
        <p className="booking-note"><Check size={14} /> {preview ? 'Opens WhatsApp with your enquiry. Availability and price must be confirmed before booking.' : 'Your date is held for 15 minutes. Complete payment from your dashboard to confirm.'}</p>
      </form>
    </aside>
  </div>;
}
