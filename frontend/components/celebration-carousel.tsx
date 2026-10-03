'use client';

import { CSSProperties, KeyboardEvent, TouchEvent, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import { categories, platformOfferings, serviceCategories } from '@/lib/site-content';

const slides = [
  { title: platformOfferings[0].title, nav: 'Farmhouses', description: platformOfferings[0].description, image: `https://images.hostinger.com/${categories[0].image}.png`, alt: 'Country farmhouse setting with open grounds in Chhattisgarh', background: '#EFE5D8', ink: '#292622', tone: 'light', href: '/find-venue?category=farmhouse', meta: 'VENUES · CHHATTISGARH' },
  { title: platformOfferings[1].title, nav: 'Villas & resorts', description: platformOfferings[1].description, image: '/auth-villa.jpg', alt: 'Luxury villa stay with a private pool', background: '#E4E9DF', ink: '#292622', tone: 'light', href: '/find-venue?category=luxury-villa', meta: 'STAYS · PRIVATE ESCAPES' },
  { title: platformOfferings[2].title, nav: 'Weddings', description: platformOfferings[2].description, image: `https://images.hostinger.com/${categories[5].image}.png`, alt: 'Wedding-ready banquet venue with elegant event styling', background: '#EFE0DD', ink: '#292622', tone: 'light', href: '/find-venue?category=banquet-hall', meta: 'WEDDINGS · GATHERINGS' },
  { title: platformOfferings[3].title, nav: 'Entertainment', description: platformOfferings[3].description, image: serviceCategories[0].image, alt: 'Live entertainment stage with warm event lighting', background: '#292622', ink: '#FFF8F2', tone: 'dark', href: '/categories#event-services', meta: 'SOUND · LIGHT · STAGE' },
  { title: platformOfferings[4].title, nav: 'Food & styling', description: platformOfferings[4].description, image: serviceCategories[2].image, alt: 'Floral event styling and celebration table decor', background: '#EAD3C4', ink: '#292622', tone: 'light', href: '/categories#event-services', meta: 'FOOD · DECOR · MEMORIES' },
  { title: platformOfferings[5].title, nav: 'Event support', description: platformOfferings[5].description, image: serviceCategories[7].image, alt: 'Complete celebration setup prepared for a special event', background: '#E9E0D3', ink: '#292622', tone: 'light', href: '/categories#event-services', meta: 'PLANNING · CELEBRATION' },
];

const AUTOPLAY_MS = 6800;

export default function CelebrationCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [outgoingIndex, setOutgoingIndex] = useState<number | null>(null);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resumeRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartX = useRef<number | null>(null);
  const active = slides[activeIndex];
  const nextIndex = (activeIndex + 1) % slides.length;

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const syncMotionPreference = () => setReducedMotion(query.matches);
    syncMotionPreference();
    query.addEventListener('change', syncMotionPreference);
    return () => query.removeEventListener('change', syncMotionPreference);
  }, []);

  useEffect(() => {
    if (reducedMotion || paused) return;
    timerRef.current = setTimeout(() => changeSlide((activeIndex + 1) % slides.length, false), AUTOPLAY_MS);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [activeIndex, paused, reducedMotion]);

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (resumeRef.current) clearTimeout(resumeRef.current);
  }, []);

  function pauseBriefly() {
    setPaused(true);
    if (resumeRef.current) clearTimeout(resumeRef.current);
    resumeRef.current = setTimeout(() => {
      if (!carouselRef.current?.matches(':hover, :focus-within')) setPaused(false);
    }, 1800);
  }

  function changeSlide(index: number, fromInteraction = true) {
    const next = (index + slides.length) % slides.length;
    if (next === activeIndex) {
      if (fromInteraction) pauseBriefly();
      return;
    }
    setOutgoingIndex(activeIndex);
    setActiveIndex(next);
    if (fromInteraction) pauseBriefly();
    if (timerRef.current) clearTimeout(timerRef.current);
    window.setTimeout(() => setOutgoingIndex(current => current === activeIndex ? null : current), 760);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      changeSlide(activeIndex - 1);
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      changeSlide(activeIndex + 1);
    }
  }

  function handleTouchStart(event: TouchEvent<HTMLElement>) {
    touchStartX.current = event.changedTouches[0]?.clientX ?? null;
  }

  function handleTouchEnd(event: TouchEvent<HTMLElement>) {
    const start = touchStartX.current;
    const end = event.changedTouches[0]?.clientX;
    if (start === null || end === undefined) return;
    const distance = end - start;
    if (Math.abs(distance) > 48) changeSlide(activeIndex + (distance < 0 ? 1 : -1));
    touchStartX.current = null;
  }

  return <section
    id="everything"
    className={`content-section celebration-carousel-section ${active.tone === 'dark' ? 'chapter-dark' : 'chapter-light'}`}
    style={{ '--chapter-background': active.background, '--chapter-ink': active.ink } as CSSProperties}
    aria-label="Celebration experiences"
  >
    <div className="celebration-carousel-inner">
      <div className="section-heading celebration-carousel-heading">
        <div>
          <span className="eyebrow">EVERYTHING YOU NEED</span>
          <h2>For every kind of celebration.</h2>
          <p className="muted">From finding the right setting to food, decor, entertainment and memories—bring the whole plan together with CelebrateCG.</p>
        </div>
      </div>

      <div
        ref={carouselRef}
        className={`celebration-carousel ${paused ? 'is-paused' : ''}`}
        role="region"
        aria-roledescription="carousel"
        aria-label="Explore celebration experiences"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={event => { if (!event.currentTarget.matches(':focus-within')) setPaused(false); }}
        onFocus={() => setPaused(true)}
        onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setPaused(false); }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="celebration-slide" aria-live="polite" aria-atomic="true">
          <div className="celebration-slide-image">
            <div className="celebration-photo-frame">
              {outgoingIndex !== null && outgoingIndex !== activeIndex && <img className="celebration-image outgoing" src={slides[outgoingIndex].image} alt="" aria-hidden="true" />}
              <img key={activeIndex} className="celebration-image incoming" src={active.image} alt={active.alt} fetchPriority={activeIndex === 0 ? 'high' : 'auto'} loading={activeIndex === 0 ? 'eager' : 'lazy'} />
              <span className="celebration-image-shade" aria-hidden="true" />
              <span className="celebration-image-index">{String(activeIndex + 1).padStart(2, '0')} <i /> 06</span>
              <Link className="celebration-image-cta" href={active.href}>Explore <ArrowUpRight size={16} /></Link>
            </div>
            <div className="celebration-next-preview" aria-hidden="true">
              <img src={slides[nextIndex].image} alt="" loading="lazy" />
              <span>UP NEXT <b>{slides[nextIndex].nav}</b></span>
            </div>
          </div>
          <div className="celebration-slide-copy" key={`copy-${activeIndex}`}>
            <span className="celebration-slide-number">{String(activeIndex + 1).padStart(2, '0')}</span>
            <span className="celebration-slide-meta">{active.meta}</span>
            <h3>{active.title}</h3>
            <p>{active.description}</p>
            <Link className="celebration-explore-link" href={active.href}>Explore <ArrowRight size={16} /></Link>
          </div>
        </div>

        <nav className="celebration-category-nav" aria-label="Choose a celebration category">
          {slides.map((slide, index) => <button type="button" key={slide.nav} className={index === activeIndex ? 'active' : ''} aria-current={index === activeIndex ? 'true' : undefined} aria-label={`Show ${slide.title}`} onClick={() => changeSlide(index)}>
            <span>{String(index + 1).padStart(2, '0')}</span>{slide.nav}
          </button>)}
        </nav>

        <div className="celebration-carousel-footer">
          <div className="celebration-progress" role="presentation"><span key={activeIndex} style={{ animationDuration: `${AUTOPLAY_MS}ms`, animationPlayState: paused || reducedMotion ? 'paused' : 'running' }} /></div>
          <div className="celebration-controls">
            <span className="celebration-counter"><b>{String(activeIndex + 1).padStart(2, '0')}</b> / {String(slides.length).padStart(2, '0')}</span>
            <button type="button" aria-label="Previous celebration category" onClick={() => changeSlide(activeIndex - 1)}><ArrowLeft size={18} /></button>
            <button type="button" aria-label="Next celebration category" onClick={() => changeSlide(activeIndex + 1)}><ArrowRight size={18} /></button>
          </div>
        </div>
      </div>
    </div>
  </section>;
}
