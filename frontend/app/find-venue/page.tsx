import type { Metadata } from 'next';
import { Suspense } from 'react';
import FindVenueMarketplace from '@/components/find-venue-marketplace';

export const metadata: Metadata = {
  title: 'Find a Venue | CelebrateCG',
  description: 'Search all approved CelebrateCG venues across Chhattisgarh by city, date, guests, price, category and facilities.',
};

export default function FindVenuePage() {
  return <Suspense fallback={<main className="find-venue-page"><div className="section"><div className="venue-grid" aria-label="Loading venues">{[1, 2, 3].map(item => <div className="skeleton" key={item} />)}</div></div></main>}><FindVenueMarketplace /></Suspense>;
}
