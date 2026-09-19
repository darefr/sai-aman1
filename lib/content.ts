/**
 * ============================================================================
 * HOTEL SAI AMAN — CENTRAL CONTENT / CMS DATA LAYER
 * ============================================================================
 *
 * This module is the single source of truth for all editable business content:
 * hotel profile, rooms, pricing, availability, amenities, dining, reviews and
 * nearby landmarks.
 *
 * It is intentionally shaped as plain, serializable objects (JSON-compatible)
 * so a future Admin Dashboard / Headless CMS can manage everything WITHOUT
 * code changes.
 *
 * TODO(CMS): Replace the static exports below with a fetch from your CMS or DB.
 *   e.g. `export async function getHotelContent(): Promise<HotelContent> { ... }`
 *   Recommended options: Sanity, Contentful, Payload, or a Postgres table set
 *   exposed via an internal `/api/content` route. Keep the SAME type shapes so
 *   the UI layer needs no changes.
 *
 * TODO(AVAILABILITY): `availability` here is a static snapshot for display only.
 *   Real availability + live pricing should come from your PMS / channel
 *   manager (see lib/booking.ts) and override these values at request time.
 * ============================================================================
 */

export type Money = {
  /** ISO 4217 currency code, e.g. "NPR" or "USD". */
  currency: string
  /** Amount in major units (not cents), e.g. 3500 = NPR 3,500. */
  amount: number
}

export type RoomAmenity =
  | 'private-bathroom'
  | 'free-wifi'
  | 'desk'
  | 'carpeting'
  | 'air-conditioning'
  | 'flat-screen-tv'
  | 'room-service'

export type Room = {
  /** Stable id used as the CMS/PMS key. Never change once published. */
  id: string
  /** i18n key suffix; label resolved from dictionaries at render time. */
  nameKey: string
  fallbackName: string
  descriptionKey: string
  fallbackDescription: string
  beds: string
  /** Max occupancy — feeds the booking form guest validation. */
  maxGuests: number
  sizeSqm: number
  /** Nightly rate. TODO(PMS): override with live rate at request time. */
  pricePerNight: Money
  /** Static availability snapshot. TODO(PMS): replace with live inventory. */
  availableRooms: number
  amenities: RoomAmenity[]
  /** Ordered gallery; first image is the card cover. */
  gallery: { src: string; altKey: string; fallbackAlt: string }[]
  /** 360° virtual tour asset. TODO(MEDIA): wire a real Matterport/Pano URL. */
  virtualTourUrl: string | null
  featured?: boolean
}

export type Amenity = {
  id: string
  icon: string
  labelKey: string
  fallbackLabel: string
}

export type DiningVenue = {
  id: string
  nameKey: string
  fallbackName: string
  cuisineKey: string
  fallbackCuisine: string
  hours: string
  image: string
}

export type Review = {
  id: string
  author: string
  country: string
  rating: number
  quoteKey: string
  fallbackQuote: string
  stayType: string
}

export type Landmark = {
  id: string
  nameKey: string
  fallbackName: string
  distanceKm: number
  driveMinutes: number
}

export type HotelContent = {
  name: string
  legalName: string
  taglineKey: string
  fallbackTagline: string
  ratingValue: number
  ratingLabel: string
  reviewCount: number
  contact: {
    phone: string
    phoneHref: string
    email: string
    address: string
    city: string
    province: string
    country: string
    postalCode: string
  }
  geo: { lat: number; lng: number }
  /** Google Maps embed + external link (from the shared Maps listing). */
  mapEmbedUrl: string
  mapLink: string
  social: { label: string; href: string }[]
}

/* -------------------------------------------------------------------------- */
/* HOTEL PROFILE                                                              */
/* -------------------------------------------------------------------------- */

