import { notFound, redirect } from 'next/navigation'
import Image from 'next/image'
import { CheckCircle2 } from 'lucide-react'
import { SiteShell } from '@/components/site-shell'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { PaymentPanel } from '@/components/booking/payment-panel'
import { getBookingByReference } from '@/lib/bookings'
import { getRoomById } from '@/lib/data'
import { listProviders } from '@/lib/payments'
import { formatMoney } from '@/lib/pricing'
import { isDatabaseConfigured } from '@/lib/env'

export const dynamic = 'force-dynamic'

export default async function PayPage({
  params,
  searchParams,
}: {
  params: Promise<{ reference: string }>
  searchParams: Promise<{ payment?: string }>
}) {
  if (!isDatabaseConfigured()) notFound()
  const { reference } = await params
  const { payment } = await searchParams

  const booking = await getBookingByReference(reference)
  if (!booking) notFound()

  if (booking.paymentStatus === 'paid') {
    redirect(`/booking/${reference}/confirmation`)
  }

  const room = await getRoomById(booking.roomId)
  const providers = listProviders()

  return (
    <SiteShell>
      <div className="mx-auto max-w-5xl px-5 py-10 md:px-8">
        <h1 className="font-serif text-3xl font-semibold md:text-4xl">Complete your payment</h1>
        <p className="mt-2 text-muted-foreground">Secure your reservation at Hotel Sai Aman.</p>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
          <PaymentPanel
            reference={booking.reference}
            amount={Number(booking.total)}
            currency={booking.currency}
            providers={providers}
            initialError={payment === 'failed' ? 'Your last payment attempt did not complete. Please try again.' : undefined}
          />

          <div className="lg:sticky lg:top-28 lg:self-start">
            <Card className="overflow-hidden p-0">
              {room?.gallery?.[0] && (
                <div className="relative h-40 w-full">
                  <Image
                    src={room.gallery[0].src}
                    alt={room.gallery[0].alt}
                    fill
                    sizes="360px"
                    className="object-cover"
                  />
                </div>
              )}
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <h2 className="font-serif text-lg font-semibold">{room?.name ?? 'Room'}</h2>
                  <Badge variant="warning">Pending</Badge>
                </div>
                <dl className="mt-4 grid gap-2 text-sm">
                  <Row label="Reference" value={booking.reference} />
                  <Row label="Check-in" value={booking.checkIn} />
                  <Row label="Check-out" value={booking.checkOut} />
                  <Row label="Nights" value={String(booking.nights)} />
                  <Row
                    label="Guests"
                    value={`${booking.adults + booking.children} guest${booking.adults + booking.children > 1 ? 's' : ''}`}
                  />
                  <Separator className="my-1" />
                  <Row label="Subtotal" value={formatMoney(Number(booking.subtotal), booking.currency)} />
                  {Number(booking.discountAmount) > 0 && (
                    <Row label="Discount" value={`− ${formatMoney(Number(booking.discountAmount), booking.currency)}`} />
                  )}
                  <Row label="Taxes & service" value={formatMoney(Number(booking.taxAmount), booking.currency)} />
                  <Separator className="my-1" />
                  <div className="flex items-center justify-between">
                    <dt className="font-semibold">Total</dt>
                    <dd className="font-serif text-xl font-semibold text-primary">
                      {formatMoney(Number(booking.total), booking.currency)}
                    </dd>
                  </div>
                </dl>
                <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <CheckCircle2 className="size-3.5 text-emerald-600" /> Free cancellation up to 24h before check-in
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </SiteShell>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  )
}
