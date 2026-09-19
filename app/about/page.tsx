import type { Metadata } from 'next'
import { SiteShell } from '@/components/site-shell'
import { About } from '@/components/about'
import { Story } from '@/components/story'
import { Stats } from '@/components/stats'
import { Amenities } from '@/components/amenities'
import { Contact } from '@/components/contact'

export const metadata: Metadata = {
  title: 'About',
  description:
    'Discover the story of Hotel Sai Aman — warm hospitality in the gateway to Lumbini, near New Bus Park and Gautam Buddha International Airport, Butwal.',
  alternates: { canonical: '/about' },
}

export default function AboutPage() {
  return (
    <SiteShell>
      <About />
      <Story />
      <Stats />
      <Amenities />
      <Contact />
    </SiteShell>
  )
}
