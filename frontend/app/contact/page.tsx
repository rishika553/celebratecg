import type { Metadata } from 'next';
import { ArrowUpRight, Clock, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import LocationMap from '@/components/location-map';
import { site, socialLinks } from '@/lib/site-content';

export const metadata: Metadata = {
  title: 'Contact CelebrateCG | Celebration Booking Support',
  description: 'Contact CelebrateCG for venue bookings, service-provider enquiries, property listings and celebration planning support across Chhattisgarh.',
};

const contactCards = [
  { icon: Phone, title: 'Phone', text: 'Call us for booking help, venue questions and listing support.', lines: [site.phone] },
  { icon: MessageCircle, title: 'WhatsApp', text: 'Send your date, city, guest count and celebration type.', lines: ['Quick response for urgent plans'] },
  { icon: Mail, title: 'Email', text: 'Write to us for partnerships, support and business queries.', lines: [site.email] },
  { icon: Clock, title: 'Support hours', text: 'We are onboarding venues and partners across Chhattisgarh.', lines: ['10:00 AM – 7:00 PM', 'Monday to Saturday'] },
];

const enquiryTypes = ['Venue booking', 'Service provider', 'List my space', 'Wedding or party package'];

export default function ContactPage() {
  return <main className="contact-page">
    <section className="contact-hero">
      <div className="section contact-hero-inner">
        <span className="eyebrow">WE ARE HERE TO HELP</span>
        <h1>Get in <em>touch.</em></h1>
        <p>Have questions about venues, event services, bookings or listing your property? Tell us what you are planning and the CelebrateCG team will help you take the next step.</p>
      </div>
    </section>

    <section className="section contact-main-section">
      <form className="contact-form-card">
        <span className="eyebrow">SEND US A MESSAGE</span>
        <h2>Tell us about your celebration.</h2>
        <div className="contact-form-grid">
          <label>Full name *<input name="name" required placeholder="Your full name" /></label>
          <label>Email address *<input name="email" type="email" required placeholder="your.email@example.com" /></label>
          <label>Phone number<input name="phone" type="tel" placeholder="+91 98765 43210" /></label>
          <label>Subject *<input name="subject" required placeholder="How can we help?" /></label>
        </div>
        <label>What do you need? *<select name="type" required defaultValue=""><option value="" disabled>Select enquiry type</option>{enquiryTypes.map(type => <option key={type}>{type}</option>)}</select></label>
        <label>Message *<textarea name="message" required rows={6} placeholder="Share your city, date, guest count, budget or service requirement." /></label>
        <button className="button button-primary" type="submit">Send message <ArrowUpRight size={16} /></button>
        <p className="form-note">This form is ready for the design flow. Until form submission is connected, use WhatsApp or email for real enquiries.</p>
      </form>

      <div className="contact-info-panel">
        <span className="eyebrow">CONTACT INFORMATION</span>
        <h2>Plan, list or partner with CelebrateCG.</h2>
        <p>Reach out for farmhouse bookings, wedding venues, party spaces, DJs, catering, decor, mehndi, photography, vendor onboarding and celebration packages across Chhattisgarh.</p>
        <div className="contact-card-list">
          {contactCards.map(({ icon: Icon, title, text, lines }) => <article className="contact-info-card" key={title}>
            <span className="contact-card-icon"><Icon size={22} /></span>
            <div><h3>{title}</h3><p>{text}</p>{lines.map(line => <strong key={line}>{line}</strong>)}</div>
          </article>)}
        </div>
      </div>
    </section>

    <section className="section contact-location-section">
      <div className="contact-location-copy">
        <span className="eyebrow">LAUNCH HQ</span>
        <h2>Made in Chhattisgarh.</h2>
        <p>CelebrateCG is building a trusted celebration marketplace from Raipur for venues, stays and service partners across the state.</p>
        <div className="contact-socials">{socialLinks.map(([name, url]) => <a href={url} target="_blank" rel="noopener noreferrer" key={name}>{name}<ArrowUpRight size={13} /></a>)}</div>
      </div>
      <LocationMap location={site.headquarters} title="CelebrateCG launch headquarters — Raipur, Chhattisgarh" note="Raipur city view. Contact the team for an exact meeting address." />
    </section>
  </main>;
}
