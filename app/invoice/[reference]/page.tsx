import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { PrintButton } from '@/components/account/print-button'
import { Separator } from '@/components/ui/separator'
import { requireUser, isAdminRole } from '@/lib/session'
import { getBookingByReference, getBookingForUser, getInvoiceForBooking } from '@/lib/bookings'
import { getRoomById, getSetting } from '@/lib/data'
import { formatMoney } from '@/lib/pricing'

export const dynamic = 'force-dynamic'

type HotelInfo = { name?: string; legalName?: string; phone?: string; email?: string; address?: string; panVat?: string }

export default async function InvoicePage({ params }: { params: Promise<{ reference: string }> }) {
  const user = await requireUser()
  const { reference } = await params

  // Admins can view any invoice; customers only their own.
  const booking = isAdminRole(user.role)
    ? await getBookingByReference(reference)
    : await getBookingForUser(reference, user.id)
  if (!booking) notFound()

  const [room, invoice, hotel] = await Promise.all([
    getRoomById(booking.roomId),
    getInvoiceForBooking(booking.id),
    getSetting<HotelInfo>('hotel'),
  ])

  const hotelName = hotel?.name ?? 'Hotel Sai Aman'
  const currency = booking.currency

  return (
    <div className="min-h-screen bg-muted/40 py-10 print:bg-white print:py-0">
      <div className="mx-auto max-w-2xl px-5">
        <div className="mb-6 flex items-center justify-between print:hidden">
          <Link
            href={`/account/bookings/${booking.reference}`}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" /> Back
          </Link>
          <PrintButton />
        </div>

        <div className="rounded-xl border border-border bg-card p-8 shadow-sm print:border-0 print:shadow-none">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <p className="font-serif text-2xl font-semibold">
                {hotelName.replace(' Aman', '')} <span className="text-gold">Aman</span>
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {hotel?.address ?? 'New Bus Park, Butwal, Nepal'}
              </p>
              {hotel?.phone && <p className="text-xs text-muted-foreground">{hotel.phone}</p>}
              {hotel?.email && <p className="text-xs text-muted-foreground">{hotel.email}</p>}
              {hotel?.panVat && <p className="text-xs text-muted-foreground">PAN/VAT: {hotel.panVat}</p>}
            </div>
            <div className="text-right">
              <p className="font-serif text-xl font-semibold">Invoice</p>
              <p className="mt-1 text-xs text-muted-foreground">{invoice?.number ?? booking.reference}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(invoice?.issuedAt ?? booking.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Parties */}
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Billed to</p>
              <p className="mt-1 font-medium">{booking.guestName}</p>
              <p className="text-sm text-muted-foreground">{booking.guestEmail}</p>
              <p className="text-sm text-muted-foreground">{booking.guestPhone}</p>
            </div>
            <div className="sm:text-right">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Booking</p>
              <p className="mt-1 font-medium">{booking.reference}</p>
              <p className="text-sm text-muted-foreground">
                Status: {booking.status} · Payment: {booking.paymentStatus}
              </p>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Line items */}
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="pb-2 font-semibold">Description</th>
                <th className="pb-2 text-right font-semibold">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border/60">
                <td className="py-3">
                  <p className="font-medium">{room?.name ?? 'Room'}</p>
                  <p className="text-xs text-muted-foreground">
                    {booking.checkIn} → {booking.checkOut} · {booking.nights} night{booking.nights > 1 ? 's' : ''} ·{' '}
                    {formatMoney(Number(booking.roomRate), currency)}/night
                    {booking.unitsBooked > 1 ? ` · ${booking.unitsBooked} rooms` : ''}
                  </p>
                </td>
                <td className="py-3 text-right">{formatMoney(Number(booking.subtotal), currency)}</td>
              </tr>
              {Number(booking.discountAmount) > 0 && (
                <tr className="border-b border-border/60">
                  <td className="py-3">
                    Discount {booking.couponCode ? `(${booking.couponCode})` : ''}
                  </td>
                  <td className="py-3 text-right text-emerald-600">
                    − {formatMoney(Number(booking.discountAmount), currency)}
                  </td>
                </tr>
              )}
              <tr className="border-b border-border/60">
                <td className="py-3">Taxes &amp; service charge</td>
                <td className="py-3 text-right">{formatMoney(Number(booking.taxAmount), currency)}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td className="pt-4 text-right font-semibold">Total</td>
                <td className="pt-4 text-right font-serif text-lg font-semibold text-primary">
                  {formatMoney(Number(booking.total), currency)}
                </td>
              </tr>
            </tfoot>
          </table>

          <Separator className="my-6" />

          <p className="text-center text-xs text-muted-foreground">
            Thank you for choosing {hotelName}. We look forward to welcoming you.
          </p>
        </div>
      </div>
    </div>
  )
}