export const hotel: HotelContent = {
  name: 'Hotel Sai Aman',
  legalName: 'Hotel Sai Aman Pvt. Ltd.',
  taglineKey: 'hero.tagline',
  fallbackTagline: 'Comfort at the Heart of Butwal',
  ratingValue: 7.6,
  ratingLabel: 'Good',
  reviewCount: 214,
  contact: {
    phone: '+977 000 000 0000',
    phoneHref: 'tel:+9770000000000',
    email: 'stay@hotelsaiaman.com',
    address: 'New Bus Park',
    city: 'Butwal',
    province: 'Lumbini Province',
    country: 'Nepal',
    postalCode: '32907',
  },
  // Approximate coordinates for New Bus Park, Butwal.
  geo: { lat: 27.700769, lng: 83.448128 },
  mapEmbedUrl:
    'https://www.google.com/maps?q=New%20Bus%20Park%2C%20Butwal%2C%20Nepal&output=embed',
  mapLink: 'https://maps.app.goo.gl/fNPBqLWJWMEfNh2s8',
  social: [
    { label: 'Facebook', href: '#' },
    { label: 'Instagram', href: '#' },
    { label: 'WhatsApp', href: '#' },
  ],
}

/* -------------------------------------------------------------------------- */
/* ROOMS + PRICING + AVAILABILITY (CMS/PMS editable)                          */
/* -------------------------------------------------------------------------- */

export const rooms: Room[] = [
  {
    id: 'double',
    nameKey: 'rooms.double.name',
    fallbackName: 'Double Room',
    descriptionKey: 'rooms.double.desc',
    fallbackDescription:
      'A serene retreat with a plush queen bed, warm textiles and a dedicated work desk.',
    beds: '1 Queen bed',
    maxGuests: 2,
    sizeSqm: 22,
    pricePerNight: { currency: 'NPR', amount: 3200 },
    availableRooms: 6,
    amenities: ['private-bathroom', 'free-wifi', 'desk', 'carpeting', 'flat-screen-tv'],
    gallery: [
      { src: '/images/room-double.png', altKey: 'rooms.double.alt', fallbackAlt: 'Double room with queen bed' },
      { src: '/images/room-detail.png', altKey: 'rooms.detail.alt', fallbackAlt: 'Room bedside detail' },
      { src: '/images/room-bath.png', altKey: 'rooms.bath.alt', fallbackAlt: 'Private bathroom' },
    ],
    virtualTourUrl: null,
  },
  {
    id: 'twin',
    nameKey: 'rooms.twin.name',
    fallbackName: 'Twin Room',
    descriptionKey: 'rooms.twin.desc',
    fallbackDescription:
      'Two comfortable single beds, ideal for friends or colleagues travelling together.',
    beds: '2 Single beds',
    maxGuests: 2,
    sizeSqm: 24,
    pricePerNight: { currency: 'NPR', amount: 3500 },
    availableRooms: 4,
    amenities: ['private-bathroom', 'free-wifi', 'desk', 'carpeting', 'flat-screen-tv'],
    gallery: [
      { src: '/images/room-twin.png', altKey: 'rooms.twin.alt', fallbackAlt: 'Twin room with two single beds' },
      { src: '/images/room-detail.png', altKey: 'rooms.detail.alt', fallbackAlt: 'Room bedside detail' },
      { src: '/images/room-bath.png', altKey: 'rooms.bath.alt', fallbackAlt: 'Private bathroom' },
    ],
    virtualTourUrl: null,
  },
  {
    id: 'triple',
    nameKey: 'rooms.triple.name',
    fallbackName: 'Triple Room',
    descriptionKey: 'rooms.triple.desc',
    fallbackDescription:
      'Our most spacious room with a double and single bed, air conditioning and room service.',
    beds: '1 Double + 1 Single bed',
    maxGuests: 3,
    sizeSqm: 30,
    pricePerNight: { currency: 'NPR', amount: 4800 },
    availableRooms: 3,
    amenities: [
      'private-bathroom',
      'free-wifi',
      'desk',
      'carpeting',
      'air-conditioning',
      'flat-screen-tv',
      'room-service',
    ],
    gallery: [
      { src: '/images/room-triple.png', altKey: 'rooms.triple.alt', fallbackAlt: 'Triple room, air conditioned' },
      { src: '/images/room-detail.png', altKey: 'rooms.detail.alt', fallbackAlt: 'Room bedside detail' },
      { src: '/images/room-bath.png', altKey: 'rooms.bath.alt', fallbackAlt: 'Private bathroom' },
    ],
    virtualTourUrl: null,
    featured: true,
  },
]

