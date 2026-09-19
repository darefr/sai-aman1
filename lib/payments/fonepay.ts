/**
 * Fonepay (RTP / merchant redirect) provider.
 * Docs: https://fonepay.com (merchant onboarding)
 *
 * Uses HMAC-SHA512 signing over the documented parameter order and redirects
 * the guest to the Fonepay merchant request page. Verifies the return using
 * the same shared secret.
 */

import { createHmac } from 'crypto'
import type { PaymentProvider, InitiateResult, VerifyResult } from './types'
import { env, isFonepayConfigured } from '@/lib/env'

const FONEPAY_REQUEST_URL = 'https://clientapi.fonepay.com/api/merchantRequest'

function sign(message: string): string {
  return createHmac('sha512', env.FONEPAY_SECRET_KEY).update(message).digest('hex')
}

export const fonepayProvider: PaymentProvider = {
  id: 'fonepay',
  label: 'Fonepay',
  isLive() {
    return isFonepayConfigured()
  },
  async initiate(input): Promise<InitiateResult> {
    if (!isFonepayConfigured()) return { ok: false, error: 'Fonepay is not configured.' }

    const amount = input.amount.toFixed(2)
    const prn = input.transactionRef
    const pid = env.FONEPAY_MERCHANT_CODE
    const md = 'P'
    const r1 = `Booking ${input.bookingReference}`
    const r2 = input.customerEmail
    const dv = sign([pid, md, prn, amount, r1, r2, input.returnUrl].join(','))

    const url = new URL(FONEPAY_REQUEST_URL)
    url.searchParams.set('PID', pid)
    url.searchParams.set('MD', md)
    url.searchParams.set('PRN', prn)
    url.searchParams.set('AMT', amount)
    url.searchParams.set('CRN', input.currency === 'NPR' ? 'NPR' : input.currency)
    url.searchParams.set('DT', new Date().toLocaleDateString('en-US'))
    url.searchParams.set('R1', r1)
    url.searchParams.set('R2', r2)
    url.searchParams.set('RU', input.returnUrl)
    url.searchParams.set('DV', dv)

    return { ok: true, kind: 'redirect', url: url.toString() }
  },
  async verify(input): Promise<VerifyResult> {
    if (!isFonepayConfigured()) return { ok: false, status: 'failed', message: 'Fonepay is not configured.' }
    const { PRN, PS, RC, UID, BID, DV } = input.params
    if (!DV) return { ok: false, status: 'failed', message: 'Missing Fonepay verification signature.' }
    // Recompute the response signature over the documented return-field order.
    const expected = sign([PRN, PS, RC, UID, BID].filter(Boolean).join(','))
    if (expected !== DV) return { ok: false, status: 'failed', message: 'Fonepay signature mismatch.' }
    if (PS === 'true' && RC === 'successful') {
      return { ok: true, status: 'paid', providerRef: UID ?? BID ?? PRN }
    }
    return { ok: false, status: 'failed', message: `Fonepay result: ${RC ?? 'unknown'}` }
  },
}
