import { type NextRequest, NextResponse } from 'next/server'
import { settlePayment, type PaymentProviderId } from '@/lib/payments'
import { getBookingById } from '@/lib/bookings'
import { getRoomById } from '@/lib/data'
import { notifyPaymentPaid } from '@/lib/notify'
import { getBaseUrl } from '@/lib/env'

const PROVIDERS = new Set(['esewa', 'khalti', 'fonepay', 'mock'])

/**
 * Server-to-server (or return) callback for a payment gateway. Verifies the
 * payment server-side, settles the booking, then redirects the guest to the
 * booking confirmation page.
 */
async function handle(req: NextRequest, provider: string) {
  const base = getBaseUrl()
  if (!PROVIDERS.has(provider)) {
    return NextResponse.redirect(`${base}/?payment=error`)
  }

  const url = new URL(req.url)
  const params: Record<string, string> = {}
  url.searchParams.forEach((v, k) => (params[k] = v))

  if (req.method === 'POST') {
    try {
      const contentType = req.headers.get('content-type') ?? ''
      if (contentType.includes('application/json')) {
        Object.assign(params, await req.json())
      } else {
        const form = await req.formData()
        form.forEach((v, k) => (params[k] = String(v)))
      }
    } catch {
      /* ignore body parse errors */
    }
  }

  const transactionRef = params.txn || params.transaction_uuid || params.purchase_order_id || params.PRN || ''
  if (!transactionRef) {
    return NextResponse.redirect(`${base}/?payment=error`)
  }

  const settlement = await settlePayment({
    transactionRef,
    providerId: provider as PaymentProviderId,
    gatewayParams: params,
  })

  if (settlement.ok && settlement.bookingId) {
    const booking = await getBookingById(settlement.bookingId)
    if (booking) {
      if (settlement.firstSettlement) {
        const room = await getRoomById(booking.roomId)
        await notifyPaymentPaid(booking, room?.name ?? 'Room')
      }
      return NextResponse.redirect(`${base}/booking/${booking.reference}/confirmation`)
    }
  }

  const ref = settlement.bookingId ? (await getBookingById(settlement.bookingId))?.reference : null
  const dest = ref ? `${base}/booking/${ref}/pay?payment=failed` : `${base}/?payment=failed`
  return NextResponse.redirect(dest)
}

export async function GET(req: NextRequest, ctx: { params: Promise<{ provider: string }> }) {
  const { provider } = await ctx.params
  return handle(req, provider)
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ provider: string }> }) {
  const { provider } = await ctx.params
  return handle(req, provider)
}
