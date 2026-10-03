'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowRight, ArrowUpRight, CalendarDays, MapPin, Search, SlidersHorizontal, Users, X } from 'lucide-react';
import VenueBookingCard from '@/components/venue-booking-card';
import VenueCard from '@/components/venue-card';
import { api, Category, today, Venue } from '@/lib/api';
import { categories as venueVisuals } from '@/lib/site-content';

type SortMode = 'featured' | 'price-asc' | 'price-desc' | 'newest';

export default function FindVenueMarketplace() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const initialCity = searchParams.get('city') || '';
  const initialCategory = searchParams.get('category') || '';
  const initialDate = searchParams.get('booking_date') || '';
  const initialGuests = searchParams.get('guests') || '';
  const [venues, setVenues] = useState<Venue[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [query, setQuery] = useState(initialQuery);
  const [city, setCity] = useState(initialCity);
  const [date, setDate] = useState(initialDate);
  const [guests, setGuests] = useState(initialGuests);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [category, setCategory] = useState(initialCategory);
  const [sort, setSort] = useState<SortMode>('featured');
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookingVenue, setBookingVenue] = useState<Venue | null>(null);

  async function search(nextCategory = category) {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (city) params.set('city', city);
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
    if (initialCity) params.set('city', initialCity);
    if (initialCategory) params.set('category', initialCategory);
    if (initialDate) params.set('booking_date', initialDate);
    if (initialGuests) params.set('guests', initialGuests);
    Promise.all([api<Venue[]>(`/venues?${params}`), api<Category[]>('/categories')])
      .then(([venueData, categoryData]) => { setVenues(venueData); setCategories(categoryData); })
      .catch(reason => setError((reason as Error).message || 'Unable to load venues.'))
      .finally(() => setLoading(false));
  }, [initialCategory, initialCity, initialDate, initialGuests, initialQuery]);


  const cityOptions = useMemo(() => [...new Set(venues.map(venue => venue.location_text.split(',')[0].trim()).filter(Boolean))].sort(), [venues]);
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
    setCity('');
    setDate('');
    setGuests('');
    setMinPrice('');
    setMaxPrice('');
    setCategory('');
    setQuery('');
    setTimeout(() => void search(''), 0);
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
        <div className="marketplace-controls">
          <button className="button button-outline small" type="button" onClick={() => setShowFilters(true)}><SlidersHorizontal size={15} /> Filters</button>
          <label className="sort-control">Sort<select value={sort} onChange={event => setSort(event.target.value as SortMode)}><option value="featured">Featured</option><option value="price-asc">Price: Low to High</option><option value="price-desc">Price: High to Low</option><option value="newest">Newest</option></select></label>
        </div>
      </div>

      <div className="marketplace-tabs">
        <button className={!category ? 'active' : ''} onClick={() => pickCategory('')} type="button">All</button>
        {categories.map(item => <button className={category === item.slug ? 'active' : ''} onClick={() => pickCategory(item.slug)} type="button" key={item.id}>{item.name}</button>)}
      </div>

      <form className={`marketplace-filter-panel ${showFilters ? 'open' : ''}`} onSubmit={submit}>
        <div className="filter-panel-heading"><strong>Filters</strong><button className="icon-button" type="button" aria-label="Close filters" onClick={() => setShowFilters(false)}><X size={17} /></button></div>
        <label>Location<select value={city} onChange={event => setCity(event.target.value)}><option value="">All locations</option>{cityOptions.map(name => <option key={name} value={name}>{name}</option>)}</select></label>
        <label>Date<input type="date" min={today()} value={date} onChange={event => setDate(event.target.value)} /></label>
        <label>Guests<input type="number" min="1" placeholder="Any group size" value={guests} onChange={event => setGuests(event.target.value)} /></label>
        <label>Minimum price<input type="number" min="0" placeholder="No minimum" value={minPrice} onChange={event => setMinPrice(event.target.value)} /></label>
        <label>Maximum price<input type="number" min="1" placeholder="No maximum" value={maxPrice} onChange={event => setMaxPrice(event.target.value)} /></label>
        <div className="filter-actions"><button className="button button-primary" type="submit">Apply filters</button><button className="text-button" type="button" onClick={clearFilters}>Clear all</button></div>
      </form>

      <div className="results-caption marketplace-results"><span>{loading ? 'Finding venues...' : `${sortedVenues.length} ${sortedVenues.length === 1 ? 'venue' : 'venues'} found`}</span><span>All approved venues <MapPin size={13} /></span></div>
      {error && <div className="empty-state" role="alert"><h3>We couldn’t load the venues.</h3><p>{error}</p><button className="button button-primary" onClick={() => void search()}>Try again</button></div>}
      {!error && loading ? <div className="venue-grid" aria-label="Loading venues">{[1, 2, 3, 4, 5, 6].map(item => <div className="skeleton" key={item} />)}</div> : null}
      {!error && !loading && sortedVenues.length ? <div className="venue-grid">{sortedVenues.map(venue => <VenueCard key={venue.id} venue={venue} onBook={setBookingVenue} />)}</div> : null}
      {!error && !loading && !sortedVenues.length ? <div className="empty-state"><Search size={28} /><h3>No venues found.</h3><p>Try another city, date, guest count or price range.</p></div> : null}
    </section>

    <section className="section find-venue-cta">
      <div><span className="eyebrow">CAN'T FIND WHAT YOU'RE LOOKING FOR?</span><h2>Tell us where and how you want to celebrate.</h2></div>
      <Link href="/cities" className="button button-light">Explore cities <ArrowUpRight size={17} /></Link>
    </section>

    {bookingVenue && <VenueBookingCard venue={bookingVenue} onClose={() => setBookingVenue(null)} />}
  </main>;
}
