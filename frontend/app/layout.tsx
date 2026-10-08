import type { Metadata } from 'next';
import Header from '@/components/header';
import { SessionProvider } from '@/components/session';
import '@fontsource-variable/cormorant-garamond';
import '@fontsource-variable/cormorant-garamond/wght-italic.css';
import '@fontsource-variable/dm-sans';
import './globals.css';
import './theme.css';
import './content.css';
import './brand-theme.css';
import SiteFooter from '@/components/site-footer';
import ScrollReveal from '@/components/scroll-reveal';
export const metadata: Metadata = {
  title: 'CelebrateCG — Chhattisgarh’s Biggest Celebration Booking Platform',
  description: 'Discover, compare and book verified farmhouses, villas, resorts, wedding venues, banquet halls, party spaces and event services across Chhattisgarh.',
  keywords: ['farmhouse booking Chhattisgarh', 'wedding venues Raipur', 'resorts Chhattisgarh', 'banquet halls', 'event services Chhattisgarh', 'party venues'],
  openGraph: {
    title: 'CelebrateCG — Plan. Book. Celebrate.',
    description: 'Everything for every celebration in Chhattisgarh—venues, stays, weddings, parties and professional event services.',
    type: 'website',
  },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><SessionProvider><ScrollReveal /><Header />{children}<SiteFooter /></SessionProvider></body></html>;
}
