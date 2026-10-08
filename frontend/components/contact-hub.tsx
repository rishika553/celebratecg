'use client';

import { FormEvent, useState } from 'react';
import { ArrowRight, ArrowUpRight, Check, ChevronDown, Clock, Mail, MapPin, MessageCircle, Phone, Send, Sparkles } from 'lucide-react';
import LocationMap from '@/components/location-map';
import { cities, site, socialLinks } from '@/lib/site-content';

const TOPICS = [
  { id: 'venue-booking', label: 'Venue Booking', icon: '🏰', subject: 'Enquiry for Venue Booking in Chhattisgarh' },
  { id: 'list-property', label: 'List My Space / Host', icon: '🏡', subject: 'Want to list my property on CelebrateCG' },
  { id: 'wedding-package', label: 'Wedding & Packages', icon: '💍', subject: 'Wedding or celebration package inquiry' },
  { id: 'urgent-date', label: 'Urgent Date Check', icon: '⚡', subject: 'Urgent venue availability check' },
  { id: 'general-support', label: 'General / Support', icon: '✨', subject: 'General question about CelebrateCG' },
];

const FAQS = [
  {
    q: 'How quickly does the CelebrateCG team respond?',
    a: 'For urgent bookings via WhatsApp, our team typically responds within 15 to 30 minutes during support hours (10:00 AM – 7:00 PM). Form and email inquiries are addressed within 2 hours.',
  },
  {
    q: 'Can I arrange a physical site visit of a venue before booking?',
    a: 'Yes! CelebrateCG facilitates guided site visits for verified farmhouses, villas, and banquet halls. Connect with us with your target date and our team will coordinate with the property host.',
  },
  {
    q: 'How can I register my property or resort as a CelebrateCG host?',
    a: 'Select "List My Space / Host" on this form or click "Become a host" in the top navigation. Once submitted, our onboarding team verifies your property details and photography for publishing.',
  },
  {
    q: 'What celebration locations across Chhattisgarh are covered?',
    a: 'We cover Raipur, Bhilai, Durg, Bilaspur, Rajnandgaon, Jagdalpur, Korba, Raigarh and scenic nature spots across the state.',
  },
];