/* -------------------------------------------------------------------------- */
/* AMENITIES                                                                  */
/* -------------------------------------------------------------------------- */

export const amenities: Amenity[] = [
  { id: 'wifi', icon: 'Wifi', labelKey: 'amenities.wifi', fallbackLabel: 'Free WiFi' },
  { id: 'parking', icon: 'CircleParking', labelKey: 'amenities.parking', fallbackLabel: 'Free Parking' },
  { id: 'restaurant', icon: 'UtensilsCrossed', labelKey: 'amenities.restaurant', fallbackLabel: 'Restaurant' },
  { id: 'family', icon: 'Users', labelKey: 'amenities.family', fallbackLabel: 'Family Rooms' },
  { id: 'terrace', icon: 'Sun', labelKey: 'amenities.terrace', fallbackLabel: 'Terrace' },
  { id: 'non-smoking', icon: 'CigaretteOff', labelKey: 'amenities.nonSmoking', fallbackLabel: 'Non-Smoking Property' },
  { id: 'housekeeping', icon: 'Sparkles', labelKey: 'amenities.housekeeping', fallbackLabel: 'Daily Housekeeping' },
  { id: 'reception', icon: 'Clock', labelKey: 'amenities.reception', fallbackLabel: '24-Hour Reception' },
  { id: 'laundry', icon: 'Shirt', labelKey: 'amenities.laundry', fallbackLabel: 'Laundry Service' },
  { id: 'airport', icon: 'Plane', labelKey: 'amenities.airport', fallbackLabel: 'Airport Pickup' },
]

/* -------------------------------------------------------------------------- */
/* DINING                                                                     */
/* -------------------------------------------------------------------------- */

export const dining: DiningVenue[] = [
  {
    id: 'restaurant',
    nameKey: 'dining.main.name',
    fallbackName: 'The Aman Kitchen',
    cuisineKey: 'dining.main.cuisine',
    fallbackCuisine: 'Nepali · Indian · Continental',
    hours: '7:00 AM – 10:30 PM',
    image: '/images/dining.png',
  },
  {
    id: 'terrace',
    nameKey: 'dining.terrace.name',
    fallbackName: 'Rooftop Terrace Lounge',
    cuisineKey: 'dining.terrace.cuisine',
    fallbackCuisine: 'Coffee · Snacks · Sunset views',
    hours: '4:00 PM – 11:00 PM',
    image: '/images/terrace.png',
  },
]

/* -------------------------------------------------------------------------- */
/* REVIEWS                                                                    */
/* -------------------------------------------------------------------------- */

export const reviews: Review[] = [
  {
    id: 'r1',
    author: 'Anish P.',
    country: 'Nepal',
    rating: 9,
    quoteKey: 'reviews.r1',
    fallbackQuote:
      'Spotless rooms and incredibly helpful staff. The location right by New Bus Park made travel effortless.',
    stayType: 'Business trip',
  },
  {
    id: 'r2',
    author: 'Priya S.',
    country: 'India',
    rating: 8,
    quoteKey: 'reviews.r2',
    fallbackQuote:
      'Stayed on our way to Lumbini. Comfortable beds, great value, and a lovely rooftop terrace.',
    stayType: 'Pilgrimage',
  },
  {
    id: 'r3',
    author: 'David M.',
    country: 'United Kingdom',
    rating: 7,
    quoteKey: 'reviews.r3',
    fallbackQuote:
      'A solid, clean and friendly hotel. Perfect base for exploring Butwal and the airport is close by.',
    stayType: 'Leisure',
  },
]

/* -------------------------------------------------------------------------- */
/* NEARBY LANDMARKS                                                           */
/* -------------------------------------------------------------------------- */

