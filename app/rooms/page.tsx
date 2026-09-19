import type { Metadata } from 'next'
import { SiteShell } from '@/components/site-shell'
import { Rooms } from '@/components/rooms'
import { Amenities } from '@/components/amenities'
import { Contact } from '@/components/contact'

export const metadata: Metadata = {
  title: 'Rooms & Suites',
  description:
    'Browse rooms at Hotel Sai Aman, Butwal — comfortable, air-conditioned accommodations with private bathrooms, free WiFi and room service. Check availability and reserve.',
  alternates: { canonical: '/rooms' },
}

export default function RoomsPage() {
  return (
    <SiteShell>
      <Rooms />
      <Amenities />
      <Contact />
    </SiteShell>
  )
}
