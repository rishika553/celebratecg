import type { Metadata } from 'next';
import CategoriesDiscovery from '@/components/categories-discovery';

export const metadata: Metadata = {
  title: 'Celebration Categories | CelebrateCG',
  description: 'Explore farmhouses, luxury villas, resorts, wedding venues, picnic destinations and event services across Chhattisgarh.',
};

export default function CategoriesPage() {
  return <CategoriesDiscovery />;
}
