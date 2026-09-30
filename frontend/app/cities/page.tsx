import type { Metadata } from 'next';
import { Suspense } from 'react';
import CitiesExplorer from '@/components/cities-explorer';

export const metadata: Metadata = {
  title: 'Cities & Venue Map | CelebrateCG',
  description: 'Discover celebration venues, stays and experiences by destination across Chhattisgarh.',
};

export default function CitiesPage() {
  return <Suspense fallback={<main className="cities-page"><div className="cities-page-loading">Finding destinations…</div></main>}><CitiesExplorer /></Suspense>;
}
