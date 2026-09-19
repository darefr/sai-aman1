import type { Metadata } from 'next'
import { SiteShell } from '@/components/site-shell'
import { Dining } from '@/components/dining'
import { Contact } from '@/components/contact'

export const metadata: Metadata = {
  title: 'Dining',
  description:
    'Flavours from Nepal and beyond at Hotel Sai Aman, Butwal — from hearty local breakfasts to sunset coffee on the terrace.',
  alternates: { canonical: '/dining' },
}

export default function DiningPage() {
  return (
    <SiteShell>
      <Dining />
      <Contact />
    </SiteShell>
  )
}
