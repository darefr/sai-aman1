/**
 * eSewa (ePay v2) provider.
 * Docs: https://developer.esewa.com.np
 *
 * Uses HMAC-SHA256 signing over the documented field order. Falls back to
 * "not configured" when ESEWA_MERCHANT_CODE / ESEWA_SECRET_KEY are absent, in
 * which case the payment layer uses the safe mock provider instead.
 */

import { createHmac } from 'crypto'
import type { PaymentProvider, InitiateResult, VerifyResult } from './types'
import { env, isEsewaConfigured } from '@/lib/env'

const ESEWA_FORM_URL = 'https://rc-epay.esewa.com.np/api/epay/main/v2/form'
const ESEWA_STATUS_URL = 'https://rc.esewa.com.np/api/epay/transaction/status/'

function sign(message: string): string {
  return createHmac('sha256', env.ESEWA_SECRET_KEY).update(message).digest('base64')
}

export const esewaProvider: PaymentProvider = {
  id: 'esewa',
  label: 'eSewa',
  isLive() {
    return isEsewaConfigured()
  },
  async initiate(input): Promise<InitiateResult> {
    if (!isEsewaConfigured()) return { ok: false, error: 'eSewa is not configured.' }

    const total = input.amount.toFixed(2)
    const signedFieldNames = 'total_amount,transaction_uuid,product_code'
    const message = `total_amount=${total},transaction_uuid=${input.transactionRef},product_code=${env.ESEWA_MERCHANT_CODE}`
    const signature = sign(message)

    return {
      ok: true,
      kind: 'form',
      url: ESEWA_FORM_URL,
      fields: {
        amount: total,
        tax_amount: '0',
        total_amount: total,
        transaction_uuid: input.transactionRef,
        product_code: env.ESEWA_MERCHANT_CODE,
        product_service_charge: '0',
        product_delivery_charge: '0',
        success_url: input.returnUrl,
        failure_url: input.returnUrl,
        signed_field_names: signedFieldNames,
        signature,
      },
    }
  },
  async verify(input): Promise<VerifyResult> {
    if (!isEsewaConfigured()) return { ok: false, status: 'failed', message: 'eSewa is not configured.' }
    try {
      // eSewa returns a base64 JSON `data` param on success; verify via status API.
      const url = new URL(ESEWA_STATUS_URL)
      url.searchParams.set('product_code', env.ESEWA_MERCHANT_CODE)
      url.searchParams.set('total_amount', input.amount.toFixed(2))
      url.searchParams.set('transaction_uuid', input.transactionRef)
      const res = await fetch(url.toString(), { cache: 'no-store' })
      const data = (await res.json()) as { status?: string; ref_id?: string }
      if (data.status === 'COMPLETE') {
        return { ok: true, status: 'paid', providerRef: data.ref_id }
      }
      return { ok: false, status: 'failed', message: `eSewa status: ${data.status ?? 'unknown'}` }
    } catch (error) {
      console.error('[v0][esewa] verify failed:', error)
      return { ok: false, status: 'pending', message: 'Could not verify eSewa payment.' }
    }
  },
}