export const landmarks: Landmark[] = [
  { id: 'buspark', nameKey: 'location.busPark', fallbackName: 'New Bus Park, Butwal', distanceKm: 0.2, driveMinutes: 2 },
  { id: 'airport', nameKey: 'location.airport', fallbackName: 'Gautam Buddha International Airport', distanceKm: 24, driveMinutes: 40 },
  { id: 'mayadevi', nameKey: 'location.mayadevi', fallbackName: 'Maya Devi Temple, Lumbini', distanceKm: 37, driveMinutes: 60 },
  { id: 'lumbini', nameKey: 'location.lumbini', fallbackName: 'Lumbini Sacred Garden', distanceKm: 38, driveMinutes: 62 },
]

/* -------------------------------------------------------------------------- */
/* BRAND STORY — founder note + property timeline                             */
/* -------------------------------------------------------------------------- */

export type TimelineEntry = {
  id: string
  year: string
  titleKey: string
  fallbackTitle: string
  bodyKey: string
  fallbackBody: string
}

export const founderNote = {
  quoteKey: 'story.founder.quote',
  fallbackQuote:
    'We built Hotel Sai Aman so every traveller arriving in Butwal — whether for business or on the road to Lumbini — feels the warmth of Nepali hospitality from the moment they step inside.',
  name: 'The Sai Aman Family',
  roleKey: 'story.founder.role',
  fallbackRole: 'Founders & Hosts',
}

export const timeline: TimelineEntry[] = [
  {
    id: 't1',
    year: '2015',
    titleKey: 'story.t1.title',
    fallbackTitle: 'A vision for Butwal',
    bodyKey: 'story.t1.body',
    fallbackBody: 'The family reimagines a warm, modern stay beside the busy New Bus Park transit hub.',
  },
  {
    id: 't2',
    year: '2017',
    titleKey: 'story.t2.title',
    fallbackTitle: 'Doors open',
    bodyKey: 'story.t2.body',
    fallbackBody: 'Hotel Sai Aman welcomes its first guests with comfortable rooms and home-style dining.',
  },
  {
    id: 't3',
    year: '2020',
    titleKey: 'story.t3.title',
    fallbackTitle: 'Rooftop terrace',
    bodyKey: 'story.t3.body',
    fallbackBody: 'We add a rooftop terrace lounge with sunset views over the city and distant hills.',
  },
  {
    id: 't4',
    year: '2024',
    titleKey: 'story.t4.title',
    fallbackTitle: 'A gateway to Lumbini',
    bodyKey: 'story.t4.body',
    fallbackBody: 'With the international airport nearby, we become a trusted base for pilgrims worldwide.',
  },
]

/* -------------------------------------------------------------------------- */
/* STATS — animated counters                                                  */
/* -------------------------------------------------------------------------- */

export type Stat = {
  id: string
  value: number
  suffix: string
  labelKey: string
  fallbackLabel: string
}

export const stats: Stat[] = [
  { id: 's1', value: 9, suffix: '+', labelKey: 'stats.years', fallbackLabel: 'Years of Hospitality' },
  { id: 's2', value: 13, suffix: '', labelKey: 'stats.rooms', fallbackLabel: 'Thoughtful Rooms' },
  { id: 's3', value: 25, suffix: 'K+', labelKey: 'stats.guests', fallbackLabel: 'Happy Guests Served' },
  { id: 's4', value: 7.6, suffix: '', labelKey: 'stats.rating', fallbackLabel: 'Guest Rating' },
]

/* -------------------------------------------------------------------------- */
/* GALLERY — masonry + category filters + lightbox                            */
/* -------------------------------------------------------------------------- */

export type GalleryCategory = 'rooms' | 'dining' | 'exterior' | 'events'

export type GalleryImage = {
  id: string
  src: string
  category: GalleryCategory
  captionKey: string
  fallbackCaption: string
  /** Rough aspect ratio to drive the masonry layout. */
  aspect: 'portrait' | 'landscape' | 'square'
}

export const galleryCategories: { id: GalleryCategory | 'all'; labelKey: string; fallbackLabel: string }[] = [
  { id: 'all', labelKey: 'gallery.filter.all', fallbackLabel: 'All' },
  { id: 'rooms', labelKey: 'gallery.filter.rooms', fallbackLabel: 'Rooms' },
  { id: 'dining', labelKey: 'gallery.filter.dining', fallbackLabel: 'Dining' },
  { id: 'exterior', labelKey: 'gallery.filter.exterior', fallbackLabel: 'Exterior' },
  { id: 'events', labelKey: 'gallery.filter.events', fallbackLabel: 'Events' },
]

