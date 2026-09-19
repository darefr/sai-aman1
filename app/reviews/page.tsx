import type { Metadata } from 'next'
import { SiteShell } from '@/components/site-shell'
import { Reviews } from '@/components/reviews'
import { Contact } from '@/components/contact'

export const metadata: Metadata = {
  title: 'Guest Reviews',
  description:
    'Read what travelers and pilgrims say about Hotel Sai Aman, Butwal — genuine guest reviews and ratings.',
  alternates: { canonical: '/reviews' },
}

export default function ReviewsPage() {
  return (
    <SiteShell>
      <Reviews />
      <Contact />
    </SiteShell>
  )
}
