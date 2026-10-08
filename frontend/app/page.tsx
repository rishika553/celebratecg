'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, ArrowUpRight, CalendarDays, Check, MapPin, Search, Sparkles, Users } from 'lucide-react';
import CelebrationMark from '@/components/celebration-mark';
import VenuePreviews from '@/components/venue-previews';
import SiteSections from '@/components/site-sections';
import { categories as launchCategories, cities as launchCities, site } from '@/lib/site-content';
import { api, Category, CitySummary, today, Venue } from '@/lib/api';

type MarketplaceStats = { venues: number; cities: number; services: number };

function MarketplaceStat({ value, label }: { value: number; label: string }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplayValue(value);
      return;
    }
    const startedAt = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const progress = Math.min((now - startedAt) / 750, 1);
      setDisplayValue(Math.round(value * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) frame = window.requestAnimationFrame(tick);
    };
    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [value]);

  return <span className="marketplace-stat"><strong>{displayValue}</strong><small>{label}</small></span>;
}

export default function HomePage() {
  const router = useRouter();
  const heroVideoRef = useRef<HTMLVideoElement>(null);
  const [q, setQ] = useState('');
  const [eventType, setEventType] = useState('');
  const [date, setDate] = useState('');
  const [guests, setGuests] = useState('');
  const cityOptions = launchCities;
  const [categoryOptions, setCategoryOptions] = useState(launchCategories.map(({ slug, name }) => ({ slug, name })));
  const [marketplaceStats, setMarketplaceStats] = useState<MarketplaceStats | null>(null);
  const [marketplaceLoading, setMarketplaceLoading] = useState(true);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateVideoPlayback = () => {
      const video = heroVideoRef.current;
      if (!video) return;
      if (mediaQuery.matches) {
        video.pause();
        video.currentTime = 0;
      } else {
        void video.play().catch(() => undefined);
      }
    };

    updateVideoPlayback();
    mediaQuery.addEventListener('change', updateVideoPlayback);
    return () => mediaQuery.removeEventListener('change', updateVideoPlayback);
  }, []);

  useEffect(() => {
    Promise.all([api<Venue[]>('/venues'), api<CitySummary[]>('/cities'), api<Category[]>('/categories')])
      .then(([venues, cityData, categoryData]) => {
        const venueCategories = categoryData.filter(item => item.type === 'venue');
        if (venueCategories.length) setCategoryOptions(venueCategories.map(({ slug, name }) => ({ slug, name })));
        const services = categoryData.filter(item => item.type === 'service').length;
        if (venues.length || cityData.length || services) setMarketplaceStats({ venues: venues.length, cities: cityData.length, services });
      })
      .catch(() => undefined)
      .finally(() => setMarketplaceLoading(false));
  }, []);

  function submit(e: FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q) params.set('city', q);
    if (eventType) params.set('category', eventType);
    if (date) params.set('booking_date', date);
    if (guests) params.set('guests', guests);
    router.push(`/find-venue${params.size ? `?${params}` : ''}`);
  }

  return <main>
    <section className="hero hero-video">
      <video ref={heroVideoRef} className="hero-video-media" muted loop playsInline preload="metadata" aria-hidden="true">
        <source src="/celebratecg-hero.mp4" type="video/mp4" />
      </video>
      <div className="hero-video-shade" aria-hidden="true" />
      <div className="hero-copy">
        <span className="eyebrow hero-reveal hero-reveal-1"><span className="tiny-star"><CelebrationMark size={21} /></span> CHHATTISGARH’S BIGGEST CELEBRATION BOOKING PLATFORM</span>
        <h1 className="hero-title hero-reveal hero-reveal-2"><span>Plan. Book.</span><em>Celebrate.</em></h1>
        <p className="hero-reveal hero-reveal-3">Discover, compare and book verified venues, memorable stays and professional event services across Chhattisgarh—all in one seamless experience.</p>
        <div className="hero-note hero-reveal hero-reveal-4"><span className="note-icon"><Check size={14} /></span> Launching {site.launch}</div>
        <div className="hero-actions hero-reveal hero-reveal-5">
          <a className="button button-primary hero-primary-cta" href={site.signup}>Create an account <ArrowUpRight size={16} /></a>
          <Link className="text-button hero-secondary-cta" href="/signup?role=vendor">List your property <ArrowUpRight size={15} /></Link>
        </div>
      </div>
      <div className="hero-video-caption"><span className="hero-badge-inner"><span className="live-dot" /> Everything for every celebration.</span></div>
      <a className="hero-scroll-indicator" href="#venue-search" aria-label="Scroll to venue search"><span>Scroll</span><i aria-hidden="true" /></a>
    </section>

    <div className="search-wrap marketplace-search-wrap" id="venue-search">
      <div className="marketplace-search-shell">
        <div className="marketplace-search-heading"><span><Sparkles size={14} /> Find your venue</span><span className="marketplace-signal"><i /> Popular near you</span></div>
        <form className="search-bar marketplace-search" onSubmit={submit}>
          <label className={q ? 'has-value' : ''}><span><MapPin size={16} /> CITY</span><select aria-label="Celebration city" value={q} onChange={e => setQ(e.target.value)}><option value="">Choose a city</option>{cityOptions.map(city => <option value={city} key={city}>{city}</option>)}</select></label>
          <label className={eventType ? 'has-value' : ''}><span><Sparkles size={16} /> EVENT TYPE</span><select aria-label="Event type" value={eventType} onChange={e => setEventType(e.target.value)}><option value="">Any celebration</option>{categoryOptions.map(category => <option value={category.slug} key={category.slug}>{category.name}</option>)}</select></label>
          <label className={date ? 'has-value' : ''}><span><CalendarDays size={16} /> DATE</span><input aria-label="Celebration date" type="date" min={today()} value={date} onChange={e => setDate(e.target.value)} /></label>
          <label className={guests ? 'has-value' : ''}><span><Users size={16} /> GUESTS</span><input aria-label="Number of guests" type="number" min="1" placeholder="Any group size" value={guests} onChange={e => setGuests(e.target.value)} /></label>
          <button className="button button-primary search-button" type="submit"><Search size={18} /> Explore venues</button>
        </form>
        <div className="marketplace-search-meta">
          <p className="search-footnote">A wedding, a birthday, or just because. There’s a space for that.</p>
          {marketplaceLoading ? <div className="marketplace-stats-loading" aria-label="Loading marketplace availability"><span /><span /><span /></div> : marketplaceStats && <div className="marketplace-stats" aria-label="Live marketplace availability">
            {marketplaceStats.venues > 0 && <MarketplaceStat value={marketplaceStats.venues} label="venues available" />}
            {marketplaceStats.cities > 0 && <MarketplaceStat value={marketplaceStats.cities} label="cities covered" />}
            {marketplaceStats.services > 0 && <MarketplaceStat value={marketplaceStats.services} label="event services" />}
          </div>}
        </div>
      </div>
    </div>

    <section id="venues" className="catalogue section">
      <div className="section-heading"><div><span className="eyebrow">THE SETTING FOR YOUR NEXT STORY</span><h2 className="editorial-moment"><span className="editorial-line"><span>Find your</span></span><span className="editorial-line editorial-line-accent"><span>happy place.</span></span></h2></div></div>
      <div className="results-caption"><span>6 venue styles to explore</span><span>Across Chhattisgarh <MapPin size={13} /></span></div>
      <VenuePreviews />
    </section>
    <SiteSections />
    <section id="how-it-works" className="how-section section">
      <div><span className="eyebrow">LESS PLANNING. MORE CELEBRATING.</span><h2>Your next great memory,<br /><em>three little steps away.</em></h2><p>We make finding the right place the easy part.</p></div>
      <div className="steps">{[['01', 'Find your space', 'Explore venues that suit your people, plans, and budget.'], ['02', 'Make it a date', 'Check availability and reserve your day in a few clicks.'], ['03', 'Bring the celebration', 'Complete payment, get confirmation, and make it yours.']].map(([n, title, text]) => <div className="step" key={n}><span>{n}</span><div><h3>{title}</h3><p>{text}</p></div></div>)}</div>
    </section>
    <section className="host-banner section">
      <div><span className="eyebrow">GREAT SPACES DESERVE GREAT COMPANY</span><h2>Your space. Their next favourite memory.</h2><p>Bring your venue to CelebrateCG and welcome a little more celebration.</p></div>
      <Link href="/signup?role=vendor" className="button button-light">Become a host <ArrowRight size={17} /></Link>
    </section>
  </main>;
}
