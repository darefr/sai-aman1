import { notFound } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, Download, CalendarDays, Mail } from 'lucide-react'
import { SiteShell } from '@/components/site-shell'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getBookingByReference } from '@/lib/bookings'
import { getRoomById } from '@/lib/data'
import { formatMoney } from '@/lib/pricing'
import { isDatabaseConfigured } from '@/lib/env'

export const dynamic = 'force-dynamic'

export default async function ConfirmationPage({ params }: { params: Promise<{ reference: string }> }) {
  if (!isDatabaseConfigured()) notFound()
  const { reference } = await params
  const booking = await getBookingByReference(reference)
  if (!booking) notFound()
  const room = await getRoomById(booking.roomId)

  const paid = booking.paymentStatus === 'paid'

  return (
    <SiteShell>
      <div className="mx-auto max-w-2xl px-5 py-12 md:px-8">
        <div className="text-center">
          <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-full bg-emerald-600/15">
            <CheckCircle2 className="size-9 text-emerald-600" />
          </div>
          <h1 className="text-balance font-serif text-3xl font-semibold md:text-4xl">
            {paid ? 'Your stay is confirmed' : 'Booking received'}
          </h1>
          <p className="mx-auto mt-3 max-w-md text-pretty text-muted-foreground">
            {paid
              ? 'Thank you for choosing Hotel Sai Aman. A confirmation has been sent to your email.'
              : 'Your booking is reserved. Complete payment to confirm your stay.'}
          </p>
          <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-muted px-4 py-1.5 text-sm">
            Booking reference <span className="font-semibold text-primary">{booking.reference}</span>
          </p>
        </div>

        <Card className="mt-8 p-6 md:p-8">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl font-semibold">{room?.name ?? 'Room'}</h2>
            <Badge variant={paid ? 'success' : 'warning'}>{paid ? 'Confirmed' : 'Pending payment'}</Badge>
          </div>

          <dl className="mt-5 grid gap-2.5 text-sm">
            <Row label="Guest" value={booking.guestName} />
            <Row label="Check-in" value={booking.checkIn} />
            <Row label="Check-out" value={booking.checkOut} />
            <Row label="Nights" value={String(booking.nights)} />
            <Row
              label="Guests"
              value={`${booking.adults} adult${booking.adults > 1 ? 's' : ''}${
                booking.children ? `, ${booking.children} child${booking.children > 1 ? 'ren' : ''}` : ''
              }`}
            />
            <Separator className="my-1" />
            <Row label="Subtotal" value={formatMoney(Number(booking.subtotal), booking.currency)} />
            {Number(booking.discountAmount) > 0 && (
              <Row label="Discount" value={`− ${formatMoney(Number(booking.discountAmount), booking.currency)}`} />
            )}
            <Row label="Taxes & service" value={formatMoney(Number(booking.taxAmount), booking.currency)} />
            <Separator className="my-1" />
            <div className="flex items-center justify-between">
              <dt className="font-semibold">Total {paid ? 'paid' : 'due'}</dt>
              <dd className="font-serif text-xl font-semibold text-primary">
                {formatMoney(Number(booking.total), booking.currency)}
              </dd>
            </div>
          </dl>

          <div className="mt-6 flex flex-wrap gap-3">
            {!paid && (
              <Link href={`/booking/${booking.reference}/pay`}>
                <Button>Complete payment</Button>
              </Link>
            )}
            <Link href={`/invoice/${booking.reference}`}>
              <Button variant="outline">
                <Download className="size-4" /> View invoice
              </Button>
            </Link>
            <Link href="/account/bookings">
              <Button variant="ghost">
                <CalendarDays className="size-4" /> My bookings
              </Button>
            </Link>
          </div>
        </Card>

        <p className="mt-6 flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
          <Mail className="size-3.5" /> A copy of this confirmation was sent to {booking.guestEmail}
        </p>
      </div>
    </SiteShell>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  )
}
