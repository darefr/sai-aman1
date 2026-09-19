import type { Metadata } from 'next'
import { SiteShell } from '@/components/site-shell'
import { Experiences } from '@/components/experiences'
import { Contact } from '@/components/contact'

export const metadata: Metadata = {
  title: 'Experiences',
  description:
    'Discover Lumbini and beyond from Hotel Sai Aman, Butwal — sacred sites, city life and easy connections, all within reach.',
  alternates: { canonical: '/experiences' },
}

export default function ExperiencesPage() {
  return (
    <SiteShell>
      <Experiences />
      <Contact />
    </SiteShell>
  )
}
