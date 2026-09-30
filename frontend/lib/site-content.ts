// Editorial content reviewed against https://celebratecg.in/ on 20 September 2026.
// Launch benefits describe the published programme, not completed booking features.
export const site = {
  signup: '/signup',
  phone: '+91 98930 47100',
  whatsapp: 'https://wa.me/919893047100',
  email: 'bookings@celebrategc.com',
  headquarters: 'Raipur, Chhattisgarh, India',
  launch: 'New Year’s Eve 2026',
  description: 'Discover, compare and book farmhouses, luxury villas, private resorts, eco stays, tourism properties, wedding venues, banquet halls, party spaces and event services across Chhattisgarh.',
  introduction: 'Whether you are planning a birthday or pool party, wedding, pre-wedding shoot, anniversary, family getaway, corporate retreat, college event or weekend staycation, CelebrateCG brings verified venues and professional event services together in one seamless experience.',
};

export const cities = ['Raipur', 'Bilaspur', 'Durg', 'Bhilai', 'Korba', 'Jagdalpur', 'Ambikapur', 'Raigarh'];

export const categories = [
  { slug: 'farmhouse', name: 'Farmhouses', description: 'Private lawns & pools for birthdays and weekend escapes', image: '313bd5ac-b0be-4841-949e-ec12cd24af3e' },
  { slug: 'luxury-villa', name: 'Luxury villas', description: 'Designer stays with private pools and full staff', image: '5cf7ea59-6377-48bd-a6f0-6d1abc74e409' },
  { slug: 'resort', name: 'Resorts', description: 'Full-property bookings for weddings and retreats', image: 'b2f651a9-1640-49ef-9e85-583dca21f24e' },
  { slug: 'eco-stay', name: 'Eco stays & homestays', description: 'Nature-led escapes and local stays with Chhattisgarhi hospitality', image: '75e458ce-f739-4f0d-9775-0b09a3056488' },
  { slug: 'hotel', name: 'Hotels', description: 'Comfortable stays for guests, gatherings and every occasion', image: 'ef27c464-72cd-4d97-8cf9-fbe843d32d97' },
  { slug: 'banquet-hall', name: 'Banquet halls', description: 'Designed for weddings, receptions and grand celebrations', image: 'f06d05d6-c219-4ca7-86b8-6b80f603db18' },
  { slug: 'lawn', name: 'Lawns & gardens', description: 'Open-air settings for celebrations under the sky', image: '13ed71a2-b5c8-4ef7-86e2-e7066244ac17' },
  { slug: 'picnic-destination', name: 'Picnic destinations', description: 'Nature-led places for day outings and relaxed gatherings', image: '6f406ad1-a8f4-4dba-91eb-dd4306cc228f' },
];