export const gallery: GalleryImage[] = [
  { id: 'g1', src: '/images/hero-hotel.png', category: 'exterior', captionKey: 'gallery.g1', fallbackCaption: 'Hotel Sai Aman at golden hour', aspect: 'landscape' },
  { id: 'g2', src: '/images/room-double.png', category: 'rooms', captionKey: 'gallery.g2', fallbackCaption: 'Double room', aspect: 'landscape' },
  { id: 'g3', src: '/images/dining.png', category: 'dining', captionKey: 'gallery.g3', fallbackCaption: 'The Aman Kitchen', aspect: 'portrait' },
  { id: 'g4', src: '/images/event-hall.png', category: 'events', captionKey: 'gallery.g4', fallbackCaption: 'Banquet & event hall', aspect: 'landscape' },
  { id: 'g5', src: '/images/room-triple.png', category: 'rooms', captionKey: 'gallery.g5', fallbackCaption: 'Triple room', aspect: 'portrait' },
  { id: 'g6', src: '/images/terrace.png', category: 'exterior', captionKey: 'gallery.g6', fallbackCaption: 'Rooftop terrace lounge', aspect: 'landscape' },
  { id: 'g7', src: '/images/dish.png', category: 'dining', captionKey: 'gallery.g7', fallbackCaption: 'Signature plated dish', aspect: 'square' },
  { id: 'g8', src: '/images/exterior-night.png', category: 'exterior', captionKey: 'gallery.g8', fallbackCaption: 'Evening arrival', aspect: 'landscape' },
  { id: 'g9', src: '/images/room-twin.png', category: 'rooms', captionKey: 'gallery.g9', fallbackCaption: 'Twin room', aspect: 'landscape' },
  { id: 'g10', src: '/images/room-bath.png', category: 'rooms', captionKey: 'gallery.g10', fallbackCaption: 'Private bathroom', aspect: 'portrait' },
  { id: 'g11', src: '/images/about-lobby.png', category: 'exterior', captionKey: 'gallery.g11', fallbackCaption: 'Welcoming lobby', aspect: 'landscape' },
  { id: 'g12', src: '/images/room-detail.png', category: 'rooms', captionKey: 'gallery.g12', fallbackCaption: 'Thoughtful details', aspect: 'square' },
]

/* -------------------------------------------------------------------------- */
/* OFFERS / PACKAGES — with countdown deadline                                */
/* -------------------------------------------------------------------------- */

export type Offer = {
  id: string
  titleKey: string
  fallbackTitle: string
  descriptionKey: string
  fallbackDescription: string
  discountLabel: string
  price: Money
  wasPrice?: Money
  image: string
  /** ISO date the offer expires — drives the live countdown timer. */
  expiresAt: string
  badgeKey: string
  fallbackBadge: string
}

/**
 * TODO(CMS): manage seasonal offers from the admin dashboard. `expiresAt`
 * powers a live countdown; expired offers should be filtered server-side.
 */
export const offers: Offer[] = [
  {
    id: 'o1',
    titleKey: 'offers.o1.title',
    fallbackTitle: 'Pilgrim’s Retreat Package',
    descriptionKey: 'offers.o1.desc',
    fallbackDescription: 'Two nights, daily breakfast and a private car transfer to Lumbini.',
    discountLabel: '-20%',
    price: { currency: 'NPR', amount: 8600 },
    wasPrice: { currency: 'NPR', amount: 10800 },
    image: '/images/blog-lumbini.png',
    expiresAt: futureIso(9),
    badgeKey: 'offers.limited',
    fallbackBadge: 'Limited Offer',
  },
  {
    id: 'o2',
    titleKey: 'offers.o2.title',
    fallbackTitle: 'Monsoon Getaway',
    descriptionKey: 'offers.o2.desc',
    fallbackDescription: 'Stay 3 nights, pay for 2 — with complimentary terrace high tea.',
    discountLabel: '3=2',
    price: { currency: 'NPR', amount: 6400 },
    wasPrice: { currency: 'NPR', amount: 9600 },
    image: '/images/terrace.png',
    expiresAt: futureIso(16),
    badgeKey: 'offers.seasonal',
    fallbackBadge: 'Seasonal',
  },
  {
    id: 'o3',
    titleKey: 'offers.o3.title',
    fallbackTitle: 'Business Traveller Rate',
    descriptionKey: 'offers.o3.desc',
    fallbackDescription: 'Flexible check-in, fast WiFi, workspace and free airport pickup.',
    discountLabel: '-15%',
    price: { currency: 'NPR', amount: 2720 },
    wasPrice: { currency: 'NPR', amount: 3200 },
    image: '/images/room-double.png',
    expiresAt: futureIso(23),
    badgeKey: 'offers.corporate',
    fallbackBadge: 'Corporate',
  },
]

