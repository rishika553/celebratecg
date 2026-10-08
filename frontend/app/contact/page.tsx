import type { Metadata } from 'next';
import ContactHub from '@/components/contact-hub';

export const metadata: Metadata = {
  title: 'Contact CelebrateCG | Celebration Support & Booking Concierge',
  description: 'Connect with CelebrateCG for venue bookings, farmhouses, villas, resorts, and host listings across Chhattisgarh.',
};

export default function ContactPage() {
  return (
    <main className="contact-page">
      <section className="contact-hero">
        <div className="section contact-hero-inner">
          <span className="eyebrow">CELEBRATION SUPPORT &amp; CONCIERGE</span>
          <h1>Let’s make your next<br /><em>celebration unforgettable.</em></h1>
          <p>
            Whether you are booking a luxury farmhouse, reserving a wedding lawn, or listing your property as a CelebrateCG host—our regional advisors are here to assist you every step of the way.
          </p>
        </div>
      </section>

      <ContactHub />
    </main>
  );
}
