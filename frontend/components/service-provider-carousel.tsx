'use client';

import { CSSProperties, KeyboardEvent, PointerEvent, TransitionEvent, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import { serviceProviders } from '@/lib/site-content';

const services = [
  { ...serviceProviders[0], nav: 'Music' },
  { ...serviceProviders[1], nav: 'Food' },
  { ...serviceProviders[2], nav: 'Decor' },
  { ...serviceProviders[5], nav: 'Production' },
  { ...serviceProviders[4], nav: 'Photography', image: '/service-photography.webp' },
  { ...serviceProviders[3], nav: 'Mehndi & More', image: '/service-mehndi.webp' },
];

const TRANSITION_MS = 820;
const CONTINUOUS_TRANSITION_MS = 4200;
const INTERACTION_PAUSE_MS = 1800;

export default function ServiceProviderCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [trackIndex, setTrackIndex] = useState(1);
  const [step, setStep] = useState(360);
  const [dragOffset, setDragOffset] = useState(0);
  const [transitioning, setTransitioning] = useState(true);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [automaticMovement, setAutomaticMovement] = useState(true);
  const [movementDuration, setMovementDuration] = useState(CONTINUOUS_TRANSITION_MS);
  const [cycleKey, setCycleKey] = useState(0);
  const viewportRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const resumeRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pointerStartRef = useRef<number | null>(null);
  const draggedRef = useRef(false);
  const loopedServices = useMemo(() => [services[services.length - 1], ...services, services[0]], []);

  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const mobileQuery = window.matchMedia('(max-width: 760px)');
    const syncPreferences = () => {
      setReducedMotion(motionQuery.matches);
      setMobile(mobileQuery.matches);
    };
    syncPreferences();
    motionQuery.addEventListener('change', syncPreferences);
    mobileQuery.addEventListener('change', syncPreferences);
    return () => {
      motionQuery.removeEventListener('change', syncPreferences);
      mobileQuery.removeEventListener('change', syncPreferences);
    };
  }, []);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const measure = () => {
      const width = viewport.clientWidth;
      const gap = width <= 760 ? 14 : 18;
      const cardWidth = width <= 760 ? width : width <= 980 ? width * 0.57 : Math.min(400, width * 0.31);
      setStep(cardWidth + gap);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (reducedMotion || paused || animating || dragOffset !== 0) return;
    animationFrameRef.current = window.requestAnimationFrame(() => moveBy(1, false));
    return () => { if (animationFrameRef.current !== null) window.cancelAnimationFrame(animationFrameRef.current); };
  }, [animating, cycleKey, dragOffset, paused, reducedMotion]);

  useEffect(() => () => {
    if (animationFrameRef.current !== null) window.cancelAnimationFrame(animationFrameRef.current);
    if (resumeRef.current) clearTimeout(resumeRef.current);
  }, []);

  function scheduleResume() {
    setPaused(true);
    if (resumeRef.current) clearTimeout(resumeRef.current);
    resumeRef.current = setTimeout(() => {
      setCycleKey(current => current + 1);
      setPaused(false);
    }, INTERACTION_PAUSE_MS);
  }

  function moveBy(direction: -1 | 1, fromInteraction = true) {
    const nextIndex = (activeIndex + direction + services.length) % services.length;
    setAutomaticMovement(!fromInteraction);
    setMovementDuration(fromInteraction ? TRANSITION_MS : CONTINUOUS_TRANSITION_MS);
    setTransitioning(!reducedMotion);
    setTrackIndex(current => reducedMotion ? nextIndex + 1 : current + direction);
    setActiveIndex(nextIndex);
    setAnimating(!reducedMotion);
    setDragOffset(0);
    setCycleKey(current => current + 1);
    if (fromInteraction) scheduleResume();
  }

  function moveTo(index: number) {
    setAutomaticMovement(false);
    setMovementDuration(TRANSITION_MS);
    setTransitioning(!reducedMotion);
    setTrackIndex(index + 1);
    setActiveIndex(index);
    setAnimating(!reducedMotion);
    setDragOffset(0);
    setCycleKey(current => current + 1);
    scheduleResume();
  }

  function handleTransitionEnd(event: TransitionEvent<HTMLDivElement>) {
    if (event.currentTarget !== event.target || event.propertyName !== 'transform') return;
    setAnimating(false);
    if (trackIndex === services.length + 1) {
      setTransitioning(false);
      setTrackIndex(1);
    } else if (trackIndex === 0) {
      setTransitioning(false);
      setTrackIndex(services.length);
    }
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    pointerStartRef.current = event.clientX;
    draggedRef.current = false;
    event.currentTarget.setPointerCapture(event.pointerId);
    setPaused(true);
    setTransitioning(false);
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (pointerStartRef.current === null) return;
    const distance = event.clientX - pointerStartRef.current;
    if (Math.abs(distance) > 6) draggedRef.current = true;
    setDragOffset(Math.max(-step * 0.55, Math.min(step * 0.55, distance)));
  }

  function handlePointerEnd(event: PointerEvent<HTMLDivElement>) {
    if (pointerStartRef.current === null) return;
    const distance = event.clientX - pointerStartRef.current;
    pointerStartRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    if (Math.abs(distance) > Math.min(70, step * 0.18)) moveBy(distance < 0 ? 1 : -1);
    else {
      setTransitioning(!reducedMotion);
      setDragOffset(0);
      scheduleResume();
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      moveBy(-1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      moveBy(1);
    }
  }

  const trackStyle = {
    '--service-card-width': `${step - (mobile ? 14 : 18)}px`,
    transform: `translate3d(${-(trackIndex * step) + dragOffset}px, 0, 0)`,
    transitionDuration: transitioning ? `${movementDuration}ms` : '0ms',
    transitionTimingFunction: automaticMovement ? 'linear' : 'cubic-bezier(.65,0,.35,1)',
  } as CSSProperties;

  return <section id="services" className="content-section service-providers-section">
    <div className="service-providers-inner">
      <div className="section-heading service-providers-heading">
        <div><span className="eyebrow">SERVICE PROVIDERS</span><h2>Book the people who make it happen.</h2><p className="muted">CelebrateCG brings venues and event-service partners together, so you can plan food, music, decor, mehndi, photography and production from one place.</p></div>
        <a className="text-button" href="/categories#event-services">Explore services <ArrowUpRight size={15} /></a>
      </div>

      <div
        ref={viewportRef}
        className={`service-carousel-viewport ${paused ? 'is-paused' : ''} ${dragOffset ? 'is-dragging' : ''}`}
        role="region"
        aria-roledescription="carousel"
        aria-label="Service providers"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        onClickCapture={event => { if (draggedRef.current) { event.preventDefault(); draggedRef.current = false; } }}
      >
        <div className="service-provider-track" style={trackStyle} onTransitionEnd={handleTransitionEnd}>
          {loopedServices.map((service, renderedIndex) => {
            const originalIndex = (renderedIndex - 1 + services.length) % services.length;
            const isActive = originalIndex === activeIndex;
            const isAccessible = renderedIndex === trackIndex;
            return <article className={`service-carousel-card ${isActive ? 'active' : 'inactive'}`} key={`${service.title}-${renderedIndex}`} aria-hidden={!isAccessible}>
              <img src={service.image} alt={isAccessible ? `${service.title} in Chhattisgarh` : ''} loading={renderedIndex <= 2 || originalIndex >= 4 ? 'eager' : 'lazy'} />
              <span className="service-provider-shade" aria-hidden="true" />
              <div className="service-carousel-card-copy"><small>{service.tag}</small><h3>{service.title}</h3><p>{service.description}</p><a href="/#contact" tabIndex={isAccessible ? 0 : -1}>Enquire now <ArrowUpRight size={14} /></a></div>
            </article>;
          })}
        </div>
      </div>

      <nav className="service-category-nav" aria-label="Choose a service category">
        {services.map((service, index) => <button type="button" key={service.nav} className={index === activeIndex ? 'active' : ''} aria-current={index === activeIndex ? 'true' : undefined} onClick={() => moveTo(index)}><span>{String(index + 1).padStart(2, '0')}</span>{service.nav}</button>)}
      </nav>

      <div className="service-carousel-footer">
        <div className="service-carousel-progress" aria-hidden="true"><span key={cycleKey} style={{ animationDuration: `${movementDuration}ms`, animationPlayState: paused || reducedMotion ? 'paused' : 'running' }} /></div>
        <div className="service-carousel-controls">
          <span className="service-carousel-counter" aria-live="polite"><b key={activeIndex}>{String(activeIndex + 1).padStart(2, '0')}</b> / {String(services.length).padStart(2, '0')}</span>
          <button type="button" aria-label="Previous service" onClick={() => moveBy(-1)}><ArrowLeft size={18} /></button>
          <button type="button" aria-label="Next service" onClick={() => moveBy(1)}><ArrowRight size={18} /></button>
        </div>
      </div>
    </div>
  </section>;
}
