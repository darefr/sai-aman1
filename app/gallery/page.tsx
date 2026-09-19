import type { Metadata } from 'next'
import { SiteShell } from '@/components/site-shell'
import { Gallery } from '@/components/gallery'
import { Contact } from '@/components/contact'

export const metadata: Metadata = {
  title: 'Gallery',
  description:
    'A glimpse of Hotel Sai Aman, Butwal — explore our rooms, dining, terrace and interiors through the photo gallery.',
  alternates: { canonical: '/gallery' },
}

export default function GalleryPage() {
  return (
    <SiteShell>
      <Gallery />
      <Contact />
    </SiteShell>
  )
}
