/**
 * ============================================================================
 * INTERNATIONALIZATION (i18n)
 * ============================================================================
 *
 * Structured, key-based dictionaries so content can be translated without
 * touching components. English is fully populated; Nepali, Hindi and Chinese
 * are stubbed and fall back to English until localized copy is supplied.
 *
 * TODO(i18n): Populate `ne`, `hi`, and `zh` dictionaries with real
 *   translations (or load them from your CMS keyed by the same string keys).
 *   The resolver `t()` already falls back to English for any missing key, so
 *   partial translations are safe to ship incrementally.
 * ============================================================================
 */

export const locales = ['en', 'ne', 'hi', 'zh'] as const
export type Locale = (typeof locales)[number]

export const localeNames: Record<Locale, string> = {
  en: 'English',
  ne: 'नेपाली',
  hi: 'हिन्दी',
  zh: '中文',
}

export const defaultLocale: Locale = 'en'

type Dict = Record<string, string>

const en: Dict = {
  'nav.about': 'About',
  'nav.rooms': 'Rooms',
  'nav.amenities': 'Amenities',
  'nav.dining': 'Dining',
  'nav.gallery': 'Gallery',
  'nav.offers': 'Offers',
  'nav.experiences': 'Experiences',
  'nav.reviews': 'Reviews',
  'nav.location': 'Location',
  'nav.contact': 'Contact',
  'nav.book': 'Book Now',
  'nav.location.sub': 'Butwal · Nepal',

  'hero.badge': 'New Bus Park · Butwal · Lumbini Province',
  'hero.tagline': 'Comfort at the Heart of Butwal',
  'hero.cta.primary': 'Check Availability',
  'hero.cta.secondary': 'Explore Rooms',
  'hero.scroll': 'Scroll to explore',

  'about.eyebrow': 'Our Story',
  'about.title': 'A warm welcome in the gateway to Lumbini',
  'about.body':
    'Set beside New Bus Park in the heart of Butwal, Hotel Sai Aman blends contemporary comfort with genuine Nepali hospitality. Just a short drive from Gautam Buddha International Airport and the sacred grounds of Lumbini, we are the ideal base for travelers, families and pilgrims alike.',
  'about.stat.rooms': 'Thoughtful Rooms',
  'about.stat.airport': 'To the Airport',
  'about.stat.lumbini': 'To Lumbini',
  'about.stat.reception': 'Reception',

  'rooms.eyebrow': 'Stay With Us',
  'rooms.title': 'Rooms designed for restful nights',
  'rooms.subtitle': 'Every room is thoughtfully appointed with the essentials for a comfortable stay.',
  'rooms.perNight': 'per night',
  'rooms.available': 'rooms available',
  'rooms.reserve': 'Reserve this room',
  'rooms.tour': 'Virtual Tour',
  'rooms.tourSoon': '360° tour coming soon',
  'rooms.viewGallery': 'View gallery',
  'rooms.guests': 'guests',
  'rooms.double.name': 'Double Room',
  'rooms.twin.name': 'Twin Room',
  'rooms.triple.name': 'Triple Room',

  'amenities.eyebrow': 'Facilities',
  'amenities.title': 'Everything you need for an easy stay',
  'amenities.wifi': 'Free WiFi',
  'amenities.parking': 'Free Parking',
  'amenities.restaurant': 'Restaurant',
  'amenities.family': 'Family Rooms',
  'amenities.terrace': 'Terrace',
  'amenities.nonSmoking': 'Non-Smoking Property',
  'amenities.housekeeping': 'Daily Housekeeping',
  'amenities.reception': '24-Hour Reception',
  'amenities.laundry': 'Laundry Service',
  'amenities.airport': 'Airport Pickup',

  'dining.eyebrow': 'Dining',
  'dining.title': 'Flavours from Nepal and beyond',
  'dining.subtitle': 'From hearty local breakfasts to sunset coffee on the terrace.',
  'dining.hours': 'Open',
  'dining.menuSoon': 'Full menu coming soon',

  'reviews.eyebrow': 'Guest Reviews',
  'reviews.title': 'Loved by travelers and pilgrims',
  'reviews.based': 'based on',
  'reviews.reviews': 'reviews',
  'reviews.prev': 'Previous review',
  'reviews.next': 'Next review',

  'location.eyebrow': 'Find Us',
  'location.title': 'Perfectly placed in Butwal',
  'location.subtitle': 'Moments from the bus park, minutes from the highway, and within easy reach of Lumbini.',
  'location.directions': 'Get Directions',
  'location.away': 'away',
  'location.drive': 'min drive',
  'location.busPark': 'New Bus Park, Butwal',
  'location.airport': 'Gautam Buddha International Airport',
  'location.mayadevi': 'Maya Devi Temple, Lumbini',
  'location.lumbini': 'Lumbini Sacred Garden',

  'contact.eyebrow': 'Book Your Stay',
  'contact.title': 'Reserve your room at Hotel Sai Aman',
  'contact.body':
    'Send us your dates and our team will confirm availability and get you booked in for a comfortable stay in the heart of Butwal.',
  'contact.form.name': 'Full name',
  'contact.form.phone': 'Phone',
  'contact.form.email': 'Email',
  'contact.form.checkin': 'Check-in',
  'contact.form.checkout': 'Check-out',
  'contact.form.guests': 'Guests',
  'contact.form.room': 'Room type',
  'contact.form.message': 'Message',
  'contact.form.optional': '(optional)',
  'contact.form.placeholder': 'Any special requests?',
  'contact.form.submit': 'Request Booking',
  'contact.success.title': 'Thank you!',
  'contact.success.body':
    'Your booking request has been received. Our team will be in touch shortly to confirm your stay.',
  'contact.detail.phone': 'Phone',
  'contact.detail.email': 'Email',
  'contact.detail.address': 'Address',

  'footer.tagline': 'Comfort at the Heart of Butwal',
  'footer.rights': 'All rights reserved.',
  'footer.explore': 'Explore',
  'footer.contact': 'Contact',
  'footer.follow': 'Follow',
  'footer.awards': 'Recognition',
  'footer.sister.name': 'Sai Aman Residency, Bhairahawa',
  'footer.sister.tagline': 'Our sister property near the airport',
  'footer.sisterLabel': 'Sister Property',
  'footer.backToTop': 'Back to top',

  'story.eyebrow': 'Our Story',
  'story.title': 'Rooted in Nepali hospitality',
  'story.founder.role': 'Founders & Hosts',
  'story.timelineTitle': 'Our journey',
  'story.t1.title': 'A vision for Butwal',
  'story.t1.body': 'The family reimagines a warm, modern stay beside the busy New Bus Park transit hub.',
  'story.t2.title': 'Doors open',
  'story.t2.body': 'Hotel Sai Aman welcomes its first guests with comfortable rooms and home-style dining.',
  'story.t3.title': 'Rooftop terrace',
  'story.t3.body': 'We add a rooftop terrace lounge with sunset views over the city and distant hills.',
  'story.t4.title': 'A gateway to Lumbini',
  'story.t4.body': 'With the international airport nearby, we become a trusted base for pilgrims worldwide.',

  'stats.years': 'Years of Hospitality',
  'stats.rooms': 'Thoughtful Rooms',
  'stats.guests': 'Happy Guests Served',
  'stats.rating': 'Guest Rating',

  'gallery.eyebrow': 'Gallery',
  'gallery.title': 'A glimpse of Hotel Sai Aman',
  'gallery.subtitle': 'Explore our rooms, dining, terrace and more.',
  'gallery.filter.all': 'All',
  'gallery.filter.rooms': 'Rooms',
  'gallery.filter.dining': 'Dining',
  'gallery.filter.exterior': 'Exterior',
  'gallery.filter.events': 'Events',
  'gallery.close': 'Close gallery',
  'gallery.prev': 'Previous image',
  'gallery.next': 'Next image',

  'offers.eyebrow': 'Special Offers',
  'offers.title': 'Seasonal packages & deals',
  'offers.subtitle': 'Limited-time rates for a memorable stay in Butwal.',
  'offers.from': 'from',
  'offers.book': 'Book this offer',
  'offers.ends': 'Ends in',
  'offers.expired': 'Offer ended',
  'offers.limited': 'Limited Offer',
  'offers.seasonal': 'Seasonal',
  'offers.corporate': 'Corporate',
  'offers.days': 'd',
  'offers.hours': 'h',
  'offers.mins': 'm',
  'offers.secs': 's',
  'offers.o1.title': 'Pilgrim’s Retreat Package',
  'offers.o1.desc': 'Two nights, daily breakfast and a private car transfer to Lumbini.',
  'offers.o2.title': 'Monsoon Getaway',
  'offers.o2.desc': 'Stay 3 nights, pay for 2 — with complimentary terrace high tea.',
  'offers.o3.title': 'Business Traveller Rate',
  'offers.o3.desc': 'Flexible check-in, fast WiFi, workspace and free airport pickup.',

  'exp.eyebrow': 'Experiences',
  'exp.title': 'Discover Lumbini & beyond',
  'exp.subtitle': 'Sacred sites, city life and easy connections — all within reach.',
  'exp.mayadevi.name': 'Maya Devi Temple',
  'exp.mayadevi.desc': 'The sacred birthplace of Lord Buddha, set within the tranquil Lumbini gardens.',
  'exp.lumbini.name': 'Lumbini Sacred Garden',
  'exp.lumbini.desc': 'Monasteries, stupas and the eternal peace flame across a UNESCO World Heritage site.',
  'exp.airport.name': 'Gautam Buddha Int’l Airport',
  'exp.airport.desc': 'Nepal’s second international gateway, connecting Butwal to the wider world.',
  'exp.butwal.name': 'Butwal City & Tinau River',
  'exp.butwal.desc': 'Riverside walks, bustling bazaars and the gateway to the western hills.',

  'blog.eyebrow': 'Journal',
  'blog.title': 'Stories & local guides',
  'blog.subtitle': 'Tips for exploring Butwal, Lumbini and the region.',
  'blog.read': 'min read',
  'blog.readMore': 'Read article',
  'blog.b1.title': 'A First-Timer’s Guide to Lumbini',
  'blog.b1.excerpt': 'How to plan a serene day trip to the birthplace of Buddha from Butwal.',
  'blog.b2.title': 'Exploring Butwal: Local Favourites',
  'blog.b2.excerpt': 'From riverside walks to the best street food our team loves in the city.',
  'blog.b3.title': 'Celebrating Festival Season With Us',
  'blog.b3.excerpt': 'Special menus, décor and warm hospitality throughout Nepal’s festival calendar.',

  'faq.eyebrow': 'Good to Know',
  'faq.title': 'Frequently asked questions',
  'faq.subtitle': 'Everything you need to know before you arrive.',
  'faq.f1.q': 'What are the check-in and check-out times?',
  'faq.f1.a': 'Check-in is from 1:00 PM and check-out is until 11:00 AM. Early check-in and late check-out can be arranged on request, subject to availability.',
  'faq.f2.q': 'Do you offer airport pickup?',
  'faq.f2.a': 'Yes. We can arrange a private transfer from Gautam Buddha International Airport (about 40 minutes away). Please share your flight details when booking.',
  'faq.f3.q': 'Is parking available?',
  'faq.f3.a': 'Free private parking is available on-site for all guests, including space for larger vehicles and tour coaches.',
  'faq.f4.q': 'How far is the hotel from Lumbini?',
  'faq.f4.a': 'Lumbini and the Maya Devi Temple are roughly 37 km away — about an hour by car. Our front desk can help arrange transport.',
  'faq.f5.q': 'Which payment methods do you accept?',
  'faq.f5.a': 'We accept major cards, cash, and popular Nepali digital wallets. Online prepayment via eSewa, Khalti and Stripe will be available soon.',

  'newsletter.eyebrow': 'Stay in Touch',
  'newsletter.title': 'Get seasonal offers & travel tips',
  'newsletter.subtitle': 'Join our list for exclusive rates and Lumbini travel inspiration. No spam, ever.',
  'newsletter.placeholder': 'Enter your email address',
  'newsletter.subscribe': 'Subscribe',
  'newsletter.success': 'You’re subscribed! Watch your inbox for our next update.',
  'newsletter.error': 'Please enter a valid email address.',

  'awards.eyebrow': 'Recognition',
  'awards.a1': 'Travellers’ Choice',
  'awards.a2': 'Cleanliness Excellence',
  'awards.a3': 'Warm Welcome Award',

  'contact.form.checkinError': 'Please choose a check-in date.',
  'contact.form.checkoutError': 'Check-out must be after check-in.',
  'contact.form.nameError': 'Please enter your name.',
  'contact.form.contactError': 'Please provide a phone or email.',
}

/**
 * Non-English dictionaries start empty and inherit English via the resolver.
 * TODO(i18n): fill these in (or hydrate from the CMS) to enable each language.
 */
const ne: Dict = {}
const hi: Dict = {}
const zh: Dict = {}

const dictionaries: Record<Locale, Dict> = { en, ne, hi, zh }

/**
 * Resolve a key for a locale, falling back to English, then to the key itself.
 */
export function translate(locale: Locale, key: string, fallback?: string): string {
  return dictionaries[locale]?.[key] ?? dictionaries.en[key] ?? fallback ?? key
}
