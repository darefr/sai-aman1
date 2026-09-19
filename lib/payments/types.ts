/**
 * ============================================================================
 * PAYMENT ABSTRACTION
 * ============================================================================
 *
 * A provider-agnostic contract for Nepal payment gateways. Each provider
 * implements `initiate` (start a payment and tell the client where to go) and
 * `verify` (confirm a payment from the gateway's callback/return).
 *
 * SECURITY: providers never receive or store card numbers, CVV, OTPs or
 * passwords. Only non-sensitive references and amounts are handled here, and
 * all secrets come from environment variables.
 * ============================================================================
 */

export type PaymentProviderId = 'esewa' | 'khalti' | 'fonepay' | 'mock'

export type InitiateInput = {
  transactionRef: string
  amount: number
  currency: string
  bookingReference: string
  customerName: string
  customerEmail: string
  /** Absolute URL the gateway should return to after payment. */
  returnUrl: string
  /** Absolute URL for the gateway to send a server callback (where supported). */
  callbackUrl: string
}

export type InitiateResult =
  | {
      ok: true
      /** 'redirect' → browser navigates to `url`. 'form' → auto-submit POST. */
      kind: 'redirect' | 'form'
      url: string
      /** Present when kind === 'form': fields to POST to `url`. */
      fields?: Record<string, string>
    }
  | { ok: false; error: string }

export type VerifyInput = {
  transactionRef: string
  amount: number
  /** Raw query/body params returned by the gateway. */
  params: Record<string, string>
}

export type VerifyResult = {
  ok: boolean
  providerRef?: string
  status: 'paid' | 'failed' | 'pending'
  message?: string
}

export interface PaymentProvider {
  id: PaymentProviderId
  label: string
  /** Whether real gateway credentials are configured. */
  isLive(): boolean
  initiate(input: InitiateInput): Promise<InitiateResult>
  verify(input: VerifyInput): Promise<VerifyResult>
}
