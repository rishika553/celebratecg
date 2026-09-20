'use client';
import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, CalendarDays, Check, MapPin, Search, Sparkles, Users, SlidersHorizontal, Building2, Trees, Hotel, Home, PartyPopper } from 'lucide-react';
import VenueCard from '@/components/venue-card';
import SiteSections from '@/components/site-sections';
import { site } from '@/lib/site-content';
import { api, Category, today, Venue } from '@/lib/api';

const categoryIcons: Record<string, typeof Building2> = { 'banquet-hall': Building2, lawn: Trees, resort: Hotel, farmhouse: Home };
export default function HomePage() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [category, setCategory] = useState('');
  const [q, setQ] = useState('');
  const [date, setDate] = useState('');
  const [guests, setGuests] = useState('');
  const [budget, setBudget] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  async function search(selectedCategory = category) {
    setLoading(true); setError('');
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (date) params.set('booking_date', date);
    if (guests) params.set('guests', guests);
    if (budget) params.set('max_price', budget);
    if (selectedCategory) params.set('category', selectedCategory);
    try { setVenues(await api<Venue[]>(`/venues?${params}`)); } catch (e) { setError((e as Error).message || 'Unable to load venues. Please check that the API is running.'); } finally { setLoading(false); }
  }
  useEffect(() => { void search(''); api<Category[]>('/categories').then(setCategories).catch(() => {}); }, []); // Initial catalogue load; searches are explicit.
  function submit(e: FormEvent) { e.preventDefault(); void search(); document.getElementById('venues')?.scrollIntoView({ behavior: 'smooth' }); }
  return <main><section className="hero"><div className="hero-copy"><span className="eyebrow"><span className="tiny-star">✳</span> CHHATTISGARH’S CELEBRATION BOOKING PLATFORM</span><h1>Plan. Book.<br /><em>Celebrate.</em></h1><p>Find beautiful stays, celebration spaces and event services across Chhattisgarh. A place for every occasion.</p><div className="hero-note"><span className="note-icon"><Check size={14} /></span> Launching {site.launch}</div><div className="hero-actions"><a className="button button-primary" href={site.signup}>Create an account <ArrowUpRight size={16} /></a><Link className="text-button" href="/signup?role=vendor">List your property <ArrowUpRight size={15} /></Link></div></div><div className="hero-photo"><div className="photo-label"><span className="live-dot" /> CHHATTISGARH, AT ITS MOST CELEBRATORY</div><div className="photo-caption"><span>Your people.<br /><em>Your kind of place.</em></span><span className="photo-circle"><ArrowUpRight size={25} /></span></div></div><span className="hero-doodle" aria-hidden="true">✳</span></section>
    <div className="search-wrap"><form className="search-bar" onSubmit={submit}><label><span><MapPin size={16} /> WHERE</span><input aria-label="City or venue name" placeholder="City or venue name" value={q} onChange={e => setQ(e.target.value)} /></label><label><span><CalendarDays size={16} /> WHEN</span><input aria-label="Celebration date" type="date" min={today()} value={date} onChange={e => setDate(e.target.value)} /></label><label><span><Users size={16} /> YOUR PEOPLE</span><input aria-label="Number of guests" type="number" min="1" placeholder="Number of guests" value={guests} onChange={e => setGuests(e.target.value)} /></label><button className="button button-primary search-button" type="submit"><Search size={18} /> Find my venue</button></form><p className="search-footnote">A wedding, a birthday, or just because. There’s a space for that.</p></div>
    <section id="venues" className="catalogue section"><div className="section-heading"><div><span className="eyebrow">THE SETTING FOR YOUR NEXT STORY</span><h2>Find your happy place<span className="orange">.</span></h2></div><button className={`button button-outline small ${showFilters ? 'selected' : ''}`} onClick={() => setShowFilters(!showFilters)} aria-expanded={showFilters}><SlidersHorizontal size={15} /> Filters</button></div><div className="category-tabs"><button className={!category ? 'active' : ''} onClick={() => { setCategory(''); void search(''); }}><Sparkles size={18} /> All spaces</button>{categories.map(c => { const Icon = categoryIcons[c.slug] || PartyPopper; return <button className={category === c.slug ? 'active' : ''} key={c.id} onClick={() => { setCategory(c.slug); void search(c.slug); }}><Icon size={18} /> {c.name}</button>; })}</div>{showFilters && <form className="filter-panel" onSubmit={submit}><label>Maximum daily price (₹)<input type="number" min="1" placeholder="No limit" value={budget} onChange={e => setBudget(e.target.value)} /></label><button className="button button-primary" type="submit">Apply filters</button></form>}<div className="results-caption"><span>{loading ? 'Finding your next celebration…' : `${venues.length} ${venues.length === 1 ? 'space' : 'spaces'} to make it yours`}</span><span>Across Chhattisgarh <MapPin size={13} /></span></div>{error ? <div className="empty-state" role="alert"><h3>We couldn’t load the venues.</h3><p>{error}</p><button className="button button-primary" onClick={() => void search()}>Try again</button></div> : loading ? <div className="venue-grid" aria-label="Loading venues">{[1, 2, 3].map(n => <div className="skeleton" key={n} />)}</div> : venues.length ? <div className="venue-grid">{venues.map(v => <VenueCard key={v.id} venue={v} />)}</div> : <div className="empty-state"><Search size={28} /><h3>A little more room to explore</h3><p>Try another city, date, guest count, or budget.</p></div>}</section>
    <SiteSections />
    <section id="how-it-works" className="how-section section"><div><span className="eyebrow">LESS PLANNING. MORE CELEBRATING.</span><h2>Your next great memory,<br /><em>three little steps away.</em></h2><p>We make finding the right place the easy part.</p></div><div className="steps">{[['01', 'Find your space', 'Explore venues that suit your people, plans, and budget.'], ['02', 'Make it a date', 'Check availability and reserve your day in a few clicks.'], ['03', 'Bring the celebration', 'Complete payment, get confirmation, and make it yours.']].map(([n, title, text]) => <div className="step" key={n}><span>{n}</span><div><h3>{title}</h3><p>{text}</p></div></div>)}</div></section>
    <section className="host-banner section"><div><span className="eyebrow">GREAT SPACES DESERVE GREAT COMPANY</span><h2>Your space. Their next favourite memory.</h2><p>Bring your venue to CelebrateCG and welcome a little more celebration.</p></div><Link href="/signup?role=vendor" className="button button-light">Become a host <ArrowRight size={17} /></Link></section>
  </main>;
}