export default function ContactHub() {
  const [selectedTopic, setSelectedTopic] = useState(TOPICS[0]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [date, setDate] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  function handleTopicChange(topic: typeof TOPICS[number]) {
    setSelectedTopic(topic);
  }

  function handleFormSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      setSubmitted(true);
    }, 700);
  }

  function openWhatsAppWithDetails() {
    const lines = [
      `*Hello CelebrateCG Team!*`,
      `*Enquiry:* ${selectedTopic.label}`,
      name ? `*Name:* ${name}` : null,
      phone ? `*Phone:* ${phone}` : null,
      city ? `*City:* ${city}` : null,
      date ? `*Target Date:* ${date}` : null,
      message ? `*Message:* ${message}` : `I'd like to check details for ${selectedTopic.label}.`,
    ].filter(Boolean).join('\n');

    window.open(`${site.whatsapp}?text=${encodeURIComponent(lines)}`, '_blank', 'noopener,noreferrer');
  }

  return (
    <div className="contact-hub-wrapper">
      {/* Dynamic Sliding Topic Selector Bar */}
      <section className="contact-topic-slider-section">
        <div className="section">
          <div className="topic-slider-heading">
            <span className="eyebrow"><Sparkles size={13} /> SELECT YOUR CELEBRATION NEED</span>
            <p>Click a topic to instantly align your enquiry with our team</p>
          </div>
          <div className="topic-slider-track" role="tablist" aria-label="Contact topics">
            {TOPICS.map((topic) => {
              const active = selectedTopic.id === topic.id;
              return (
                <button
                  key={topic.id}
                  type="button"
                  className={`topic-pill ${active ? 'active' : ''}`}
                  onClick={() => handleTopicChange(topic)}
                  role="tab"
                  aria-selected={active}
                >
                  <span className="topic-icon">{topic.icon}</span>
                  <span className="topic-label">{topic.label}</span>
                  {active && <span className="topic-active-sparkle" />}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Grid: Interactive Form (Left) & Sliding Quick Channels (Right) */}
      <section className="section contact-main-grid">
        {/* Left: Dynamic Form Card */}
        <div className="contact-form-card dynamic-form-card">
          <div className="form-card-badge">
            <span className="badge-sparkle">★</span>
            <span>Priority Response Hub</span>
          </div>

          <h2>Tell us about your plans.</h2>
          <p className="form-card-intro">
            Currently inquiring for: <strong className="highlight-topic">{selectedTopic.label}</strong>
          </p>

          {submitted ? (
            <div className="form-success-card">
              <div className="success-icon-wrap">
                <Check size={28} />
              </div>
              <h3>Thank you, {name || 'Celebration Host'}!</h3>
              <p>Your enquiry for <strong>{selectedTopic.label}</strong> has been received by the CelebrateCG team.</p>
              <p className="success-note">Need an instant response right now?</p>
              <button type="button" className="button button-primary whatsapp-instant-cta" onClick={openWhatsAppWithDetails}>
                <MessageCircle size={18} /> Continue to WhatsApp Chat
              </button>
              <button type="button" className="text-button reset-form-btn" onClick={() => setSubmitted(false)}>
                Send another message
              </button>
            </div>
          ) : (
            <form className="contact-interactive-form" onSubmit={handleFormSubmit}>
              <div className="form-row two-cols">
                <label className="floating-field">
                  <span>Your Full Name *</span>
                  <input
                    name="name"
                    required
                    placeholder="e.g. Yashwardhan Verma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </label>
                <label className="floating-field">
                  <span>Email Address *</span>
                  <input
                    name="email"
                    type="email"
                    required
                    placeholder="yash@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </label>
              </div>

              <div className="form-row three-cols">
                <label className="floating-field">
                  <span>Phone / WhatsApp *</span>
                  <input
                    name="phone"
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </label>
                <label className="floating-field">
                  <span>Celebration City</span>
                  <select
                    name="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  >
                    <option value="">Choose a city</option>
                    {cities.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </label>
                <label className="floating-field">
                  <span>Target Date (Optional)</span>
                  <input
                    name="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </label>
              </div>

              <label className="floating-field">
                <span>Message or Requirements *</span>
                <textarea
                  name="message"
                  required
                  rows={4}
                  placeholder={`Share budget, expected guest count, venue preferences or questions regarding ${selectedTopic.label}...`}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </label>

              <div className="form-actions-bar">
                <button className="button button-primary submit-action-btn" type="submit" disabled={busy}>
                  <Send size={16} /> {busy ? 'Submitting...' : 'Send Message'}
                </button>
                <button
                  type="button"
                  className="button button-outline whatsapp-direct-btn"
                  onClick={openWhatsAppWithDetails}
                >
                  <MessageCircle size={17} /> Chat on WhatsApp <ArrowUpRight size={14} />
                </button>
              </div>

              <p className="form-footnote">
                🔒 Your contact details are kept private and used only for your celebration enquiry.
              </p>
            </form>
          )}
        </div>

        {/* Right: Dynamic Sliding Channels & Quick Touchpoints */}
        <div className="contact-channels-panel">
          <div className="channels-heading">
            <span className="eyebrow">DIRECT REACH</span>
            <h3>Quick celebration channels.</h3>
            <p>Choose the fastest way to connect with our regional advisors.</p>
          </div>

          <div className="sliding-cards-stack">
            {/* WhatsApp Card */}
            <a
              href={`${site.whatsapp}?text=${encodeURIComponent(`Hello CelebrateCG, I'd like to ask about ${selectedTopic.label}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="channel-card channel-whatsapp"
            >
              <div className="channel-icon-wrap whatsapp-icon">
                <MessageCircle size={24} />
                <span className="pulse-indicator" />
              </div>
              <div className="channel-body">
                <div className="channel-title-row">
                  <h4>WhatsApp Priority Desk</h4>
                  <span className="channel-status">Online Now</span>
                </div>
                <p>Fastest channel for availability, venue photos, and pricing quotes.</p>
                <strong className="channel-highlight">{site.phone}</strong>
              </div>
              <span className="channel-sliding-arrow">
                <ArrowRight size={18} />
              </span>
            </a>

            {/* Phone Card */}
            <a href={`tel:${site.phone.replace(/[^0-9+]/g, '')}`} className="channel-card channel-phone">
              <div className="channel-icon-wrap phone-icon">
                <Phone size={24} />
              </div>
              <div className="channel-body">
                <div className="channel-title-row">
                  <h4>Direct Voice Hotline</h4>
                  <span className="channel-status secondary">10 AM – 7 PM</span>
                </div>
                <p>Speak directly with our celebration onboarding coordinator.</p>
                <strong className="channel-highlight">{site.phone}</strong>
              </div>
              <span className="channel-sliding-arrow">
                <ArrowRight size={18} />
              </span>
            </a>

            {/* Email Card */}
            <a href={`mailto:${site.email}?subject=${encodeURIComponent(selectedTopic.subject)}`} className="channel-card channel-email">
              <div className="channel-icon-wrap email-icon">
                <Mail size={24} />
              </div>
              <div className="channel-body">
                <div className="channel-title-row">
                  <h4>Official Email</h4>
                  <span className="channel-status secondary">&lt; 2hr reply</span>
                </div>
                <p>For vendor partnerships, formal contracts, and large wedding scopes.</p>
                <strong className="channel-highlight">{site.email}</strong>
              </div>
              <span className="channel-sliding-arrow">
                <ArrowRight size={18} />
              </span>
            </a>

            {/* Studio HQ Card */}
            <div className="channel-card channel-hq">
              <div className="channel-icon-wrap hq-icon">
                <MapPin size={24} />
              </div>
              <div className="channel-body">
                <div className="channel-title-row">
                  <h4>Chhattisgarh Launch Hub</h4>
                  <span className="channel-status gold">HQ Raipur</span>
                </div>
                <p>Central operations covering all 8 celebration districts statewide.</p>
                <strong className="channel-highlight">{site.headquarters}</strong>
              </div>
              <span className="channel-sliding-arrow">
                <Sparkles size={18} />
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Sliding FAQ Accordion */}
      <section className="section contact-faq-accordion-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">COMMON QUESTIONS</span>
            <h2>Everything you wanted to ask.</h2>
            <p className="muted">Quick answers to help you book and plan with complete peace of mind.</p>
          </div>
        </div>

        <div className="faq-accordion-list">
          {FAQS.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={idx} className={`faq-accordion-item ${isOpen ? 'open' : ''}`}>
                <button
                  type="button"
                  className="faq-accordion-trigger"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  aria-expanded={isOpen}
                >
                  <span className="faq-question-text">{faq.q}</span>
                  <span className="faq-chevron-wrap">
                    <ChevronDown size={18} />
                  </span>
                </button>
                <div className="faq-accordion-content">
                  <p>{faq.a}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Location Map & State Trust Banner */}
      <section className="section contact-map-hub-section">
        <div className="contact-map-card">
          <div className="contact-map-info">
            <span className="eyebrow">STATEWIDE PRESENCE</span>
            <h2>Made with pride in Chhattisgarh.</h2>
            <p>
              CelebrateCG connects families, couples, and hosts across Chhattisgarh with verified farmhouses, luxury villas, and celebration spaces.
            </p>
            <div className="hq-social-pill-bar">
              {socialLinks.map(([name, url]) => (
                <a key={name} href={url} target="_blank" rel="noopener noreferrer" className="hq-social-chip">
                  {name} <ArrowUpRight size={13} />
                </a>
              ))}
            </div>
          </div>
          <div className="contact-map-frame">
            <LocationMap
              location={site.headquarters}
              title="CelebrateCG Launch Headquarters — Raipur, Chhattisgarh"
              note="Raipur city center hub. For meetings, contact team prior to visiting."
            />
          </div>
        </div>
      </section>
    </div>
  );
}