/* -------------------------------------------------------------------------- */
/* EXPERIENCES — nearby attractions with imagery                              */
/* -------------------------------------------------------------------------- */

export type Experience = {
  id: string
  nameKey: string
  fallbackName: string
  descriptionKey: string
  fallbackDescription: string
  distanceKm: number
  driveMinutes: number
  image: string
}

export const experiences: Experience[] = [
  {
    id: 'e1',
    nameKey: 'exp.mayadevi.name',
    fallbackName: 'Maya Devi Temple',
    descriptionKey: 'exp.mayadevi.desc',
    fallbackDescription: 'The sacred birthplace of Lord Buddha, set within the tranquil Lumbini gardens.',
    distanceKm: 37,
    driveMinutes: 60,
    image: '/images/location-lumbini.png',
  },
  {
    id: 'e2',
    nameKey: 'exp.lumbini.name',
    fallbackName: 'Lumbini Sacred Garden',
    descriptionKey: 'exp.lumbini.desc',
    fallbackDescription: 'Monasteries, stupas and the eternal peace flame across a UNESCO World Heritage site.',
    distanceKm: 38,
    driveMinutes: 62,
    image: '/images/blog-lumbini.png',
  },
  {
    id: 'e3',
    nameKey: 'exp.airport.name',
    fallbackName: 'Gautam Buddha Int’l Airport',
    descriptionKey: 'exp.airport.desc',
    fallbackDescription: 'Nepal’s second international gateway, connecting Butwal to the wider world.',
    distanceKm: 24,
    driveMinutes: 40,
    image: '/images/exterior-night.png',
  },
  {
    id: 'e4',
    nameKey: 'exp.butwal.name',
    fallbackName: 'Butwal City & Tinau River',
    descriptionKey: 'exp.butwal.desc',
    fallbackDescription: 'Riverside walks, bustling bazaars and the gateway to the western hills.',
    distanceKm: 2,
    driveMinutes: 8,
    image: '/images/blog-butwal.png',
  },
]

/* -------------------------------------------------------------------------- */
/* BLOG / NEWS                                                                 */
/* -------------------------------------------------------------------------- */

export type BlogPost = {
  id: string
  slug: string
  titleKey: string
  fallbackTitle: string
  excerptKey: string
  fallbackExcerpt: string
  category: string
  date: string
  readMinutes: number
  image: string
}

/**
 * TODO(CMS): source posts from a CMS collection and add dynamic
 * `/blog/[slug]` routes. Cards currently link to placeholder anchors.
 */
