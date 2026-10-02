'use client';
import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import CelebrationMark from '@/components/celebration-mark';
import { ArrowRight, ArrowUpRight, CalendarDays, Check, MapPin, Search, Users } from 'lucide-react';
import VenuePreviews from '@/components/venue-previews';
import SiteSections from '@/components/site-sections';
import { site } from '@/lib/site-content';
import { today } from '@/lib/api';

export default function HomePage() {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [date, setDate] = useState('');
  const [guests, setGuests] = useState('');
  function submit(e: FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (date) params.set('booking_date', date);
    if (guests) params.set('guests', guests);
    router.push(`/find-venue${params.size ? `?${params}` : ''}`);
  }
  return <main><section className="hero hero-video"><video className="hero-video-media" autoPlay muted loop playsInline preload="metadata" aria-hidden="true"><source src="/celebratecg-hero.mp4" type="video/mp4" /></video><div className="hero-video-shade" aria-hidden="true" /><div className="hero-copy"><span className="eyebrow"><span className="tiny-star"><CelebrationMark size={21} /></span> CHHATTISGARH’S BIGGEST CELEBRATION BOOKING PLATFORM</span><h1>Plan. Book.<br /><em>Celebrate.</em></h1><p>Discover, compare and book verified venues, memorable stays and professional event services across Chhattisgarh—all in one seamless experience.</p><div className="hero-note"><span className="note-icon"><Check size={14} /></span> Launching {site.launch}</div><div className="hero-actions"><a className="button button-primary" href={site.signup}>Create an account <ArrowUpRight size={16} /></a><Link className="text-button" href="/signup?role=vendor">List your property <ArrowUpRight size={15} /></Link></div></div><div className="hero-video-caption"><span className="live-dot" /> Everything for every celebration.</div></section>
    <div className="search-wrap"><form className="search-bar" onSubmit={submit}><label><span><MapPin size={16} /> WHERE</span><input aria-label="City or venue name" placeholder="City or venue name" value={q} onChange={e => setQ(e.target.value)} /></label><label><span><CalendarDays size={16} /> WHEN</span><input aria-label="Celebration date" type="date" min={today()} value={date} onChange={e => setDate(e.target.value)} /></label><label><span><Users size={16} /> YOUR PEOPLE</span><input aria-label="Number of guests" type="number" min="1" placeholder="Number of guests" value={guests} onChange={e => setGuests(e.target.value)} /></label><button className="button button-primary search-button" type="submit"><Search size={18} /> Find my venue</button></form><p className="search-footnote">A wedding, a birthday, or just because. There’s a space for that.</p></div>
    <section id="venues" className="catalogue section"><div className="section-heading"><div><span className="eyebrow">THE SETTING FOR YOUR NEXT STORY</span><h2>Find your happy place<span className="orange">.</span></h2></div></div><div className="results-caption"><span>6 venue styles to explore</span><span>Across Chhattisgarh <MapPin size={13} /></span></div><VenuePreviews /></section>
    <SiteSections />
    <section id="how-it-works" className="how-section section"><div><span className="eyebrow">LESS PLANNING. MORE CELEBRATING.</span><h2>Your next great memory,<br /><em>three little steps away.</em></h2><p>We make finding the right place the easy part.</p></div><div className="steps">{[['01', 'Find your space', 'Explore venues that suit your people, plans, and budget.'], ['02', 'Make it a date', 'Check availability and reserve your day in a few clicks.'], ['03', 'Bring the celebration', 'Complete payment, get confirmation, and make it yours.']].map(([n, title, text]) => <div className="step" key={n}><span>{n}</span><div><h3>{title}</h3><p>{text}</p></div></div>)}</div></section>
    <section className="host-banner section"><div><span className="eyebrow">GREAT SPACES DESERVE GREAT COMPANY</span><h2>Your space. Their next favourite memory.</h2><p>Bring your venue to CelebrateCG and welcome a little more celebration.</p></div><Link href="/signup?role=vendor" className="button button-light">Become a host <ArrowRight size={17} /></Link></section>
  </main>;
}
