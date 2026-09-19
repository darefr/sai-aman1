import type { Metadata } from 'next'
import { SiteShell } from '@/components/site-shell'
import { Location } from '@/components/location'
import { Contact } from '@/components/contact'

export const metadata: Metadata = {
  title: 'Location & Directions',
  description:
    'Find Hotel Sai Aman at New Bus Park, Butwal — minutes from the highway and within easy reach of Lumbini and Gautam Buddha International Airport.',
  alternates: { canonical: '/location' },
}

export default function LocationPage() {
  return (
    <SiteShell>
      <Location />
      <Contact />
    </SiteShell>
  )
}
