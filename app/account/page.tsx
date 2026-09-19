import Link from 'next/link'
import { CalendarCheck, CalendarClock, Receipt, ArrowRight, Plus } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookingStatusBadge, PaymentStatusBadge } from '@/components/status-badge'
import { requireUser } from '@/lib/session'
import { getUserBookings } from '@/lib/bookings'
import { getRooms } from '@/lib/data'
import { formatMoney } from '@/lib/pricing'

export const dynamic = 'force-dynamic'

export default async function AccountOverview() {
  const user = await requireUser()
  const [bookings, rooms] = await Promise.all([getUserBookings(user.id), getRooms()])
  const roomName = (id: string) => rooms.find((r) => r.id === id)?.name ?? 'Room'

  const today = new Date().toISOString().slice(0, 10)
  const upcoming = bookings.filter((b) => b.status !== 'cancelled' && b.checkOut >= today)
  const past = bookings.filter((b) => b.status === 'completed' || b.checkOut < today)

  const stats = [
    { label: 'Upcoming stays', value: upcoming.length, icon: CalendarClock },
    { label: 'Total bookings', value: bookings.length, icon: CalendarCheck },
    { label: 'Past stays', value: past.length, icon: Receipt },
  ]

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl font-semibold">Welcome, {user.name.split(' ')[0]}</h1>
          <p className="mt-1 text-muted-foreground">Manage your bookings and account details.</p>
        </div>
        <Link href="/booking">
          <Button>
            <Plus className="size-4" /> New booking
          </Button>
        </Link>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="flex size-11 items-center justify-center rounded-xl bg-accent">
                <s.icon className="size-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{s.value}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 flex items-center justify-between">
        <h2 className="font-serif text-xl font-semibold">Recent bookings</h2>
        <Link href="/account/bookings" className="flex items-center gap-1 text-sm text-primary hover:underline">
          View all <ArrowRight className="size-3.5" />
        </Link>
      </div>

      {bookings.length === 0 ? (
        <Card className="mt-4">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">You don&apos;t have any bookings yet.</p>
            <Link href="/booking">
              <Button className="mt-4">Book your first stay</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="mt-4 grid gap-3">
          {bookings.slice(0, 4).map((b) => (
            <Link key={b.id} href={`/account/bookings/${b.reference}`}>
              <Card className="transition-colors hover:border-primary">
                <CardContent className="flex flex-wrap items-center justify-between gap-3 pt-6">
                  <div>
                    <p className="font-medium">{roomName(b.roomId)}</p>
                    <p className="text-sm text-muted-foreground">
                      {b.checkIn} → {b.checkOut} · {b.reference}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex gap-2">
                      <BookingStatusBadge status={b.status} />
                      <PaymentStatusBadge status={b.paymentStatus} />
                    </div>
                    <p className="font-semibold text-primary">{formatMoney(Number(b.total), b.currency)}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
