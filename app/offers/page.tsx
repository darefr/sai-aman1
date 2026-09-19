import type { Metadata } from 'next'
import { SiteShell } from '@/components/site-shell'
import { Offers } from '@/components/offers'
import { Contact } from '@/components/contact'

export const metadata: Metadata = {
  title: 'Special Offers',
  description:
    'Seasonal packages and limited-time deals at Hotel Sai Aman, Butwal. Book direct for the best rates on your stay near Lumbini.',
  alternates: { canonical: '/offers' },
}

export default function OffersPage() {
  return (
    <SiteShell>
      <Offers />
      <Contact />
    </SiteShell>
  )
}
