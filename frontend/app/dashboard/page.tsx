'use client';
import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowDown, ArrowRight, ArrowUp, CalendarDays, LogOut, Plus, Building2, Check, Heart, ImagePlus, Percent, Trash2, X } from 'lucide-react';
import { api, Booking, Category, dateLabel, money, Offer, today, User, Venue } from '@/lib/api';
import { checkout } from '@/lib/checkout';
import { useSession } from '@/components/session';
import VenueCard from '@/components/venue-card';

type Overview = { users: number; venues: number; bookings: number; vendors: User[]; listings: Venue[]; refunds_to_review: { payment_id: string; amount: string }[] };
export default function Dashboard() {
  const { user, loading, refresh, health } = useSession();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [favourites, setFavourites] = useState<Venue[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Venue | null>(null);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [tab, setTab] = useState('bookings');
  async function load() {
    if (!user) return;
    try {
      setBookings(await api<Booking[]>('/bookings'));
      if (user.role === 'customer') setFavourites(await api<Venue[]>('/favourites'));
      if (user.role === 'vendor' && user.approval_status === 'approved') { setVenues(await api<Venue[]>('/vendor/venues')); setCategories(await api<Category[]>('/categories')); }
      if (user.role === 'admin') { setOverview(await api<Overview>('/admin/overview')); setOffers(await api<Offer[]>('/admin/offers')); }
    } catch (e) { setError((e as Error).message); } finally { setLoaded(true); }
  }
  useEffect(() => { void load(); }, [user]);
  async function action(fn: () => Promise<unknown>, success: string) { setBusy(true); setError(''); setMessage(''); try { await fn(); setMessage(success); await load(); } catch (e) { setError((e as Error).message); } finally { setBusy(false); } }
  async function saveVenue(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const photos = data.getAll('photos').filter((file): file is File => file instanceof File && file.size > 0);
    data.delete('photos');
    const form = Object.fromEntries(data);
    await action(async () => {
      const saved = await api<Venue>(`/vendor/venues${editing ? `/${editing.id}` : ''}`, { method: editing ? 'PUT' : 'POST', body: JSON.stringify({ ...form, price_per_day: form.price_per_day, max_guests: Number(form.max_guests), facilities: String(form.facilities).split(',').map(s => s.trim()).filter(Boolean) }) });
      if (photos.length) {
        if (saved.photo_items.length + photos.length > 10) throw new Error('A venue can have up to 10 photos.');
        if (photos.some(file => file.size > 8 * 1024 * 1024)) throw new Error('Each photo must be 8 MB or smaller.');
        const upload = new FormData(); photos.forEach(file => upload.append('files', file));
        await api(`/vendor/venues/${saved.id}/photos`, { method: 'POST', body: upload });
      }
      setShowForm(false); setEditing(null);
    }, 'Your venue and photos have been submitted for admin approval.');
  }
  async function reorderPhotos(venue: Venue, index: number, direction: -1 | 1) {
    const photos = [...venue.photo_items];
    const target = index + direction;
    if (target < 0 || target >= photos.length) return;
    [photos[index], photos[target]] = [photos[target], photos[index]];
    await action(() => api(`/vendor/venues/${venue.id}/photos/order`, { method: 'PUT', body: JSON.stringify({ photo_ids: photos.map(photo => photo.id) }) }), 'Photo order updated and submitted for admin approval.');
  }
  async function removeFavourite(venue: Venue) {
    await action(() => api(`/favourites/${venue.id}`, { method: 'DELETE' }), `${venue.name} removed from your saved venues.`);
  }
  async function saveOffer(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const usageLimit = String(data.get('usage_limit') || '').trim();
    const payload = {
      code: data.get('code'), name: data.get('name'), discount_type: data.get('discount_type'), discount_value: data.get('discount_value'),
      starts_at: new Date(String(data.get('starts_at'))).toISOString(), expires_at: new Date(String(data.get('expires_at'))).toISOString(),
      minimum_booking_amount: data.get('minimum_booking_amount'), usage_limit: usageLimit ? Number(usageLimit) : null, is_active: data.get('is_active') === 'on'
    };
    await action(async () => { await api(`/admin/offers${editingOffer ? `/${editingOffer.id}` : ''}`, { method: editingOffer ? 'PUT' : 'POST', body: JSON.stringify(payload) }); setShowOfferForm(false); setEditingOffer(null); }, editingOffer ? 'Offer updated.' : 'Offer created.');
  }
  if (loading) return <main className="section loading-page">Opening your dashboard…</main>;
  if (!user) return <main className="section empty-state"><h1>Your celebrations live here.</h1><p>Sign in to view your bookings and manage your account.</p><Link href="/login" className="button button-primary">Sign in <ArrowRight size={16} /></Link></main>;
  return <main className="section dashboard"><div className="dashboard-heading"><div><span className="eyebrow">YOUR {user.role === 'customer' ? 'CELEBRATION' : user.role.toUpperCase()} SPACE</span><h1>Hello, {user.name.split(' ')[0]}<span className="orange">.</span></h1><p className="muted">{user.role === 'customer' ? 'A little less planning. A lot more to look forward to.' : 'Keep your spaces and celebrations in good company.'}</p></div><button className="button button-outline small" onClick={() => void action(async () => { await api('/auth/logout', { method: 'POST' }); await refresh(); }, '')}><LogOut size={15} /> Sign out</button></div>
    {error && <p className="error-message" role="alert">{error}</p>}{message && <p className="success-message" role="status">{message}</p>}
    {user.role === 'vendor' && user.approval_status !== 'approved' ? <div className="empty-state"><Building2 size={32} /><h2>{user.approval_status === 'rejected' ? 'Your account needs review.' : 'Your next chapter is almost here.'}</h2><p>{user.approval_status === 'rejected' ? 'Your vendor application was not approved. Contact the platform administrator.' : 'An admin will review your host account. Once approved, you can start adding your venues.'}</p><button className="button button-outline" onClick={() => void refresh()}>Check approval status</button></div> : <>
    {overview && <div className="stats-grid"><div><span>People on the platform</span><strong>{overview.users}</strong></div><div><span>Venue listings</span><strong>{overview.venues}</strong></div><div><span>Reservations</span><strong>{overview.bookings}</strong></div></div>}
    <div className="dashboard-tabs"><button className={tab === 'bookings' ? 'active' : ''} onClick={() => setTab('bookings')}>Bookings</button>{user.role === 'customer' && <button className={tab === 'saved' ? 'active' : ''} onClick={() => setTab('saved')}>Saved venues{favourites.length ? ` (${favourites.length})` : ''}</button>}{user.role === 'vendor' && <button className={tab === 'venues' ? 'active' : ''} onClick={() => setTab('venues')}>My venues</button>}{user.role === 'admin' && <><button className={tab === 'approvals' ? 'active' : ''} onClick={() => setTab('approvals')}>Approvals & reviews</button><button className={tab === 'offers' ? 'active' : ''} onClick={() => setTab('offers')}>Offers</button></>}</div>
    {tab === 'bookings' && <><div className="section-heading"><h2>{user.role === 'customer' ? 'Your upcoming memories' : 'Venue reservations'}</h2><button className="text-button" disabled={busy} onClick={() => void load()}>Refresh</button></div>{!loaded ? <p>Loading bookings…</p> : !bookings.length ? <div className="empty-state"><CalendarDays size={32} /><h3>Room for something wonderful.</h3><p>{user.role === 'customer' ? 'Your first celebration starts with finding the right space.' : 'Reservations will appear here when customers book your spaces.'}</p><Link className="button button-primary" href="/#venues">Explore venues <ArrowRight size={16} /></Link></div> : <div className="booking-list">{bookings.map(b => <article className="booking-item" key={b.id}><div className="booking-calendar"><CalendarDays size={24} /></div><div className="booking-item-main"><Link href={`/venues/${b.venue_id}`}><h3>{b.venue_name}</h3></Link><p>{dateLabel(b.booking_date)} <span>·</span> {b.guest_count} guests</p><small>Reference {b.id.slice(0, 8).toUpperCase()}</small>{b.status === 'pending' && <small>Hold ends {new Date(b.expires_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</small>}</div><div className="booking-item-end"><span className={`status ${b.status}`}>{b.status === 'pending' ? 'Awaiting payment' : b.status}</span><strong>{money(b.total_amount)}</strong>{user.role === 'customer' && b.status === 'pending' && <div className="row-actions"><button className="text-button" disabled={busy} onClick={() => void action(() => api(`/bookings/${b.id}/cancel`, { method: 'POST' }), 'Reservation cancelled.')}>Cancel</button><button className="button button-primary small" disabled={busy || !health?.payments_enabled} title={!health?.payments_enabled ? 'Razorpay is not connected yet.' : undefined} onClick={() => void action(async () => { const result = await checkout(b.id); if (result.requires_refund) throw new Error('Payment received after the hold ended. An admin must review your refund.'); }, 'Payment received. Your venue is confirmed!')}>{health?.payments_enabled ? 'Complete payment' : 'Payment not connected'}</button></div>}</div></article>)}</div>}</>}
    {tab === 'saved' && user.role === 'customer' && <><div className="section-heading"><h2>Saved venues</h2><Link className="text-button" href="/#venues">Find more spaces <ArrowRight size={14} /></Link></div>{!loaded ? <p>Loading saved venues…</p> : favourites.length ? <div className="venue-grid saved-venue-grid">{favourites.map(venue => <VenueCard key={venue.id} venue={venue} saved saving={busy} onToggleSave={removeFavourite} />)}</div> : <div className="empty-state"><Heart size={32} /><h3>Save a place that feels right.</h3><p>Your favourite venues will stay private and appear here.</p><Link className="button button-primary" href="/#venues">Explore venues <ArrowRight size={16} /></Link></div>}</>}
    {tab === 'venues' && <><div className="section-heading"><h2>Your spaces</h2><button className="button button-primary small" onClick={() => { setEditing(null); setShowForm(!showForm); }}><Plus size={16} /> Add a venue</button></div>{showForm && <form className="venue-form panel" onSubmit={saveVenue} key={editing?.id || 'new'}><h3>{editing ? 'Edit your venue' : 'Tell us about your space'}</h3><p className="muted">New listings, edits, and photo changes require admin approval.</p><div className="form-grid"><label>Venue name<input name="name" defaultValue={editing?.name} required minLength={3} maxLength={200} /></label><label>Category<select name="category_id" defaultValue={editing?.category_id} required>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label><label>City / location<input name="location_text" defaultValue={editing?.location_text} required /></label><label>Price per day (₹)<input name="price_per_day" type="number" min="1" step="0.01" defaultValue={editing?.price_per_day} required /></label><label>Maximum guests<input name="max_guests" type="number" min="1" defaultValue={editing?.max_guests} required /></label><label>Add venue photos<input name="photos" type="file" accept="image/jpeg,image/png,image/webp" multiple /><small>JPEG, PNG or WebP · maximum 8 MB each · up to 10 photos</small></label></div><label>Description<textarea name="description" minLength={20} maxLength={10000} defaultValue={editing?.description} required rows={4} /></label><label>Facilities, separated by commas<input name="facilities" defaultValue={editing?.facilities.join(', ')} placeholder="Parking, Air conditioning, Bridal suite" /></label><label>Venue rules<textarea name="rules" defaultValue={editing?.rules} rows={2} /></label><label>Cancellation terms<textarea name="cancellation_policy" defaultValue={editing?.cancellation_policy} required rows={2} /></label><div className="row-actions"><button className="button button-primary" disabled={busy}><ImagePlus size={16} /> Submit for approval</button><button type="button" className="text-button" onClick={() => setShowForm(false)}>Close</button></div></form>}<div className="vendor-list">{venues.map(v => <article className="panel" key={v.id}><div className="section-heading"><div><h3>{v.name}</h3><p className="muted">{v.location_text} · {money(v.price_per_day)} / day</p></div><span className={`status ${v.approval_status}`}>{v.approval_status}</span></div>{v.photo_items.length > 0 && <div className="photo-manager">{v.photo_items.map((photo, index) => <div key={photo.id}><img src={photo.url} alt={`${v.name} photo ${index + 1}`} /><span>Photo {index + 1}</span><div><button type="button" disabled={busy || index === 0} aria-label={`Move photo ${index + 1} up`} onClick={() => void reorderPhotos(v, index, -1)}><ArrowUp size={14} /></button><button type="button" disabled={busy || index === v.photo_items.length - 1} aria-label={`Move photo ${index + 1} down`} onClick={() => void reorderPhotos(v, index, 1)}><ArrowDown size={14} /></button><button type="button" disabled={busy} aria-label={`Remove photo ${index + 1}`} onClick={() => void action(() => api(`/vendor/venues/${v.id}/photos/${photo.id}`, { method: 'DELETE' }), 'Photo removed and listing submitted for admin approval.')}><Trash2 size={14} /></button></div></div>)}</div>}<button className="text-button" onClick={() => { setEditing(v); setShowForm(true); window.scrollTo({ top: 100, behavior: 'smooth' }); }}>Edit listing or add photos</button><form className="availability-form" onSubmit={e => { e.preventDefault(); const form = new FormData(e.currentTarget); void action(() => api(`/vendor/venues/${v.id}/availability`, { method: 'PUT', body: JSON.stringify({ date: form.get('date'), is_available: form.get('available') === 'true' }) }), 'Availability updated.'); }}><label>Date<input aria-label={`Availability date for ${v.name}`} name="date" type="date" min={today()} required /></label><label>Availability<select name="available"><option value="false">Block date</option><option value="true">Open date</option></select></label><button className="button button-outline small" disabled={busy}>Save</button></form></article>)}</div></>}
    {tab === 'offers' && user.role === 'admin' && <>
      <div className="section-heading"><div><h2>Offers & discounts</h2><p className="muted">Create codes and control exactly when customers can use them.</p></div><button className="button button-primary small" onClick={() => { setEditingOffer(null); setShowOfferForm(true); }}><Plus size={16} /> New offer</button></div>
      {showOfferForm && <form className="offer-form panel" onSubmit={saveOffer} key={editingOffer?.id || 'new-offer'}>
        <div className="section-heading"><div><h3>{editingOffer ? 'Edit offer' : 'Create an offer'}</h3><p className="muted">Discount eligibility and totals are always checked by the server.</p></div><button className="icon-button" type="button" aria-label="Close offer form" onClick={() => { setShowOfferForm(false); setEditingOffer(null); }}><X size={18} /></button></div>
        <div className="form-grid">
          <label>Offer code<input name="code" defaultValue={editingOffer?.code} required minLength={2} maxLength={40} placeholder="CELEBRATE20" /></label>
          <label>Offer name<input name="name" defaultValue={editingOffer?.name} required minLength={2} maxLength={120} placeholder="Celebration season" /></label>
          <label>Discount type<select name="discount_type" defaultValue={editingOffer?.discount_type || 'percentage'}><option value="percentage">Percentage</option><option value="fixed">Fixed amount</option></select></label>
          <label>Discount value<input name="discount_value" type="number" min="0.01" step="0.01" defaultValue={editingOffer?.discount_value} required /></label>
          <label>Starts at<input name="starts_at" type="datetime-local" defaultValue={dateTimeValue(editingOffer?.starts_at)} required /></label>
          <label>Expires at<input name="expires_at" type="datetime-local" defaultValue={dateTimeValue(editingOffer?.expires_at)} required /></label>
          <label>Minimum booking amount (₹)<input name="minimum_booking_amount" type="number" min="0" step="0.01" defaultValue={editingOffer?.minimum_booking_amount || '0'} required /></label>
          <label>Usage limit<input name="usage_limit" type="number" min="1" defaultValue={editingOffer?.usage_limit || ''} placeholder="Unlimited" /></label>
        </div>
        <label className="check-label"><input name="is_active" type="checkbox" defaultChecked={editingOffer?.is_active ?? true} /> Active and available during its date range</label>
        <div className="row-actions"><button className="button button-primary" disabled={busy}>{editingOffer ? 'Save changes' : 'Create offer'}</button><button className="text-button" type="button" onClick={() => { setShowOfferForm(false); setEditingOffer(null); }}>Cancel</button></div>
      </form>}
      {offers.length ? <div className="offer-grid">{offers.map(offer => <article className="panel offer-card" key={offer.id}>
        <div className="section-heading"><div><span className="offer-code">{offer.code}</span><h3>{offer.name}</h3></div><span className={`status ${offer.status}`}>{offer.status.replace('_', ' ')}</span></div>
        <strong className="offer-value">{offer.discount_type === 'percentage' ? `${Number(offer.discount_value)}% off` : `${money(offer.discount_value)} off`}</strong>
        <dl><div><dt>Runs</dt><dd>{new Date(offer.starts_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })} – {new Date(offer.expires_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</dd></div><div><dt>Minimum booking</dt><dd>{money(offer.minimum_booking_amount)}</dd></div><div><dt>Usage</dt><dd>{offer.times_used}{offer.usage_limit === null ? ' · unlimited' : ` / ${offer.usage_limit}`}</dd></div></dl>
        <div className="row-actions"><button className="button button-outline small" disabled={busy} onClick={() => { setEditingOffer(offer); setShowOfferForm(true); window.scrollTo({ top: 100, behavior: 'smooth' }); }}>Edit</button>{!offer.is_active && offer.status !== 'expired' && <button className="text-button" disabled={busy} onClick={() => void action(() => api(`/admin/offers/${offer.id}/activate`, { method: 'POST' }), `${offer.code} activated.`)}>Activate</button>}{offer.status !== 'expired' && <button className="text-button danger" disabled={busy} onClick={() => void action(() => api(`/admin/offers/${offer.id}/expire`, { method: 'POST' }), `${offer.code} expired.`)}>Expire</button>}</div>
      </article>)}</div> : <div className="empty-state"><Percent size={32} /><h3>No offers yet.</h3><p>Create a code for your next campaign or seasonal promotion.</p></div>}
    </>}
    {tab === 'approvals' && overview && <div className="approval-grid"><div><h2>Vendor accounts</h2>{overview.vendors.map(v => <article className="panel" key={v.id}><h3>{v.name}</h3><p className="muted">{v.email}</p><span className={`status ${v.approval_status}`}>{v.approval_status}</span><ApprovalButtons busy={busy} onApprove={() => void action(() => api(`/admin/vendors/${v.id}/approval`, { method: 'POST', body: JSON.stringify({ status: 'approved' }) }), 'Vendor approved.')} onReject={() => void action(() => api(`/admin/vendors/${v.id}/approval`, { method: 'POST', body: JSON.stringify({ status: 'rejected' }) }), 'Vendor rejected.')} /></article>)}</div><div><h2>Venue listings</h2>{overview.listings.map(v => <article className="panel" key={v.id}>{v.photos.length > 0 && <div className="approval-photos">{v.photos.map((photo, index) => <img key={photo} src={photo} alt={`${v.name} submitted photo ${index + 1}`} />)}</div>}<h3>{v.name}</h3><p className="muted">{v.location_text} · {money(v.price_per_day)}</p><p>{v.description}</p><span className={`status ${v.approval_status}`}>{v.approval_status}</span><ApprovalButtons busy={busy} onApprove={() => void action(() => api(`/admin/venues/${v.id}/approval`, { method: 'POST', body: JSON.stringify({ status: 'approved' }) }), 'Venue approved.')} onReject={() => void action(() => api(`/admin/venues/${v.id}/approval`, { method: 'POST', body: JSON.stringify({ status: 'rejected' }) }), 'Venue rejected.')} /></article>)}</div><div><h2>Refund review</h2><p className="muted">Late payments require manual reconciliation in Razorpay.</p>{overview.refunds_to_review.length ? overview.refunds_to_review.map(p => <div className="panel" key={p.payment_id}><strong>{money(p.amount)}</strong><p>Payment reference: {p.payment_id}</p></div>) : <p>No late-payment refunds awaiting review.</p>}</div></div>}
    </>}
  </main>;
}
function ApprovalButtons({ busy, onApprove, onReject }: { busy: boolean; onApprove: () => void; onReject: () => void }) { return <div className="row-actions"><button className="button button-outline small" disabled={busy} onClick={onApprove}><Check size={14} /> Approve</button><button className="text-button" disabled={busy} onClick={onReject}><X size={14} /> Reject</button></div>; }
function dateTimeValue(value?: string) { if (!value) return ''; const date = new Date(value); date.setMinutes(date.getMinutes() - date.getTimezoneOffset()); return date.toISOString().slice(0, 16); }