export const serviceCategories = [
  { slug: 'dj-entertainment', name: 'DJ & entertainment', description: 'DJs, anchors, artists and live entertainment that keep the celebration moving.', image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1200&q=80' },
  { slug: 'catering', name: 'Catering', description: 'Buffets, live counters, sweets and professional food service for every guest list.', image: 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=1200&q=80' },
  { slug: 'decoration', name: 'Decoration & themes', description: 'Stage decor, floral entries, balloons, haldi themes and full venue styling.', image: 'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&w=1200&q=80' },
  { slug: 'photography-video', name: 'Photography & video', description: 'Photography, cinematic films, reels and drone coverage to keep every memory.', image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80' },
  { slug: 'mehndi-makeup', name: 'Mehndi & makeup', description: 'Bridal mehndi, party makeup, hair styling and grooming artists for the big day.', image: 'https://images.unsplash.com/photo-1594647210801-5124307ef727?auto=format&fit=crop&w=1200&q=80' },
  { slug: 'sound-light-stage', name: 'Sound, lights & stage', description: 'Sound systems, LED walls, lighting rigs, truss, stage and dance-floor setup.', image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80' },
  { slug: 'tent-furniture', name: 'Tent & furniture', description: 'Shamiana, seating, tables, lounge furniture, generators and on-ground rentals.', image: 'https://images.unsplash.com/photo-1478146896981-b80fe463b330?auto=format&fit=crop&w=1200&q=80' },
  { slug: 'party-planners', name: 'Party planners', description: 'Birthday, anniversary, corporate and college-event planning from idea to execution.', image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1200&q=80' },
];

export const serviceProviders = [
  { title: 'DJ & live entertainment', tag: 'Music', description: 'Book DJs, anchors, singers, dhol groups and artist acts for weddings, birthdays and college events.', image: serviceCategories[0].image },
  { title: 'Catering & live counters', tag: 'Food', description: 'Compare caterers for buffets, snacks, desserts, mocktails and regional Chhattisgarhi menus.', image: serviceCategories[1].image },
  { title: 'Party decoration', tag: 'Decor', description: 'Get balloon decor, theme setups, floral entries, mandap styling and birthday backdrops.', image: serviceCategories[2].image },
  { title: 'Mehndi & makeup artists', tag: 'Beauty', description: 'Find bridal mehndi, engagement makeup, party looks, hair styling and grooming partners.', image: serviceCategories[4].image },
  { title: 'Photography, video & drone', tag: 'Memories', description: 'Hire photographers, cinematographers, reels teams and drone crews for complete coverage.', image: serviceCategories[3].image },
  { title: 'Sound, lighting & LED wall', tag: 'Production', description: 'Book sound, lights, LED screens, stage, truss and dance-floor production in one request.', image: serviceCategories[5].image },
  { title: 'Tent, furniture & generator', tag: 'Setup', description: 'Arrange tent house support, chairs, tables, lounge seating, coolers and backup power.', image: serviceCategories[6].image },
  { title: 'Complete party packages', tag: 'Planner', description: 'Let local planners handle vendors, timelines, setup and coordination for your celebration.', image: serviceCategories[7].image },
];

export const platformOfferings = [
  { title: 'Farmhouses across CG', description: 'Farmhouse booking in Raipur, Bilaspur, Durg, Bhilai, Korba, Jagdalpur and across Chhattisgarh.' },
  { title: 'Villas, resorts & stays', description: 'Luxury villas, pool villas, private resorts, eco resorts, staycations and government tourism properties.' },
  { title: 'Weddings & gatherings', description: 'Wedding lawns, banquet halls, destination wedding venues, party spaces and corporate event spaces.' },
  { title: 'Sound, stage & entertainment', description: 'DJ, sound, lighting, LED walls, stages, entertainment and artist booking for every scale of event.' },
  { title: 'Food, styling & memories', description: 'Decoration, theme setups, catering, photography, videography and drone shoots from professional partners.' },
  { title: 'Complete event support', description: 'Event planners, artists, furniture, tents, generators and complete celebration packages in one place.' },
];

export const benefits = [
  { title: 'Guest benefits', items: ['Verified properties with real photos', 'Transparent pricing before you book', 'Smart filters by city, budget, capacity and amenities', 'Venues and event services in one place', 'Direct booking with trusted local partners'] },
  { title: 'Property owner benefits', items: ['Zero listing fee for the first 100 property owners', 'Professional photoshoot and listing assistance', 'Bookings, calendar and payouts in one dashboard', 'Online payment gateway at launch — UPI, cards and net-banking', 'Statewide marketing across Chhattisgarh'] },
  { title: 'Service partner benefits', items: ['Verified event leads matched to your category and city', 'Zero commission for the first 100 service partners at launch', 'Your own profile page with portfolio and reviews', 'WhatsApp alerts for new bookings', 'Transparent payouts through the launch payment gateway'] },
];

export const faqs = [
  ['When is CelebrateCG launching?', 'CelebrateCG’s announced launch is New Year’s Eve 2026. Waitlist members get access before the public launch, in the order they joined.'],
  ['How do I get started?', 'Create an account on this website to explore venues or register as a property owner. Account registration here is separate from the launch waitlist.'],
  ['Which cities will CelebrateCG cover?', 'Raipur, Bilaspur, Durg, Bhilai, Korba, Jagdalpur, Ambikapur and Raigarh, with properties and partners across Chhattisgarh.'],
  ['What can I book on CelebrateCG?', 'The launch catalogue covers farmhouses, luxury villas, private resorts, homestays, government tourism properties, wedding venues and picnic spots, plus DJ, sound, lighting, decoration, catering, photography, videography and event planners. This local preview currently supports the venue booking flow.'],
  ['Will online payments be supported?', 'UPI, credit and debit cards, and net-banking are planned for launch. In this preview, checkout becomes available when the payment gateway is connected.'],
  ['How do referral rewards work?', 'The launch programme gives waitlist members a personal referral link. Earn celebration credits for friends who join and book, redeemable on stays and services. Referral links and credits become available at launch.'],
  ['Can I list a government tourism property?', 'Yes. Government resorts and tourism properties are a core category. Create a property owner account here. Host accounts are reviewed before you can add a venue.'],
];

export const socialLinks = [
  ['Instagram', 'https://instagram.com/celebrategc'], ['Facebook', 'https://facebook.com/celebrategc'],
  ['YouTube', 'https://youtube.com/@celebrategc'], ['LinkedIn', 'https://linkedin.com/company/celebrategc'], ['X', 'https://x.com/celebrategc'],
];
