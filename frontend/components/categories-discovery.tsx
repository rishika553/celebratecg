'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Sparkles } from 'lucide-react';
import { api, Category } from '@/lib/api';
import { categories as venueVisuals } from '@/lib/site-content';

type Visual = { slug: string; name: string; description: string; image: string };
type DisplayCategory = Category & Visual;

const visualMap = new Map(venueVisuals.map(item => [item.slug, item]));
const fallbackImage = venueVisuals[0].image;
const imageSrc = (image: string) => image.startsWith('http') ? image : `https://images.hostinger.com/${image}.png`;

function decorate(category: Category): DisplayCategory {
  const visual = visualMap.get(category.slug);
  return {
    ...category,
    name: visual?.name || category.name,
    description: visual?.description || `Discover ${category.name.toLowerCase()} for celebrations across Chhattisgarh.`,
    image: visual?.image || fallbackImage,
  };
}

const fallbackCategories: Category[] = venueVisuals.map((item, index) => ({
  id: `venue-${index}`,
  name: item.name,
  slug: item.slug,
  type: 'venue' as const,
}));

function ImageCard({ category, index }: { category: DisplayCategory; index: number }) {
  return <Link className={`editorial-category-card category-card-${index + 1}`} href="/find-venue">
    <img src={imageSrc(category.image)} alt={`${category.name} in Chhattisgarh`} loading={index < 2 ? 'eager' : 'lazy'} />
    <span className="editorial-card-shade" aria-hidden="true" />
    <span className="editorial-card-number">{String(index + 1).padStart(2, '0')}</span>
    <span className="editorial-card-copy">
      <small><Sparkles size={11} /> {category.name.toUpperCase()}</small>
      <strong>{category.description}</strong>
      <span className="editorial-card-action">Explore venues <ArrowUpRight size={16} /></span>
    </span>
  </Link>;
}

export default function CategoriesDiscovery() {
  const [items, setItems] = useState<Category[]>(fallbackCategories);

  useEffect(() => {
    api<Category[]>('/categories?kind=venue')
      .then(data => data.length && setItems(data))
      .catch(() => {});
  }, []);

  const venueCategories = items.filter(item => item.type === 'venue').map(decorate);

  return <main className="categories-page">
    <section className="categories-hero">
      <img src={`https://images.hostinger.com/${venueVisuals[1].image}.png`} alt="Luxury celebration venue in Chhattisgarh" />
      <div className="categories-hero-shade" aria-hidden="true" />
      <div className="categories-hero-copy">
        <span className="eyebrow">EXPLORE WHAT’S POSSIBLE</span>
        <h1>Find the perfect<br /><em>place to celebrate.</em></h1>
        <p>Discover villas, farmhouses, resorts, stays and spaces made for unforgettable moments across Chhattisgarh.</p>
        <Link className="button button-primary" href="#category-gallery">Explore spaces <ArrowUpRight size={16} /></Link>
      </div>
      <span className="categories-hero-caption">Spaces for every kind of celebration.</span>
    </section>

    <section id="category-gallery" className="section categories-catalogue">
      <div className="categories-intro">
        <div><span className="eyebrow">EXPLORE BY SPACE</span><h2>What feels like you?</h2></div>
        <p>From an intimate escape to a celebration with everyone you love, find a setting that fits the moment.</p>
      </div>
      <div className="editorial-category-grid">
        {venueCategories.map((category, index) => <ImageCard category={category} index={index} key={category.id} />)}
      </div>
    </section>

    <section className="section categories-cta">
      <div><span className="eyebrow">YOUR CELEBRATION STARTS HERE</span><h2>Find a space that<br /><em>feels like yours.</em></h2></div>
      <Link className="button button-light" href="/find-venue">Browse all venues <ArrowUpRight size={17} /></Link>
    </section>
  </main>;
}
