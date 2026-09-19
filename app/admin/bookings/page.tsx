import Link from 'next/link'
import { Search } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { BookingStatusBadge, PaymentStatusBadge } from '@/components/status-badge'
import { searchBookings } from '@/lib/admin-data'
import { getRooms } from '@/lib/data'
import { formatMoney } from '@/lib/pricing'
import type { BookingStatus, PaymentStatus } from '@/lib/db/schema'

export const dynamic = 'force-dynamic'

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; payment?: string }>
}) {
  const sp = await searchParams
  const [bookings, rooms] = await Promise.all([
    searchBookings({
      q: sp.q,
      status: (sp.status as BookingStatus) || 'all',
      paymentStatus: (sp.payment as PaymentStatus) || 'all',
    }),
    getRooms(),
  ])
  const roomName = (id: string) => rooms.find((r) => r.id === id)?.name ?? 'Room'

  return (
    <div>
      <h1 className="font-serif text-3xl font-semibold">Bookings</h1>
      <p className="mt-1 text-muted-foreground">Search, filter and manage all reservations.</p>

      <Card className="mt-6">
        <CardContent className="pt-6">
          <form method="get" className="grid gap-3 sm:grid-cols-[1fr_auto_auto_auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input name="q" defaultValue={sp.q ?? ''} placeholder="Reference, name or email" className="pl-9" />
            </div>
            <Select name="status" defaultValue={sp.status ?? 'all'}>
              <option value="all">All statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </Select>
            <Select name="payment" defaultValue={sp.payment ?? 'all'}>
              <option value="all">All payments</option>
              <option value="unpaid">Unpaid</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </Select>
            <Button type="submit">Filter</Button>
          </form>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardContent className="pt-6">
          {bookings.length === 0 ? (
            <p className="py-10 text-center text-muted-foreground">No bookings match your filters.</p>
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
                  {bookings.map((b) => (
                    <tr key={b.id} className="border-b border-border/60 last:border-0">
                      <td className="py-3 pr-4">
                        <Link href={`/admin/bookings/${b.id}`} className="font-medium text-primary hover:underline">
                          {b.reference}
                        </Link>
                      </td>
                      <td className="py-3 pr-4">
                        <p className="font-medium">{b.guestName}</p>
                        <p className="text-xs text-muted-foreground">{b.guestEmail}</p>
                      </td>
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
