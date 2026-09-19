import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Download, CreditCard, MapPin, Phone, Mail } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { BookingStatusBadge, PaymentStatusBadge } from '@/components/status-badge'
import { CancelBookingButton } from '@/components/account/cancel-booking-button'
import { requireUser } from '@/lib/session'
import { getBookingForUser, canCancel } from '@/lib/bookings'
import { getRoomById, getBookingSettings } from '@/lib/data'
import { formatMoney } from '@/lib/pricing'

export const dynamic = 'force-dynamic'

export default async function BookingDetailPage({ params }: { params: Promise<{ reference: string }> }) {
  const user = await requireUser()
  const { reference } = await params
  const booking = await getBookingForUser(reference, user.id)
  if (!booking) notFound()

  const [room, bookingSettings] = await Promise.all([getRoomById(booking.roomId), getBookingSettings()])
  const cancellable = canCancel(booking, bookingSettings.cancellationHours)

  return (
    <div>
      <Link href="/account/bookings" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Back to bookings
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl font-semibold">{room?.name ?? 'Room'}</h1>
          <p className="mt-1 text-muted-foreground">Reference {booking.reference}</p>
        </div>
        <div className="flex gap-2">
          <BookingStatusBadge status={booking.status} />
          <PaymentStatusBadge status={booking.paymentStatus} />
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Stay details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2.5 text-sm">
              <Row label="Check-in" value={`${booking.checkIn} · from ${bookingSettings.checkInTime}`} />
              <Row label="Check-out" value={`${booking.checkOut} · by ${bookingSettings.checkOutTime}`} />
              <Row label="Nights" value={String(booking.nights)} />
              <Row
                label="Guests"
                value={`${booking.adults} adult${booking.adults > 1 ? 's' : ''}${
                  booking.children ? `, ${booking.children} child${booking.children > 1 ? 'ren' : ''}` : ''
                }`}
              />
              {booking.specialRequests && <Row label="Requests" value={booking.specialRequests} />}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Guest information</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2.5 text-sm">
              <p className="flex items-center gap-2">
                <MapPin className="size-4 text-muted-foreground" /> {booking.guestName}
              </p>
              <p className="flex items-center gap-2">
                <Mail className="size-4 text-muted-foreground" /> {booking.guestEmail}
              </p>
              <p className="flex items-center gap-2">
                <Phone className="size-4 text-muted-foreground" /> {booking.guestPhone}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="lg:sticky lg:top-28 lg:self-start">
          <Card>
            <CardHeader>
              <CardTitle>Price summary</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2.5 text-sm">
              <Row label="Subtotal" value={formatMoney(Number(booking.subtotal), booking.currency)} />
              {Number(booking.discountAmount) > 0 && (
                <Row label="Discount" value={`− ${formatMoney(Number(booking.discountAmount), booking.currency)}`} />
              )}
              <Row label="Taxes & service" value={formatMoney(Number(booking.taxAmount), booking.currency)} />
              <Separator className="my-1" />
              <div className="flex items-center justify-between">
                <span className="font-semibold">Total</span>
                <span className="font-serif text-xl font-semibold text-primary">
                  {formatMoney(Number(booking.total), booking.currency)}
                </span>
              </div>

              <div className="mt-4 grid gap-2">
                {booking.paymentStatus !== 'paid' && booking.status !== 'cancelled' && (
                  <Link href={`/booking/${booking.reference}/pay`}>
                    <Button className="w-full">
                      <CreditCard className="size-4" /> Complete payment
                    </Button>
                  </Link>
                )}
                <Link href={`/invoice/${booking.reference}`}>
                  <Button variant="outline" className="w-full">
                    <Download className="size-4" /> View invoice
                  </Button>
                </Link>
                {cancellable.allowed ? (
                  <CancelBookingButton reference={booking.reference} />
                ) : booking.status !== 'cancelled' ? (
                  <p className="text-xs text-muted-foreground">{cancellable.reason}</p>
                ) : null}
              </div>
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
