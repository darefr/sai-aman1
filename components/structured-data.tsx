import { hotel, rooms, formatMoney } from '@/lib/content'

/**
 * schema.org "Hotel" structured data (JSON-LD) for rich search results.
 * Rendered in <head>. Values are sourced from the CMS-ready content module.
 */
export function HotelStructuredData() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Hotel',
    name: hotel.name,
    description:
      'Premium hotel near New Bus Park, Butwal — close to Gautam Buddha International Airport and Lumbini / Maya Devi Temple.',
    url: 'https://hotelsaiaman.com',
    telephone: hotel.contact.phone,
    email: hotel.contact.email,
    image: 'https://hotelsaiaman.com/images/hero-hotel.png',
    priceRange: 'NPR 3,200 – 4,800',
    starRating: { '@type': 'Rating', ratingValue: '3' },
    address: {
      '@type': 'PostalAddress',
      streetAddress: hotel.contact.address,
      addressLocality: hotel.contact.city,
      addressRegion: hotel.contact.province,
      postalCode: hotel.contact.postalCode,
      addressCountry: 'NP',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: hotel.geo.lat,
      longitude: hotel.geo.lng,
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: hotel.ratingValue,
      bestRating: '10',
      ratingCount: hotel.reviewCount,
    },
    amenityFeature: [
      'Free WiFi',
      'Free Parking',
      'Restaurant',
      'Family Rooms',
      'Terrace',
      'Non-Smoking Rooms',
      'Daily Housekeeping',
      '24-Hour Reception',
    ].map((name) => ({ '@type': 'LocationFeatureSpecification', name, value: true })),
    makesOffer: rooms.map((room) => ({
      '@type': 'Offer',
      name: room.fallbackName,
      price: room.pricePerNight.amount,
      priceCurrency: room.pricePerNight.currency,
      description: `${room.fallbackName} — ${formatMoney(room.pricePerNight)} per night`,
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
