/**
 * Khalti (ePayment) provider.
 * Docs: https://docs.khalti.com
 *
 * Initiates via the server-to-server "initiate" API which returns a
 * `payment_url` to redirect the guest to, then verifies with "lookup".
 * Amounts are sent in paisa (NPR * 100).
 */

import type { PaymentProvider, InitiateResult, VerifyResult } from './types'
import { env, isKhaltiConfigured } from '@/lib/env'

const KHALTI_INITIATE_URL = 'https://khalti.com/api/v2/epayment/initiate/'
const KHALTI_LOOKUP_URL = 'https://khalti.com/api/v2/epayment/lookup/'

export const khaltiProvider: PaymentProvider = {
  id: 'khalti',
  label: 'Khalti',
  isLive() {
    return isKhaltiConfigured()
  },
  async initiate(input): Promise<InitiateResult> {
    if (!isKhaltiConfigured()) return { ok: false, error: 'Khalti is not configured.' }
    try {
      const res = await fetch(KHALTI_INITIATE_URL, {
        method: 'POST',
        headers: {
          Authorization: `Key ${env.KHALTI_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          return_url: input.returnUrl,
          website_url: new URL(input.returnUrl).origin,
          amount: Math.round(input.amount * 100),
          purchase_order_id: input.transactionRef,
          purchase_order_name: `Booking ${input.bookingReference}`,
          customer_info: { name: input.customerName, email: input.customerEmail },
        }),
        cache: 'no-store',
      })
      const data = (await res.json()) as { pidx?: string; payment_url?: string; detail?: string }
      if (data.payment_url) {
        return { ok: true, kind: 'redirect', url: data.payment_url }
      }
      return { ok: false, error: data.detail ?? 'Khalti did not return a payment URL.' }
    } catch (error) {
      console.error('[v0][khalti] initiate failed:', error)
      return { ok: false, error: 'Could not start Khalti payment.' }
    }
  },
  async verify(input): Promise<VerifyResult> {
    if (!isKhaltiConfigured()) return { ok: false, status: 'failed', message: 'Khalti is not configured.' }
    const pidx = input.params.pidx
    if (!pidx) return { ok: false, status: 'failed', message: 'Missing Khalti pidx.' }
    try {
      const res = await fetch(KHALTI_LOOKUP_URL, {
        method: 'POST',
        headers: {
          Authorization: `Key ${env.KHALTI_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pidx }),
        cache: 'no-store',
      })
      const data = (await res.json()) as { status?: string; transaction_id?: string; total_amount?: number }
      if (data.status === 'Completed') {
        // Confirm the amount matches to prevent tampering.
        if (typeof data.total_amount === 'number' && data.total_amount !== Math.round(input.amount * 100)) {
          return { ok: false, status: 'failed', message: 'Amount mismatch.' }
        }
        return { ok: true, status: 'paid', providerRef: data.transaction_id ?? pidx }
      }
      if (data.status === 'Pending' || data.status === 'Initiated') {
        return { ok: false, status: 'pending', message: `Khalti status: ${data.status}` }
      }
      return { ok: false, status: 'failed', message: `Khalti status: ${data.status ?? 'unknown'}` }
    } catch (error) {
      console.error('[v0][khalti] verify failed:', error)
      return { ok: false, status: 'pending', message: 'Could not verify Khalti payment.' }
    }
  },
}
