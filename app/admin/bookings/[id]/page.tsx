import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Download } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { BookingControls } from '@/components/admin/booking-controls'
import { getBookingById } from '@/lib/bookings'
import { getRoomById } from '@/lib/data'
import { formatMoney } from '@/lib/pricing'

export const dynamic = 'force-dynamic'

export default async function AdminBookingDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const booking = await getBookingById(id)
  if (!booking) notFound()
  const room = await getRoomById(booking.roomId)

  return (
    <div>
      <Link href="/admin/bookings" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Back to bookings
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl font-semibold">{booking.reference}</h1>
          <p className="mt-1 text-muted-foreground">
            Created {new Date(booking.createdAt).toLocaleString()}
          </p>
        </div>
        <Link href={`/invoice/${booking.reference}`}>
          <Button variant="outline">
            <Download className="size-4" /> Invoice
          </Button>
        </Link>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Guest &amp; stay</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2.5 text-sm">
              <Row label="Guest" value={booking.guestName} />
              <Row label="Email" value={booking.guestEmail} />
              <Row label="Phone" value={booking.guestPhone} />
              <Separator className="my-1" />
              <Row label="Room" value={room?.name ?? booking.roomId} />
              <Row label="Check-in" value={booking.checkIn} />
              <Row label="Check-out" value={booking.checkOut} />
              <Row label="Nights" value={String(booking.nights)} />
              <Row label="Guests" value={`${booking.adults} adults, ${booking.children} children`} />
              <Row label="Units" value={String(booking.unitsBooked)} />
              {booking.specialRequests && <Row label="Requests" value={booking.specialRequests} />}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2.5 text-sm">
              <Row label="Subtotal" value={formatMoney(Number(booking.subtotal), booking.currency)} />
              {Number(booking.discountAmount) > 0 && (
                <Row
                  label={`Discount ${booking.couponCode ? `(${booking.couponCode})` : ''}`}
                  value={`− ${formatMoney(Number(booking.discountAmount), booking.currency)}`}
                />
              )}
              <Row label="Taxes & service" value={formatMoney(Number(booking.taxAmount), booking.currency)} />
              <Separator className="my-1" />
              <div className="flex items-center justify-between">
                <span className="font-semibold">Total</span>
                <span className="font-serif text-lg font-semibold text-primary">
                  {formatMoney(Number(booking.total), booking.currency)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:sticky lg:top-6 lg:self-start">
          <Card>
            <CardHeader>
              <CardTitle>Manage</CardTitle>
            </CardHeader>
            <CardContent>
              <BookingControls bookingId={booking.id} status={booking.status} paymentStatus={booking.paymentStatus} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  )
}
