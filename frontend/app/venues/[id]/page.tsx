'use client';
import { FormEvent, use, useEffect, useState } from 'react';
import Link from 'next/link';
import LocationMap from '@/components/location-map';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Check, Heart, MapPin, ShieldCheck, Users } from 'lucide-react';
import { api, Booking, money, OfferValidation, today, Venue } from '@/lib/api';
import { useSession } from '@/components/session';
export default function VenuePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useSession();
  const [venue, setVenue] = useState<Venue | null>(null);
  const [error, setError] = useState('');
  const [date, setDate] = useState('');
  const [guests, setGuests] = useState('');
  const [busy, setBusy] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [offerCode, setOfferCode] = useState('');
  const [offerResult, setOfferResult] = useState<OfferValidation | null>(null);
  const [offerBusy, setOfferBusy] = useState(false);
  useEffect(() => { api<Venue>(`/venues/${id}`).then(setVenue).catch(e => setError(e.message)); }, [id]);
  useEffect(() => { if (user?.role === 'customer') api<string[]>('/favourites/ids').then(ids => setSaved(ids.includes(id))).catch(() => {}); else setSaved(false); }, [id, user]);
  useEffect(() => { let active = true; setAvailable(null); if (date) api<{ available: boolean }>(`/venues/${id}/availability?day=${date}`).then(r => { if (active) setAvailable(r.available); }).catch(e => { if (active) setError(e.message); }); return () => { active = false; }; }, [id, date]);
  async function reserve(e: FormEvent) {
    e.preventDefault(); if (!user) { router.push('/login'); return; }
    setBusy(true); setError('');
    try { await api<Booking>('/bookings', { method: 'POST', body: JSON.stringify({ venue_id: id, booking_date: date, guest_count: Number(guests), offer_code: offerResult?.offer.code || undefined }) }); router.push('/dashboard'); } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  }
  async function applyOffer() {
    if (!offerCode.trim()) { setOfferResult(null); return; }
    setOfferBusy(true); setError('');
    try { setOfferResult(await api<OfferValidation>('/offers/validate', { method: 'POST', body: JSON.stringify({ venue_id: id, code: offerCode }) })); }
    catch (e) { setOfferResult(null); setError((e as Error).message); } finally { setOfferBusy(false); }
  }
  async function toggleSave() {
    if (!user) { router.push('/login'); return; }
    if (user.role !== 'customer') { setError('Sign in with a customer account to save venues.'); return; }
    setSaving(true); setError('');
    try { await api(`/favourites/${id}`, { method: saved ? 'DELETE' : 'POST' }); setSaved(!saved); }
    catch (e) { setError((e as Error).message); } finally { setSaving(false); }
  }
  if (!venue) return <main className="section loading-page">{error ? <p role="alert">{error}</p> : 'Getting your venue ready…'}<Link href="/">Back to venues</Link></main>;
  return <main className="section detail-page"><Link className="back-link" href="/#venues"><ArrowLeft size={16} /> All venues</Link><div className="detail-title"><div><span className="eyebrow">{venue.category}</span><h1>{venue.name}</h1><p className="location"><MapPin size={16} /> {venue.location_text} <span>·</span><Users size={16} /> Up to {venue.max_guests} guests</p></div><div className="detail-actions"><span className="verified"><ShieldCheck size={17} /> Listing approved</span><button className={`button save-detail ${saved ? 'saved' : ''}`} type="button" aria-pressed={saved} disabled={saving || Boolean(user && user.role !== 'customer')} title={user && user.role !== 'customer' ? 'Use a customer account to save venues.' : undefined} onClick={() => void toggleSave()}><Heart size={17} fill={saved ? 'currentColor' : 'none'} /> {saving ? 'Saving…' : saved ? 'Saved' : 'Save venue'}</button></div></div><div className="detail-photos">{venue.photos.length ? venue.photos.slice(0, 2).map((p, i) => <img key={p} src={p} alt={`${venue.name}, view ${i + 1}`} />) : <div className="photo-placeholder">A space for your next chapter.</div>}</div><div className="detail-grid"><div className="detail-info"><h2>Make a little room for something special.</h2><p>{venue.description}</p><hr /><h3>What’s waiting for you</h3><div className="facilities">{venue.facilities.map(f => <span key={f}><Check size={16} /> {f}</span>)}</div><hr /><h3>A few things to know</h3><p>{venue.rules || 'Contact your host for venue rules.'}</p><h3>Cancellation terms</h3><p>{venue.cancellation_policy || 'Contact your host for cancellation terms.'}</p><hr /><h3>Explore the location</h3><LocationMap location={venue.location_text} title={`Area map for ${venue.name}`} note="Map based on the listed location. Confirm the exact property address with your host." /></div><aside className="booking-panel"><div className="booking-price"><strong>{money(offerResult?.final_amount || venue.price_per_day)}</strong><span> / day</span></div><p className="muted">One beautiful space. All yours for the day.</p><form onSubmit={reserve}><label>Your celebration date<input type="date" required min={today()} value={date} onChange={e => setDate(e.target.value)} /></label>{available !== null && <p className={available ? 'success-text' : 'error-message'}>{available ? 'This date is available.' : 'This date is unavailable. Try another.'}</p>}<label>Number of guests<input type="number" required min="1" max={venue.max_guests} placeholder={`Up to ${venue.max_guests}`} value={guests} onChange={e => setGuests(e.target.value)} /></label><label>Offer code<div className="offer-apply"><input value={offerCode} placeholder="Enter code" onChange={e => { setOfferCode(e.target.value.toUpperCase()); setOfferResult(null); }} /><button className="button button-outline small" type="button" disabled={offerBusy || !offerCode.trim()} onClick={() => void applyOffer()}>{offerBusy ? 'Checking…' : 'Apply'}</button></div></label>{offerResult && <p className="success-text">{offerResult.offer.code} applied · you save {money(offerResult.discount_amount)}</p>}<div className="price-row"><span>Venue · 1 day</span><span>{money(offerResult?.base_amount || venue.price_per_day)}</span></div>{offerResult && <><div className="price-row offer-discount"><span>Offer · {offerResult.offer.code}</span><span>−{money(offerResult.discount_amount)}</span></div><div className="price-row offer-total"><strong>Total</strong><strong>{money(offerResult.final_amount)}</strong></div></>}{error && <p className="error-message" role="alert">{error}</p>}{user && user.role !== 'customer' ? <p className="form-note">Sign in with a customer account to reserve this venue.</p> : <button className="button button-primary full" disabled={busy || available === false || (Boolean(date) && available === null)}>{busy ? 'Reserving…' : user ? 'Reserve this date' : 'Sign in to reserve'}<ArrowRight size={16} /></button>}<p className="booking-note">Your date is held for 15 minutes. Complete payment from your dashboard to confirm.</p></form></aside></div></main>;
}
