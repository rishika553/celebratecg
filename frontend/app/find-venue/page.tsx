import type { Metadata } from 'next';
import FindVenueMarketplace from '@/components/find-venue-marketplace';

export const metadata: Metadata = {
  title: 'Find a Venue | CelebrateCG',
  description: 'Search all approved CelebrateCG venues across Chhattisgarh by city, date, guests, price, category and facilities.',
};

export default function FindVenuePage() {
  return <FindVenueMarketplace />;
}
