'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowRight, ArrowUpRight, CalendarDays, MapPin, Search, SlidersHorizontal, Users, X } from 'lucide-react';
import VenueBookingCard from '@/components/venue-booking-card';
import VenueCard from '@/components/venue-card';
import { api, Category, onWakeUp, today, Venue } from '@/lib/api';
import { categories as venueVisuals } from '@/lib/site-content';

type SortMode = 'featured' | 'price-asc' | 'price-desc' | 'newest';

export default function FindVenueMarketplace() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const initialCategory = searchParams.get('category') || '';
  const initialDate = searchParams.get('booking_date') || '';
  const initialGuests = searchParams.get('guests') || '';
  const [venues, setVenues] = useState<Venue[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [query, setQuery] = useState(initialQuery);
  const [date, setDate] = useState(initialDate);
  const [guests, setGuests] = useState(initialGuests);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [category, setCategory] = useState(initialCategory);
  const [sort, setSort] = useState<SortMode>('featured');
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [waking, setWaking] = useState(false);
  const [error, setError] = useState('');
  const [bookingVenue, setBookingVenue] = useState<Venue | null>(null);

  useEffect(() => { onWakeUp(setWaking); return () => onWakeUp(null); }, []);

  async function search(nextCategory = category) {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (date) params.set('booking_date', date);
    if (guests) params.set('guests', guests);
    if (minPrice) params.set('min_price', minPrice);
    if (maxPrice) params.set('max_price', maxPrice);
    if (nextCategory) params.set('category', nextCategory);
    setLoading(true);
    setError('');
    try {
      setVenues(await api<Venue[]>(`/venues?${params}`));
    } catch (reason) {
      setError((reason as Error).message || 'Unable to load venues.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const params = new URLSearchParams();
    if (initialQuery) params.set('q', initialQuery);
    if (initialCategory) params.set('category', initialCategory);
    if (initialDate) params.set('booking_date', initialDate);
    if (initialGuests) params.set('guests', initialGuests);
    Promise.all([api<Venue[]>(`/venues?${params}`), api<Category[]>('/categories')])
      .then(([venueData, categoryData]) => { setVenues(venueData); setCategories(categoryData); })
      .catch(reason => setError((reason as Error).message || 'Unable to load venues.'))
      .finally(() => setLoading(false));
  }, [initialCategory, initialDate, initialGuests, initialQuery]);
  const sortedVenues = useMemo(() => {
    const list = [...venues];
    if (sort === 'price-asc') list.sort((a, b) => Number(a.price_per_day) - Number(b.price_per_day));
    if (sort === 'price-desc') list.sort((a, b) => Number(b.price_per_day) - Number(a.price_per_day));
    if (sort === 'newest') list.reverse();
    return list;
  }, [venues, sort]);

  function submit(event: FormEvent) {
    event.preventDefault();
    void search();
    setShowFilters(false);
  }

  function pickCategory(slug: string) {
    setCategory(slug);
    void search(slug);
  }

  function clearFilters() {
    setDate('');
    setGuests('');
    setMinPrice('');
    setMaxPrice('');
    setCategory('');
    setQuery('');
    setTimeout(() => void search(''), 0);
  }

  const hasActiveFilters = Boolean(category || date || guests || minPrice || maxPrice || query);

  function loadingCaption() {
    if (loading) return waking ? 'Server is waking up, hang tight...' : 'Finding venues...';
    return `${sortedVenues.length} ${sortedVenues.length === 1 ? 'venue' : 'venues'} found`;
  }

  return <main className="find-venue-page">
    <section className="find-venue-hero">
      <img src={`https://images.hostinger.com/${venueVisuals[0].image}.png`} alt="Luxury celebration venue in Chhattisgarh" />
      <div className="find-venue-hero-shade" aria-hidden="true" />
      <div className="find-venue-copy">
        <span className="eyebrow">FIND YOUR PERFECT VENUE</span>
        <h1>Spaces made for<br /><em>your celebration.</em></h1>
        <p>Discover verified venues across Chhattisgarh, from intimate gardens and villas to grand banquet halls and luxury resorts.</p>
        <form className="find-venue-search" onSubmit={submit}>
          <label><Search size={17} /><span className="sr-only">Search city, venue or location</span><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search city, venue or location" /></label>
          <button type="submit" className="button button-primary">Search <ArrowRight size={16} /></button>
        </form>
      </div>
    </section>

    <section className="section venue-marketplace">
      <div className="section-heading marketplace-heading">
        <div><span className="eyebrow">EXPLORE VENUES</span><h2>Find a space that feels right for your celebration.</h2></div>
      </div>

      <div className="results-caption marketplace-results">
        <span>{loadingCaption()}</span>
        <span>All approved venues <MapPin size={13} /></span>
      </div>
      {error && <div className="empty-state" role="alert"><h3>We could not load the venues.</h3><p>{error}</p><button className="button button-primary" onClick={() => void search()}>Try again</button></div>}
      {!error && loading ? <div>
        {waking && <p style={{ textAlign: 'center', color: 'var(--muted)', padding: '1rem 0' }}>Our server sleeps after inactivity. It usually wakes up within 30 to 60 seconds.</p>}
        <div className="venue-grid" aria-label="Loading venues">{[1, 2, 3, 4, 5, 6].map(item => <div className="skeleton" key={item} />)}</div>
      </div> : null}
      {!error && !loading && sortedVenues.length ? <div className="venue-grid">{sortedVenues.map(venue => <VenueCard key={venue.id} venue={venue} onBook={setBookingVenue} />)}</div> : null}
      {!error && !loading && !sortedVenues.length ? <div className="empty-state"><Search size={28} /><h3>No venues found.</h3><p>Try another city, date, guest count or price range.</p></div> : null}
    </section>

    <section className="section find-venue-cta">
      <div><span className="eyebrow">{"CAN'T FIND WHAT YOU'RE LOOKING FOR?"}</span><h2>Tell us where and how you want to celebrate.</h2></div>
      <Link href="/cities" className="button button-light">Explore cities <ArrowUpRight size={17} /></Link>
    </section>

    {bookingVenue && <VenueBookingCard venue={bookingVenue} onClose={() => setBookingVenue(null)} />}
  </main>;
}
