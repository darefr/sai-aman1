import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Playfair_Display, Inter } from 'next/font/google'
import { SiteProviders } from '@/components/site-providers'
import { HotelStructuredData } from '@/components/structured-data'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://hotelsaiaman.com'),
  title: {
    default: 'Hotel Sai Aman, Butwal | Comfort at the Heart of Butwal',
    template: '%s | Hotel Sai Aman',
  },
  description:
    'Hotel Sai Aman is a premium hotel near New Bus Park, Butwal — close to Gautam Buddha International Airport and Lumbini / Maya Devi Temple. Comfortable rooms for travelers and pilgrims.',
  keywords: [
    'Hotel Sai Aman',
    'Hotel Sai Aman Butwal',
    'Hotels near Lumbini',
    'Hotel near Gautam Buddha Airport',
    'Butwal hotel',
    'New Bus Park Butwal hotel',
    'hotel near Maya Devi Temple',
    'luxury hotel Butwal',
  ],
  authors: [{ name: 'Hotel Sai Aman' }],
  alternates: {
    canonical: '/',
    languages: {
      en: '/',
      ne: '/?lang=ne',
      hi: '/?lang=hi',
      zh: '/?lang=zh',
    },
  },
  openGraph: {
    title: 'Hotel Sai Aman, Butwal | Comfort at the Heart of Butwal',
    description:
      'Premium hotel near New Bus Park, Butwal — close to Gautam Buddha International Airport and Lumbini. Ideal for travelers and pilgrims.',
    url: 'https://hotelsaiaman.com',
    siteName: 'Hotel Sai Aman',
    images: [{ url: '/images/hero-hotel.png', width: 1200, height: 630, alt: 'Hotel Sai Aman, Butwal' }],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hotel Sai Aman, Butwal',
    description: 'Comfort at the Heart of Butwal — near Lumbini and Gautam Buddha Airport.',
    images: ['/images/hero-hotel.png'],
  },
  generator: 'v0.app',
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f5efe3' },
    { media: '(prefers-color-scheme: dark)', color: '#221f1c' },
  ],
}

// Applies the persisted (or system) theme before paint to avoid a flash.
const themeScript = `
(function() {
  try {
    var stored = localStorage.getItem('theme');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var theme = stored || (prefersDark ? 'dark' : 'light');
    if (theme === 'dark') document.documentElement.classList.add('dark');
    var locale = localStorage.getItem('locale');
    if (locale) document.documentElement.lang = locale;
  } catch (e) {}
})();
`

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable} bg-background`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <HotelStructuredData />
      </head>
      <body className="theme-transition font-sans antialiased">
        <SiteProviders>{children}</SiteProviders>
        <Toaster />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
