/**
 * SAFE TEST PROVIDER
 * ------------------
 * Used when a real gateway is not configured. It routes the guest to an
 * in-app sandbox page where they can simulate a successful or failed payment.
 * No money moves. This never pretends to be a real payment.
 */

import type { PaymentProvider, InitiateResult, VerifyResult } from './types'

export const mockProvider: PaymentProvider = {
  id: 'mock',
  label: 'Test payment (sandbox)',
  isLive() {
    return false
  },
  async initiate(input): Promise<InitiateResult> {
    const url = new URL(input.returnUrl)
    // The sandbox page reads these to render a realistic confirm/cancel screen.
    url.searchParams.set('provider', 'mock')
    url.searchParams.set('sandbox', '1')
    url.searchParams.set('txn', input.transactionRef)
    url.searchParams.set('amount', String(input.amount))
    return { ok: true, kind: 'redirect', url: url.toString() }
  },
  async verify(input): Promise<VerifyResult> {
    // The sandbox posts back an explicit outcome.
    const outcome = input.params.outcome
    if (outcome === 'success') {
      return { ok: true, status: 'paid', providerRef: `MOCK-${input.transactionRef}` }
    }
    return { ok: false, status: 'failed', message: 'Test payment was cancelled.' }
  },
}
