import type { Metadata } from 'next';
import LegalPage, { type LegalSection } from '@/components/legal-page';
import { site } from '@/lib/site-content';

export const metadata: Metadata = {
  title: 'Terms and Conditions | CelebrateCG',
  description: 'Terms governing accounts, listings, bookings, event tickets, payments, cancellations and use of the CelebrateCG marketplace.',
};

const sections: LegalSection[] = [
  { id: 'acceptance', title: 'Acceptance and scope', content: <>
    <p>These Terms and Conditions (“Terms”) govern your use of the CelebrateCG website, applications and related services (the “Platform”). The Platform helps customers discover and, where enabled, book venues, event services and event tickets offered by independent property owners, service providers and event organisers (“Vendors”).</p>
    <p>By creating an account, publishing a listing or placing an order, you agree to these Terms and the <a href="/privacy">Privacy Policy</a>. If you act for a business or organisation, you confirm that you are authorised to bind it. Features described here apply only when they are available on the Platform.</p>
  </> },
  { id: 'marketplace', title: 'Our marketplace role', content: <>
    <p>CelebrateCG provides marketplace, booking and payment-support technology. Unless a listing expressly says otherwise, the Vendor—not CelebrateCG—owns, manages and supplies the venue, service or event. A booking creates a direct service arrangement between the customer and the relevant Vendor, subject to the listing details and cancellation policy shown at checkout.</p>
    <p>We may review Vendors and listings, but approval is not a guarantee of quality, safety, legality or suitability. Customers should review the listing, rules, accessibility, capacity and policies and ask the Vendor any important questions before booking.</p>
  </> },
  { id: 'accounts', title: 'Eligibility and accounts', content: <>
    <p>You must be at least 18 years old and legally capable of entering a contract to create an account or make a booking. You must provide accurate, current information and keep your login credentials confidential. You are responsible for activity performed through your account unless you promptly tell us about unauthorised access.</p>
    <p>Customer, Vendor and administrator permissions are different. Vendor accounts and listings may require approval before they become visible or can accept bookings. You may not impersonate another person, create deceptive accounts or attempt to bypass Platform permissions.</p>
  </> },
  { id: 'vendors', title: 'Vendor responsibilities', content: <>
    <p>Vendors must have the authority, licences, registrations, permissions and insurance required to offer their listings. Listing descriptions, photographs, prices, taxes, facilities, capacity, availability, rules and cancellation terms must be accurate and kept current. Vendors must honour confirmed bookings and must not substitute a materially different venue, service or ticket without the customer’s informed agreement.</p>
    <p>Vendors are responsible for service delivery, staff, site safety, permits, statutory invoices and taxes applicable to their supplies. CelebrateCG may request supporting documents, moderate content, pause a listing or withhold publication while information is reviewed.</p>
  </> },
  { id: 'bookings', title: 'Bookings, availability and pricing', content: <>
    <p>Search results and availability are invitations to book, not guaranteed reservations. A booking is confirmed only when the Platform displays confirmation after the required payment and any stated Vendor approval. A pending checkout may hold inventory for a limited period and can expire if payment is not completed.</p>
    <p>The price and inclusions shown at checkout govern the order. Optional services, overtime, security deposits, damage charges, local permissions or taxes not expressly included may be payable separately when clearly disclosed by the Vendor. Obvious technical pricing errors may be corrected before confirmation; if an error affects a confirmed booking, we will offer the lawful remedy available in the circumstances.</p>
  </> },
  { id: 'payments', title: 'Payments and commissions', content: <>
    <p>Online payments are processed through Razorpay or another payment provider identified at checkout. CelebrateCG does not ask you to send complete card credentials through its own forms. Payment providers may apply their own terms and privacy notices.</p>
    <p>Where advance and balance payments are offered, checkout will state the amounts and due dates. Failure to pay a required balance may result in cancellation under the disclosed policy. Platform fees or Vendor commissions do not reduce the customer’s mandatory consumer rights.</p>
  </> },
  { id: 'cancellations', title: 'Cancellations and refunds', content: <>
    <p>The cancellation policy displayed for the listing at the time of booking forms part of the order. Refund eligibility depends on that policy, the reason and timing of cancellation, services already supplied and applicable law. Payment-provider charges and non-refundable components will be disclosed where relevant.</p>
    <p>If a Vendor cancels or cannot provide the confirmed booking, we will help arrange an appropriate remedy, such as a replacement, rescheduling or refund, based on availability and applicable law. Approved refunds are returned through the original payment method where practicable and may take additional banking time. Chargebacks must be raised honestly and should not be used to avoid a valid cancellation policy.</p>
  </> },
  { id: 'events', title: 'Events and tickets', content: <>
    <p>Event dates, admission rules, age restrictions, ticket tiers and entry conditions are set by the event organiser. A ticket may not be copied, resold unlawfully or used more than once. Postponement, cancellation and refund arrangements are subject to the organiser’s disclosed policy and applicable law.</p>
    <p>Customers are responsible for arriving on time with required identification and complying with lawful venue and event rules. Organisers remain responsible for operating their event, admission decisions, permits and safety.</p>
  </> },
  { id: 'conduct', title: 'Content, reviews and acceptable use', content: <>
    <p>You may submit truthful reviews and content that you own or are authorised to use. You grant CelebrateCG a non-exclusive, worldwide, royalty-free licence to host, reproduce and display that content for operating and promoting the Platform. You retain ownership of your content and may request removal, subject to records we must lawfully retain.</p>
    <p>You must not publish illegal, discriminatory, threatening, defamatory, deceptive or infringing material; manipulate reviews; scrape the Platform; introduce malicious code; test security without permission; or use the Platform to facilitate fraud. We may moderate or remove content and restrict accounts where reasonably necessary.</p>
  </> },
  { id: 'ip', title: 'Intellectual property', content: <>
    <p>The CelebrateCG name, design, software, original text and Platform arrangement are owned by or licensed to CelebrateCG. These Terms give you a limited, revocable right to use the Platform for its intended purpose. They do not transfer our intellectual property or a Vendor’s photographs, trademarks or other content to you.</p>
  </> },
  { id: 'liability', title: 'Availability and responsibility', content: <>
    <p>We work to keep the Platform accurate and available, but maintenance, network failures and third-party services may cause interruptions. Nothing in these Terms excludes liability or remedies that cannot lawfully be excluded, including mandatory consumer protections.</p>
    <p>To the extent permitted by law, CelebrateCG is not responsible for indirect or consequential loss, or for a Vendor’s acts, omissions, premises or service quality. Any limitation will be applied fairly in light of the transaction and applicable law. Customers and Vendors remain responsible for personal safety, possessions and compliance with lawful venue requirements.</p>
  </> },
  { id: 'termination', title: 'Suspension and termination', content: <>
    <p>You may stop using the Platform at any time, subject to outstanding bookings, payments and legal obligations. We may restrict or close an account for fraud, unsafe conduct, material breach, repeated complaints, legal requirements or risk to users or the Platform. Where appropriate, we will give notice and an opportunity to respond. Closing an account does not automatically cancel confirmed obligations.</p>
  </> },
  { id: 'changes', title: 'Changes, disputes and governing law', content: <>
    <p>We may update these Terms as the Platform develops or the law changes. We will post the revised date and provide additional notice where a material change requires it. Changes do not retroactively alter a completed order unless required by law or agreed with you.</p>
    <p>These Terms are governed by the laws of India. Before starting formal proceedings, please contact us so we can try to resolve the concern. Courts and consumer forums with jurisdiction under applicable law remain available, and nothing here limits a customer’s right to approach a competent consumer authority.</p>
  </> },
  { id: 'contact', title: 'Contact and grievances', content: <>
    <p>Questions, complaints and legal notices may be sent to <a href={`mailto:${site.email}`}>{site.email}</a> or by WhatsApp at <a href={site.whatsapp}>{site.phone}</a>. CelebrateCG is based in {site.headquarters}. Please include your account email, booking reference and a clear description of the issue so we can investigate it.</p>
  </> },
];

export default function TermsPage() {
  return <LegalPage eyebrow="The rules of our marketplace" title="Terms and Conditions" summary="Clear expectations for customers, property owners, service partners and event organisers using CelebrateCG." effectiveDate="28 September 2026" sections={sections} />;
}
