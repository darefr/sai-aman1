import Link from 'next/link'
import { ArrowRight, CalendarX } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookingStatusBadge, PaymentStatusBadge } from '@/components/status-badge'
import { requireUser } from '@/lib/session'
import { getUserBookings } from '@/lib/bookings'
import { getRooms } from '@/lib/data'
import { formatMoney } from '@/lib/pricing'
import type { BookingRow } from '@/lib/db/schema'

export const dynamic = 'force-dynamic'

export default async function BookingsPage() {
  const user = await requireUser()
  const [bookings, rooms] = await Promise.all([getUserBookings(user.id), getRooms()])
  const roomName = (id: string) => rooms.find((r) => r.id === id)?.name ?? 'Room'

  const today = new Date().toISOString().slice(0, 10)
  const upcoming = bookings.filter((b) => b.status !== 'cancelled' && b.status !== 'completed' && b.checkOut >= today)
  const previous = bookings.filter((b) => b.status === 'completed' || (b.status !== 'cancelled' && b.checkOut < today))
  const cancelled = bookings.filter((b) => b.status === 'cancelled')

  return (
    <div>
      <h1 className="font-serif text-3xl font-semibold">My bookings</h1>
      <p className="mt-1 text-muted-foreground">View and manage all your reservations.</p>

      {bookings.length === 0 ? (
        <Card className="mt-8">
          <CardContent className="py-16 text-center">
            <CalendarX className="mx-auto mb-3 size-8 text-muted-foreground" />
            <p className="text-muted-foreground">You have no bookings yet.</p>
            <Link href="/booking">
              <Button className="mt-4">Book a stay</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="mt-8 grid gap-8">
          <Section title="Upcoming" bookings={upcoming} roomName={roomName} empty="No upcoming stays." />
          <Section title="Previous" bookings={previous} roomName={roomName} empty="No previous stays." />
          {cancelled.length > 0 && (
            <Section title="Cancelled" bookings={cancelled} roomName={roomName} empty="" />
          )}
        </div>
      )}
    </div>
  )
}

function Section({
  title,
  bookings,
  roomName,
  empty,
}: {
  title: string
  bookings: BookingRow[]
  roomName: (id: string) => string
  empty: string
}) {
  return (
    <section>
      <h2 className="mb-3 font-serif text-xl font-semibold">{title}</h2>
      {bookings.length === 0 ? (
        empty ? <p className="text-sm text-muted-foreground">{empty}</p> : null
      ) : (
        <div className="grid gap-3">
          {bookings.map((b) => (
            <Link key={b.id} href={`/account/bookings/${b.reference}`}>
              <Card className="transition-colors hover:border-primary">
                <CardContent className="flex flex-wrap items-center justify-between gap-3 pt-6">
                  <div>
                    <p className="font-medium">{roomName(b.roomId)}</p>
                    <p className="text-sm text-muted-foreground">
                      {b.checkIn} → {b.checkOut} · {b.nights} night{b.nights > 1 ? 's' : ''} · {b.reference}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex gap-2">
                      <BookingStatusBadge status={b.status} />
                      <PaymentStatusBadge status={b.paymentStatus} />
                    </div>
                    <p className="font-semibold text-primary">{formatMoney(Number(b.total), b.currency)}</p>
                    <ArrowRight className="size-4 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}
