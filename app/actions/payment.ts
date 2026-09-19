'use server'

import { getBookingByReference, getBookingById } from '@/lib/bookings'
import { getRoomById } from '@/lib/data'
import { startPayment, settlePayment, type PaymentProviderId } from '@/lib/payments'
import { newTransactionRef } from '@/lib/ids'
import { getBaseUrl } from '@/lib/env'
import { getCurrentUser } from '@/lib/session'
import { notifyPaymentPaid } from '@/lib/notify'

export type InitiatePaymentResult =
  | { ok: true; kind: 'redirect' | 'form'; url: string; fields?: Record<string, string> }
  | { ok: false; error: string }

export async function initiatePaymentAction(params: {
  reference: string
  providerId: PaymentProviderId
}): Promise<InitiatePaymentResult> {
  const booking = await getBookingByReference(params.reference)
  if (!booking) return { ok: false, error: 'Booking not found.' }

  // Authorization: the owner (if logged in) or a guest booking created in-session.
  const user = await getCurrentUser()
  if (booking.userId && (!user || user.id !== booking.userId)) {
    return { ok: false, error: 'You are not authorised to pay for this booking.' }
  }

  if (booking.paymentStatus === 'paid') {
    return { ok: false, error: 'This booking is already paid.' }
  }
  if (booking.status === 'cancelled') {
    return { ok: false, error: 'This booking has been cancelled.' }
  }

  const transactionRef = newTransactionRef()
  const base = getBaseUrl()
  const returnUrl = `${base}/booking/${booking.reference}/verify?provider=${params.providerId}&txn=${transactionRef}`
  const callbackUrl = `${base}/api/payments/${params.providerId}/callback`

  const result = await startPayment({
    bookingId: booking.id,
    transactionRef,
    providerId: params.providerId,
    amount: Number(booking.total),
    currency: booking.currency,
    bookingReference: booking.reference,
    customerName: booking.guestName,
    customerEmail: booking.guestEmail,
    returnUrl,
    callbackUrl,
  })

  if (!result.ok) return { ok: false, error: result.error }
  return { ok: true, kind: result.kind, url: result.url, fields: result.fields }
}

/**
 * Settles a payment when the guest returns from the gateway (or the sandbox).
 * Returns the outcome so the verify page can route accordingly.
 */
export async function settleReturnAction(params: {
  providerId: PaymentProviderId
  transactionRef: string
  gatewayParams: Record<string, string>
}): Promise<{ status: 'paid' | 'failed' | 'pending'; reference?: string; message?: string }> {
  const settlement = await settlePayment({
    transactionRef: params.transactionRef,
    providerId: params.providerId,
    gatewayParams: params.gatewayParams,
  })

  let reference: string | undefined
  if (settlement.bookingId) {
    const booking = await getBookingById(settlement.bookingId)
    reference = booking?.reference
    if (settlement.ok && settlement.status === 'paid' && settlement.firstSettlement && booking) {
      const room = await getRoomById(booking.roomId)
      await notifyPaymentPaid(booking, room?.name ?? 'Room')
    }
  }

  return { status: settlement.status, reference, message: settlement.message }
}
