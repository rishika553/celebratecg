import type { Metadata } from 'next';
import LegalPage, { type LegalSection } from '@/components/legal-page';
import { site } from '@/lib/site-content';

export const metadata: Metadata = {
  title: 'Privacy Policy | CelebrateCG',
  description: 'How CelebrateCG collects, uses, shares, protects and retains personal data across marketplace accounts, bookings and payments.',
};

const sections: LegalSection[] = [
  { id: 'overview', title: 'Who we are', content: <>
    <p>CelebrateCG operates a marketplace for discovering and, where enabled, booking venues, event services and event tickets across Chhattisgarh. This Privacy Policy explains how CelebrateCG (“we”, “us” or “our”) handles personal data when you visit the Platform, create an account, publish a listing, make a booking, contact us or otherwise use our services.</p>
    <p>For questions or privacy requests, contact <a href={`mailto:${site.email}`}>{site.email}</a>. We are based in {site.headquarters}.</p>
  </> },
  { id: 'data', title: 'Data we collect', content: <>
    <p>Depending on how you use the Platform, we may collect:</p>
    <ul>
      <li><strong>Account data:</strong> name, email address, optional phone number, role, password hash, verification state and account status.</li>
      <li><strong>Vendor data:</strong> business and contact information, listing details, photographs, portfolio material, availability, pricing and approval records.</li>
      <li><strong>Booking data:</strong> selected venue, service or event, dates, guest counts, ticket quantities, preferences, status, cancellation reasons and communications.</li>
      <li><strong>Payment data:</strong> order and payment identifiers, amount, status, refund information and limited transaction metadata received from Razorpay. Payment credentials are collected by the payment provider rather than stored in our application database.</li>
      <li><strong>User content:</strong> reviews, ratings, wishlists, support requests and other material you submit.</li>
      <li><strong>Technical data:</strong> IP address, browser and device information, request logs, session cookies, security events and approximate location inferred from network information.</li>
    </ul>
  </> },
  { id: 'sources', title: 'Where data comes from', content: <>
    <p>We receive data directly from you, from another person making a booking that includes you, from Vendors involved in your order, from payment and infrastructure providers, and automatically when your browser communicates with the Platform. If you give us another person’s data, you must have authority to do so and should tell them how it will be used.</p>
  </> },
  { id: 'uses', title: 'How we use data', content: <>
    <p>We use personal data to:</p>
    <ul>
      <li>create and secure accounts, authenticate sessions and apply role-based permissions;</li>
      <li>publish and moderate listings, check availability and manage reservations;</li>
      <li>process bookings, tickets, payments, cancellations and refunds;</li>
      <li>connect customers with the Vendor responsible for fulfilling an order;</li>
      <li>send service messages and respond to support or grievance requests;</li>
      <li>detect fraud, abuse and security incidents and enforce our Terms;</li>
      <li>maintain records, comply with legal obligations and resolve disputes; and</li>
      <li>measure and improve Platform reliability, accessibility and user experience.</li>
    </ul>
    <p>Where applicable, we process data to provide a service you requested, comply with law, protect legitimate interests or based on your consent. You may withdraw consent for future consent-based processing, but this does not affect processing already lawfully completed.</p>
  </> },
  { id: 'cookies', title: 'Cookies and similar technology', content: <>
    <p>We use a strictly necessary, HTTP-only session cookie to keep you signed in and protect account access. We may also use security and performance logs required to operate the Platform. If optional analytics or advertising cookies are introduced, we will provide the notice and controls required by applicable law before using them.</p>
    <p>You can block cookies in your browser, but blocking the session cookie will prevent login and other account features from working.</p>
  </> },
  { id: 'sharing', title: 'When we share data', content: <>
    <p>We share only the data reasonably needed for the relevant purpose with:</p>
    <ul>
      <li><strong>Vendors:</strong> booking and contact details needed to prepare for and fulfil your order;</li>
      <li><strong>Razorpay:</strong> payment and transaction information needed to create, verify and reconcile payments or refunds;</li>
      <li><strong>Infrastructure providers:</strong> Vercel for the frontend, Render for the API, and Supabase for database and file storage;</li>
      <li><strong>Maps, communications and support providers:</strong> when those features are used to show locations or deliver requested messages;</li>
      <li><strong>Professional advisers and authorities:</strong> where reasonably necessary for legal compliance, safety, fraud prevention or dispute resolution; and</li>
      <li><strong>A successor organisation:</strong> in a merger, restructuring or transfer, subject to appropriate safeguards.</li>
    </ul>
    <p>We do not sell personal data for money. Vendors and third-party providers may independently control data they receive and publish their own privacy notices.</p>
  </> },
  { id: 'third-parties', title: 'Payments and third-party links', content: <>
    <p>Razorpay processes payment credentials in its checkout environment. We receive transaction references and status information needed to associate the payment with your order. Razorpay’s handling of payment data is governed by its own privacy notice.</p>
    <p>The Platform may embed maps or link to Vendor, social-media and third-party websites. Those services may collect data under their own policies. Opening an external link takes you outside our control, so review the destination’s terms and privacy information.</p>
  </> },
  { id: 'retention', title: 'How long we keep data', content: <>
    <p>We keep personal data only for as long as reasonably necessary for the purposes described here. Account data is generally retained while the account is active. Booking, payment, tax, complaint, fraud-prevention and audit records may be retained after account closure for applicable limitation, accounting and legal periods.</p>
    <p>When data is no longer required, we delete or anonymise it, unless preservation is required by law, an unresolved dispute, a security investigation or backup cycles. Removing a public listing does not immediately remove records connected to completed transactions.</p>
  </> },
  { id: 'security', title: 'Security and data location', content: <>
    <p>We use measures appropriate to the nature of the data, including encrypted network connections, restricted administrative access, password hashing, signed sessions, database permissions and payment-signature verification. No online service can promise absolute security. Please use a unique password and notify us promptly if you suspect unauthorised access.</p>
    <p>Our providers may process or back up data in India or other countries where they operate. Where applicable law requires it, we use contractual or other safeguards and comply with restrictions notified by competent authorities.</p>
  </> },
  { id: 'rights', title: 'Your choices and rights', content: <>
    <p>Subject to applicable law and relevant exceptions, you may ask us for a summary of your personal data and processing, request correction or completion, request erasure, withdraw consent, and seek grievance redressal. Where available under applicable law, you may also nominate another individual to exercise specified rights in the event of death or incapacity.</p>
    <p>Send a request from your registered email address to <a href={`mailto:${site.email}`}>{site.email}</a>. We may verify your identity before acting. Some data cannot be deleted immediately when it is required to complete a transaction, protect users, establish legal claims or comply with law. You may also complain to the competent data-protection authority when that remedy is available.</p>
  </> },
  { id: 'children', title: 'Children’s privacy', content: <>
    <p>The Platform is intended for adults who can enter binding contracts. People under 18 must not create an account or make a booking. If you believe a child has provided personal data, contact us so we can investigate and take appropriate action.</p>
  </> },
  { id: 'changes', title: 'Changes to this policy', content: <>
    <p>We may update this Policy as our services, providers or legal obligations change. The effective date above shows the latest revision. We will provide additional notice before a material change where required, and request fresh consent if the law requires it for a new purpose.</p>
  </> },
  { id: 'grievance', title: 'Contact and grievance redressal', content: <>
    <p>For privacy questions, rights requests or grievances, email <a href={`mailto:${site.email}`}>{site.email}</a> or contact us on WhatsApp at <a href={site.whatsapp}>{site.phone}</a>. Include “Privacy request” in the subject, identify the account involved and describe the concern. We will acknowledge and address valid requests within the period required by applicable law.</p>
  </> },
];

export default function PrivacyPage() {
  return <LegalPage eyebrow="Your information, explained clearly" title="Privacy Policy" summary="How CelebrateCG handles personal data across accounts, listings, bookings, payments and support." effectiveDate="28 September 2026" sections={sections} />;
}
