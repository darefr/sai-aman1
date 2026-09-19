import Link from 'next/link'
import { CalendarDays, DollarSign, Clock, Users, ArrowRight, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BookingStatusBadge, PaymentStatusBadge } from '@/components/status-badge'
import { getDashboardStats, getRecentBookings } from '@/lib/admin-data'
import { getRooms } from '@/lib/data'
import { formatMoney } from '@/lib/pricing'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const [stats, recent, rooms] = await Promise.all([getDashboardStats(), getRecentBookings(8), getRooms()])
  const roomName = (id: string) => rooms.find((r) => r.id === id)?.name ?? 'Room'

  const cards = [
    { label: 'Total revenue', value: formatMoney(stats.totalRevenue), icon: DollarSign, hint: `${formatMoney(stats.monthlyRevenue)} this month` },
    { label: 'Total bookings', value: String(stats.totalBookings), icon: CalendarDays, hint: `${stats.monthlyBookings} this month` },
    { label: 'Pending bookings', value: String(stats.pendingBookings), icon: Clock, hint: 'Awaiting action' },
    { label: 'Customers', value: String(stats.customers), icon: Users, hint: `${stats.activeRooms} active rooms` },
  ]

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-semibold">Dashboard</h1>
          <p className="mt-1 text-muted-foreground">Overview of your hotel operations.</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{c.label}</p>
                <div className="flex size-9 items-center justify-center rounded-lg bg-accent">
                  <c.icon className="size-4 text-primary" />
                </div>
              </div>
              <p className="mt-3 font-serif text-2xl font-semibold">{c.value}</p>
              <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                <TrendingUp className="size-3" /> {c.hint}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-8">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Recent bookings</CardTitle>
          <Link href="/admin/bookings" className="flex items-center gap-1 text-sm text-primary hover:underline">
            View all <ArrowRight className="size-3.5" />
          </Link>
        </CardHeader>
        <CardContent>
          {recent.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">No bookings yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="pb-2 pr-4 font-semibold">Reference</th>
                    <th className="pb-2 pr-4 font-semibold">Guest</th>
                    <th className="pb-2 pr-4 font-semibold">Room</th>
                    <th className="pb-2 pr-4 font-semibold">Dates</th>
                    <th className="pb-2 pr-4 font-semibold">Status</th>
                    <th className="pb-2 text-right font-semibold">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((b) => (
                    <tr key={b.id} className="border-b border-border/60 last:border-0">
                      <td className="py-3 pr-4">
                        <Link href={`/admin/bookings/${b.id}`} className="font-medium text-primary hover:underline">
                          {b.reference}
                        </Link>
                      </td>
                      <td className="py-3 pr-4">{b.guestName}</td>
                      <td className="py-3 pr-4 text-muted-foreground">{roomName(b.roomId)}</td>
                      <td className="py-3 pr-4 text-muted-foreground">
                        {b.checkIn} → {b.checkOut}
                      </td>
                      <td className="py-3 pr-4">
                        <div className="flex gap-1.5">
                          <BookingStatusBadge status={b.status} />
                          <PaymentStatusBadge status={b.paymentStatus} />
                        </div>
                      </td>
                      <td className="py-3 text-right font-medium">{formatMoney(Number(b.total), b.currency)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
