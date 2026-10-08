'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArrowUpRight, CalendarDays, Map, MapPin, Search, Users } from 'lucide-react';
import LocationMap from './location-map';
import VenueBookingCard from './venue-booking-card';
import { api, Category, CitySummary, money, today, Venue } from '@/lib/api';
import { categories as venueVisuals, cities as siteCities } from '@/lib/site-content';

type SearchOverrides = { city?: string; category?: string };

export default function CitiesExplorer() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || '';
  const [cities, setCities] = useState<CitySummary[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [city, setCity] = useState('');
  const [category, setCategory] = useState(initialCategory);
  const [date, setDate] = useState('');
  const [guests, setGuests] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [cityQuery, setCityQuery] = useState('');
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [bookingVenue, setBookingVenue] = useState<Venue | null>(null);
  const [mobileView, setMobileView] = useState<'list' | 'map'>('list');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function runSearch(overrides: SearchOverrides = {}) {
    const activeCity = overrides.city ?? city;
    const activeCategory = overrides.category ?? category;
    const params = new URLSearchParams();
    if (activeCity) params.set('city', activeCity);
    if (activeCategory) params.set('category', activeCategory);
    if (date) params.set('booking_date', date);
    if (guests) params.set('guests', guests);
    if (minPrice) params.set('min_price', minPrice);
    if (maxPrice) params.set('max_price', maxPrice);
    setLoading(true); setError('');
    try {
      const data = await api<Venue[]>(`/venues?${params}`);
      setVenues(data);
      setSelectedVenue(current => current && data.some(venue => venue.id === current.id) ? current : data[0] || null);
    } catch (reason) {
      setError((reason as Error).message || 'Unable to load destinations.');
    } finally { setLoading(false); }
  }

  useEffect(() => {
    Promise.all([api<CitySummary[]>('/cities'), api<Category[]>('/categories'), api<Venue[]>(`/venues?${initialCategory ? `category=${encodeURIComponent(initialCategory)}` : ''}`)])
      .then(([cityData, categoryData, venueData]) => {
        setCities(cityData); setCategories(categoryData); setVenues(venueData); setSelectedVenue(venueData[0] || null);
      })
      .catch(reason => setError((reason as Error).message || 'Unable to load destinations.'))
      .finally(() => setLoading(false));
  }, [initialCategory]);

  const visibleCities = useMemo(() => cities.filter(item => item.name.toLowerCase().includes(cityQuery.trim().toLowerCase())), [cities, cityQuery]);
  const mapLocation = selectedVenue?.location_text || (city ? `${city}, Chhattisgarh, India` : 'Chhattisgarh, India');

  function submit(event: FormEvent) { event.preventDefault(); void runSearch(); }
  function chooseCity(name: string) { setCity(name); setSelectedVenue(null); setMobileView('list'); void runSearch({ city: name }); document.getElementById('venue-map')?.scrollIntoView({ behavior: 'smooth' }); }
  function submitCitySearch(event: FormEvent) {
    event.preventDefault();
    const match = cities.find(item => item.name.toLowerCase() === cityQuery.trim().toLowerCase()) || visibleCities[0];
    if (match) chooseCity(match.name);
  }
  return <main className="cities-page">
    <section className="cities-hero">
      <img src={`https://images.hostinger.com/${venueVisuals[4].image}.png`} alt="A destination in Chhattisgarh" />
      <div className="cities-hero-shade" aria-hidden="true" />
      <div className="cities-hero-copy">
        <span className="eyebrow">DISCOVER BY DESTINATION</span>
        <h1>Discover by<br /><em>destination.</em></h1>
        <p>Explore venues, stays and experiences across Chhattisgarh’s celebration cities.</p>
        <form className="city-hero-search" onSubmit={submitCitySearch}>
          <label><span className="sr-only">Search a city or location</span><input value={cityQuery} onChange={event => setCityQuery(event.target.value)} placeholder="Search a city or location" /></label>
          <button type="submit" aria-label="Search destinations"><Search size={19} /></button>
        </form>
      </div>
      <span className="categories-hero-caption">Find your place in Chhattisgarh.</span>
    </section>

    <section className="section destinations-section">
      <div className="categories-intro"><div><span className="eyebrow">EXPLORE DESTINATIONS</span><h2>Where will you celebrate?</h2></div><p>Browse destinations with approved CelebrateCG venues. Every count comes directly from the current catalogue.</p></div>
      {visibleCities.length ? <div className="destination-grid">{visibleCities.map((item, index) => <button type="button" className={`destination-card destination-card-${index + 1}`} onClick={() => chooseCity(item.name)} key={item.name}>
        {item.image && <img src={item.image} alt="" />}
        <span className="destination-shade" aria-hidden="true" />
        <span className="destination-copy"><small>DESTINATION</small><strong>{item.name}</strong><span>{item.venue_count} {item.venue_count === 1 ? 'venue' : 'venues'} <ArrowUpRight size={16} /></span></span>
      </button>)}</div> : <div className="destination-empty">No matching destination is currently represented in the approved venue catalogue.</div>}
    </section>

    <section id="venue-map" className="section venue-map-section">
      <div className="categories-intro"><div><span className="eyebrow">FIND VENUES AROUND YOU</span><h2>Explore properties on the map.</h2></div><p>Filter the live catalogue by destination, date, group size, price and type of space.</p></div>
      <form className="destination-filters" onSubmit={submit}>
        <label><span>Location</span><select value={city} onChange={event => setCity(event.target.value)}><option value="">All destinations</option>{siteCities.map(name => <option value={name} key={name}>{name}</option>)}</select></label>
        <label><span>Category</span><select value={category} onChange={event => setCategory(event.target.value)}><option value="">All spaces</option>{categories.map(item => <option value={item.slug} key={item.id}>{item.name}</option>)}</select></label>
        <label><span><CalendarDays size={14} /> Date</span><input type="date" min={today()} value={date} onChange={event => setDate(event.target.value)} /></label>
        <label><span><Users size={14} /> Guests</span><input type="number" min="1" placeholder="Any group size" value={guests} onChange={event => setGuests(event.target.value)} /></label>
        <label><span>Minimum price</span><input type="number" min="0" placeholder="₹ No minimum" value={minPrice} onChange={event => setMinPrice(event.target.value)} /></label>
        <label><span>Maximum price</span><input type="number" min="1" placeholder="₹ No maximum" value={maxPrice} onChange={event => setMaxPrice(event.target.value)} /></label>
        <button className="button button-primary destination-filter-submit" type="submit"><Search size={17} /> Show venues</button>
      </form>

      <div className="mobile-map-toggle" aria-label="Choose results view"><button className={mobileView === 'list' ? 'active' : ''} onClick={() => setMobileView('list')} type="button">List</button><button className={mobileView === 'map' ? 'active' : ''} onClick={() => setMobileView('map')} type="button">Map</button></div>
      {error && <p className="destination-error" role="alert">{error}</p>}
      <div className={`venue-map-layout mobile-view-${mobileView}`}>
        <div className="map-venue-list">
          <div className="map-list-heading"><span>{loading ? 'Finding venues…' : `${venues.length} ${venues.length === 1 ? 'place' : 'places'}`}</span>{city && <small>in {city}</small>}</div>
          {!loading && !venues.length && <div className="destination-empty"><h3>No spaces found.</h3><p>Try removing a filter or choosing another destination.</p></div>}
          {venues.map(venue => <article className={selectedVenue?.id === venue.id ? 'map-venue-row active' : 'map-venue-row'} key={venue.id}>
            <button className="map-venue-select" type="button" onClick={() => { setSelectedVenue(venue); setMobileView('map'); }} aria-label={`Show ${venue.name} on the map`}>
              <span className="map-venue-photo" style={{ backgroundImage: venue.photos[0] ? `url("${venue.photos[0]}")` : undefined }} />
              <span className="map-venue-copy"><small>{venue.category}</small><strong>{venue.name}</strong><span><MapPin size={13} /> {venue.location_text}</span><span><Users size={13} /> Up to {venue.max_guests.toLocaleString('en-IN')} guests</span></span>
            </button>
            <div className="map-venue-price"><span><strong>{money(venue.price_per_day)}</strong> / day</span><button type="button" onClick={() => setBookingVenue(venue)}>Book now <ArrowUpRight size={14} /></button></div>
          </article>)}
        </div>
        <div className="destination-map-panel">
          <div className="destination-map-label"><Map size={16} /><span>{selectedVenue ? selectedVenue.name : city || 'Chhattisgarh'}</span></div>
          <LocationMap location={mapLocation} title={`Map for ${selectedVenue?.name || city || 'Chhattisgarh'}`} note={selectedVenue ? 'Map based on the venue’s listed location. Confirm the exact address with your host.' : 'Select a venue to focus its listed location.'} />
        </div>
      </div>
      {bookingVenue && <VenueBookingCard venue={bookingVenue} onClose={() => setBookingVenue(null)} />}
    </section>
  </main>;
}
