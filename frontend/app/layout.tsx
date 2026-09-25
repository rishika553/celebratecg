import type { Metadata } from 'next';
import Header from '@/components/header';
import { SessionProvider } from '@/components/session';
import '@fontsource-variable/cormorant-garamond';
import '@fontsource-variable/cormorant-garamond/wght-italic.css';
import '@fontsource-variable/dm-sans';
import './globals.css';
import './theme.css';
import './content.css';
import SiteFooter from '@/components/site-footer';
import ScrollReveal from '@/components/scroll-reveal';
export const metadata: Metadata = { title: 'CelebrateCG — Farmhouse, Resort & Wedding Venue Booking in Chhattisgarh', description: 'Plan. Book. Celebrate. Discover farmhouses, luxury villas, private resorts, homestays, wedding venues and event services across Chhattisgarh.' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><SessionProvider><ScrollReveal /><Header />{children}<SiteFooter /></SessionProvider></body></html>;
}
