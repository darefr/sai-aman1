/**
 * ============================================================================
 * PAYMENT ORCHESTRATION
 * ============================================================================
 *
 * Chooses a provider, records payment attempts, and settles bookings after
 * server-side verification. When a chosen provider has no live credentials the
 * safe mock provider is used so the flow never pretends a real payment occurred.
 * ============================================================================
 */

import 'server-only'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import * as s from '@/lib/db/schema'
import { newId } from '@/lib/ids'
import { mockProvider } from './mock'
import { esewaProvider } from './esewa'
import { khaltiProvider } from './khalti'
import { fonepayProvider } from './fonepay'
import type { PaymentProvider, PaymentProviderId, InitiateResult, VerifyResult } from './types'

const REGISTRY: Record<Exclude<PaymentProviderId, 'mock'>, PaymentProvider> = {
  esewa: esewaProvider,
  khalti: khaltiProvider,
  fonepay: fonepayProvider,
}

export type SelectableProvider = {
  id: PaymentProviderId
  label: string
  live: boolean
}

/** Providers offered in the UI. Always includes the safe test option. */
export function listProviders(): SelectableProvider[] {
  const items: SelectableProvider[] = (Object.values(REGISTRY) as PaymentProvider[]).map((p) => ({
    id: p.id,
    label: p.label,
    live: p.isLive(),
  }))
  items.push({ id: 'mock', label: mockProvider.label, live: false })
  return items
}

/** Resolve the effective provider: fall back to mock if not live. */
export function resolveProvider(id: PaymentProviderId): PaymentProvider {
  if (id === 'mock') return mockProvider
  const provider = REGISTRY[id]
  if (!provider || !provider.isLive()) return mockProvider
  return provider
}

export type StartPaymentInput = {
  bookingId: string
  transactionRef: string
  providerId: PaymentProviderId
  amount: number
  currency: string
  bookingReference: string
  customerName: string
  customerEmail: string
  returnUrl: string
  callbackUrl: string
}

/** Records a payment attempt and asks the provider to initiate it. */
export async function startPayment(input: StartPaymentInput): Promise<InitiateResult & { effectiveProvider: PaymentProviderId }> {
  const provider = resolveProvider(input.providerId)

  await db.insert(s.payments).values({
    id: newId('pay'),
    bookingId: input.bookingId,
    provider: provider.id,
    amount: String(input.amount),
    currency: input.currency,
    status: 'initiated',
    transactionRef: input.transactionRef,
    meta: { requestedProvider: input.providerId },
  })

  await db
    .update(s.bookings)
    .set({ paymentStatus: 'pending', updatedAt: new Date() })
    .where(eq(s.bookings.id, input.bookingId))

  const result = await provider.initiate({
    transactionRef: input.transactionRef,
    amount: input.amount,
    currency: input.currency,
    bookingReference: input.bookingReference,
    customerName: input.customerName,
    customerEmail: input.customerEmail,
    returnUrl: input.returnUrl,
    callbackUrl: input.callbackUrl,
  })

  return { ...result, effectiveProvider: provider.id }
}

/**
 * Verifies a returning payment and settles the booking. Idempotent: a payment
 * already marked paid is not double-processed.
 */
export async function settlePayment(params: {
  transactionRef: string
  providerId: PaymentProviderId
  gatewayParams: Record<string, string>
}): Promise<{ ok: boolean; bookingId?: string; status: VerifyResult['status']; message?: string; firstSettlement?: boolean }> {
  const [payment] = await db
    .select()
    .from(s.payments)
    .where(eq(s.payments.transactionRef, params.transactionRef))
    .limit(1)

  if (!payment) return { ok: false, status: 'failed', message: 'Unknown transaction.' }
  if (payment.status === 'paid') {
    return { ok: true, bookingId: payment.bookingId, status: 'paid', firstSettlement: false }
  }

  const provider = resolveProvider(params.providerId === 'mock' ? 'mock' : (payment.provider as PaymentProviderId))
  const verification = await provider.verify({
    transactionRef: params.transactionRef,
    amount: Number(payment.amount),
    params: params.gatewayParams,
  })

  if (verification.ok && verification.status === 'paid') {
    await db
      .update(s.payments)
      .set({ status: 'paid', providerRef: verification.providerRef ?? null, updatedAt: new Date() })
      .where(eq(s.payments.id, payment.id))

    await db
      .update(s.bookings)
      .set({ status: 'confirmed', paymentStatus: 'paid', updatedAt: new Date() })
      .where(eq(s.bookings.id, payment.bookingId))

    return { ok: true, bookingId: payment.bookingId, status: 'paid', firstSettlement: true }
  }

  if (verification.status === 'failed') {
    await db
      .update(s.payments)
      .set({ status: 'failed', updatedAt: new Date() })
      .where(eq(s.payments.id, payment.id))
    await db
      .update(s.bookings)
      .set({ paymentStatus: 'failed', updatedAt: new Date() })
      .where(eq(s.bookings.id, payment.bookingId))
  }

  return { ok: false, bookingId: payment.bookingId, status: verification.status, message: verification.message }
}

export * from './types'
