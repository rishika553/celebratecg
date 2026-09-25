'use client';

import { useEffect } from 'react';

const selector = [
  '.search-wrap',
  '.catalogue .section-heading',
  '.category-tabs',
  '.venue-card',
  '.value-card',
  '.launch-category',
  '.city-map-grid',
  '.benefit-card',
  '.referral-section',
  '.waitlist-section',
  '.faq-section',
  '.contact-grid',
  '.how-section',
  '.host-banner',
  '.panel',
  '.booking-item',
  '.detail-info',
  '.booking-panel',
].join(',');

const cardSelector = [
  '.venue-card',
  '.value-card',
  '.launch-category',
  '.benefit-card',
  '.booking-item',
].join(',');

export default function ScrollReveal() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let animationFrame = 0;

    const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

    // Checking the viewport directly keeps reveals reliable during fast wheel,
    // touch and programmatic scrolling. Elements that were scrolled past are
    // also revealed so the page can never be left with transparent gaps.
    const updateMotion = () => {
      animationFrame = 0;
      const viewportHeight = window.innerHeight;
      const mobileStrength = window.innerWidth <= 760 ? 0.52 : 1;
      const revealLine = viewportHeight * 0.9;

      document.querySelectorAll<HTMLElement>('.reveal-ready:not(.revealed)').forEach(element => {
        if (element.getBoundingClientRect().top <= revealLine) {
          element.classList.add('revealed');
        }
      });

      const header = document.querySelector<HTMLElement>('.header');
      header?.classList.toggle('header-scrolled', window.scrollY > 18);

      const hero = document.querySelector<HTMLElement>('.hero-video');
      if (hero) {
        const heroRect = hero.getBoundingClientRect();
        const progress = clamp(-heroRect.top / Math.max(heroRect.height, 1), 0, 1);
        const video = hero.querySelector<HTMLElement>('.hero-video-media');
        const copy = hero.querySelector<HTMLElement>('.hero-copy');
        const caption = hero.querySelector<HTMLElement>('.hero-video-caption');

        video?.style.setProperty('--hero-media-y', `${progress * 28 * mobileStrength}px`);
        video?.style.setProperty('--hero-media-scale', `${1 + progress * 0.075 * mobileStrength}`);
        copy?.style.setProperty('--hero-copy-y', `${progress * -48 * mobileStrength}px`);
        copy?.style.setProperty('--hero-copy-opacity', `${1 - progress * 0.82 * mobileStrength}`);
        caption?.style.setProperty('--hero-caption-y', `${progress * -25 * mobileStrength}px`);
        caption?.style.setProperty('--hero-caption-opacity', `${1 - progress * 0.7 * mobileStrength}`);
      }

      document.querySelectorAll<HTMLElement>('.cinematic-image').forEach(image => {
        const rect = image.getBoundingClientRect();
        if (rect.bottom < -80 || rect.top > viewportHeight + 80) return;
        const imageCenter = rect.top + rect.height / 2;
        const viewportProgress = clamp((viewportHeight / 2 - imageCenter) / viewportHeight, -0.7, 0.7);
        image.style.setProperty('--image-parallax-y', `${viewportProgress * 18 * mobileStrength}px`);
        image.style.setProperty('--image-parallax-scale', `${1.045 + Math.abs(viewportProgress) * 0.012 * mobileStrength}`);
      });
    };

    const queueReveal = () => {
      if (animationFrame) return;
      animationFrame = window.requestAnimationFrame(updateMotion);
    };

    const register = (root: ParentNode) => {
      const elements = root instanceof HTMLElement && root.matches(selector)
        ? [root, ...root.querySelectorAll<HTMLElement>(selector)]
        : [...root.querySelectorAll<HTMLElement>(selector)];
      elements.forEach((element, index) => {
        if (element.classList.contains('reveal-ready')) return;
        element.classList.add('reveal-ready');
        if (element.matches(cardSelector)) element.classList.add('reveal-card');

        const siblings = element.parentElement
          ? [...element.parentElement.children].filter(child => child.matches(selector))
          : [];
        const siblingIndex = Math.max(0, siblings.indexOf(element));
        const staggerIndex = siblings.length > 1 ? siblingIndex : index;
        element.style.setProperty('--reveal-delay', `${Math.min(staggerIndex % 4, 3) * 100}ms`);
      });

      const images = root instanceof HTMLElement && root.matches('.launch-category img, .detail-photos img, .card-image-media')
        ? [root, ...root.querySelectorAll<HTMLElement>('.launch-category img, .detail-photos img, .card-image-media')]
        : [...root.querySelectorAll<HTMLElement>('.launch-category img, .detail-photos img, .card-image-media')];
      images.forEach(image => image.classList.add('cinematic-image'));
      queueReveal();
    };

    register(document);
    const mutations = new MutationObserver(records => records.forEach(record => record.addedNodes.forEach(node => {
      if (node instanceof Element) register(node);
    })));
    mutations.observe(document.body, { childList: true, subtree: true });

    window.addEventListener('scroll', queueReveal, { passive: true });
    window.addEventListener('resize', queueReveal);
    queueReveal();

    return () => {
      mutations.disconnect();
      window.removeEventListener('scroll', queueReveal);
      window.removeEventListener('resize', queueReveal);
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
    };
  }, []);

  return null;
}