export const blogPosts: BlogPost[] = [
  {
    id: 'b1',
    slug: 'guide-to-lumbini',
    titleKey: 'blog.b1.title',
    fallbackTitle: 'A First-Timer’s Guide to Lumbini',
    excerptKey: 'blog.b1.excerpt',
    fallbackExcerpt: 'How to plan a serene day trip to the birthplace of Buddha from Butwal.',
    category: 'Travel Guide',
    date: '2026-08-12',
    readMinutes: 6,
    image: '/images/blog-lumbini.png',
  },
  {
    id: 'b2',
    slug: 'exploring-butwal',
    titleKey: 'blog.b2.title',
    fallbackTitle: 'Exploring Butwal: Local Favourites',
    excerptKey: 'blog.b2.excerpt',
    fallbackExcerpt: 'From riverside walks to the best street food our team loves in the city.',
    category: 'Local',
    date: '2026-07-28',
    readMinutes: 5,
    image: '/images/blog-butwal.png',
  },
  {
    id: 'b3',
    slug: 'festival-season',
    titleKey: 'blog.b3.title',
    fallbackTitle: 'Celebrating Festival Season With Us',
    excerptKey: 'blog.b3.excerpt',
    fallbackExcerpt: 'Special menus, décor and warm hospitality throughout Nepal’s festival calendar.',
    category: 'Hotel News',
    date: '2026-07-05',
    readMinutes: 4,
    image: '/images/blog-festival.png',
  },
]

/* -------------------------------------------------------------------------- */
/* FAQ                                                                         */
/* -------------------------------------------------------------------------- */

export type Faq = {
  id: string
  questionKey: string
  fallbackQuestion: string
  answerKey: string
  fallbackAnswer: string
}

export const faqs: Faq[] = [
  {
    id: 'f1',
    questionKey: 'faq.f1.q',
    fallbackQuestion: 'What are the check-in and check-out times?',
    answerKey: 'faq.f1.a',
    fallbackAnswer: 'Check-in is from 1:00 PM and check-out is until 11:00 AM. Early check-in and late check-out can be arranged on request, subject to availability.',
  },
  {
    id: 'f2',
    questionKey: 'faq.f2.q',
    fallbackQuestion: 'Do you offer airport pickup?',
    answerKey: 'faq.f2.a',
    fallbackAnswer: 'Yes. We can arrange a private transfer from Gautam Buddha International Airport (about 40 minutes away). Please share your flight details when booking.',
  },
  {
    id: 'f3',
    questionKey: 'faq.f3.q',
    fallbackQuestion: 'Is parking available?',
    answerKey: 'faq.f3.a',
    fallbackAnswer: 'Free private parking is available on-site for all guests, including space for larger vehicles and tour coaches.',
  },
  {
    id: 'f4',
    questionKey: 'faq.f4.q',
    fallbackQuestion: 'How far is the hotel from Lumbini?',
    answerKey: 'faq.f4.a',
    fallbackAnswer: 'Lumbini and the Maya Devi Temple are roughly 37 km away — about an hour by car. Our front desk can help arrange transport.',
  },
  {
    id: 'f5',
    questionKey: 'faq.f5.q',
    fallbackQuestion: 'Which payment methods do you accept?',
    answerKey: 'faq.f5.a',
    fallbackAnswer: 'We accept major cards, cash, and popular Nepali digital wallets. Online prepayment via eSewa, Khalti and Stripe will be available soon.',
  },
]

/* -------------------------------------------------------------------------- */
/* AWARDS + SISTER PROPERTY (footer)                                          */
/* -------------------------------------------------------------------------- */

export const awards: { id: string; labelKey: string; fallbackLabel: string; year: string }[] = [
  { id: 'a1', labelKey: 'awards.a1', fallbackLabel: 'Travellers’ Choice', year: '2025' },
  { id: 'a2', labelKey: 'awards.a2', fallbackLabel: 'Cleanliness Excellence', year: '2024' },
  { id: 'a3', labelKey: 'awards.a3', fallbackLabel: 'Warm Welcome Award', year: '2023' },
]

export const sisterProperty = {
  nameKey: 'footer.sister.name',
  fallbackName: 'Sai Aman Residency, Bhairahawa',
  href: '#',
  taglineKey: 'footer.sister.tagline',
  fallbackTagline: 'Our sister property near the airport',
}

/* -------------------------------------------------------------------------- */
/* HELPERS                                                                     */
/* -------------------------------------------------------------------------- */

/** Convenience helper for price formatting across the UI. */
export function formatMoney({ currency, amount }: Money) {
  return `${currency} ${amount.toLocaleString('en-US')}`
}

/** Returns an ISO timestamp `days` in the future (used for offer countdowns). */
function futureIso(days: number) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  d.setHours(23, 59, 59, 0)
  return d.toISOString()
}
