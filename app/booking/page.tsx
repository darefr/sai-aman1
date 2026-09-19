import type { Metadata } from 'next'
import { SiteShell } from '@/components/site-shell'
import { BookingWizard } from '@/components/booking/booking-wizard'
import { isDatabaseConfigured } from '@/lib/env'
import { getCurrentUser } from '@/lib/session'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Book your stay',
  description: 'Check live availability and reserve your room at Hotel Sai Aman, Butwal.',
}

export default async function BookingPage({
  searchParams,
}: {
  searchParams: Promise<{ checkIn?: string; checkOut?: string }>
}) {
  const sp = await searchParams
  const user = await getCurrentUser()

  return (
    <SiteShell>
      <BookingWizard
        enabled={isDatabaseConfigured()}
        defaultCheckIn={sp.checkIn}
        defaultCheckOut={sp.checkOut}
        prefillUser={user ? { name: user.name, email: user.email } : null}
      />
    </SiteShell>
  )
}
