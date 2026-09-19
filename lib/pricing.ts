/**
 * ============================================================================
 * PRICING ENGINE (pure, server-authoritative)
 * ============================================================================
 * All monetary math lives here. The server always recomputes totals from
 * trusted room rates and settings — never from client-supplied amounts.
 * ============================================================================
 */

export type PricingSettings = {
  currency: string
  taxPercent: number
  serviceFeePercent: number
  taxLabel: string
  serviceFeeLabel: string
}

export const DEFAULT_PRICING: PricingSettings = {
  currency: 'NPR',
  taxPercent: 13,
  serviceFeePercent: 10,
  taxLabel: 'VAT (13%)',
  serviceFeeLabel: 'Service charge (10%)',
}

export type CouponInput = {
  code: string
  type: 'percent' | 'fixed'
  value: number
  minNights: number
  minAmount: number
} | null

export type PriceBreakdown = {
  nights: number
  units: number
  roomRate: number
  subtotal: number
  discountAmount: number
  taxableBase: number
  taxAmount: number
  serviceFeeAmount: number
  total: number
  currency: string
  couponApplied: string | null
  couponError: string | null
}

/** Whole nights between two ISO dates (check-out exclusive). */
export function nightsBetween(checkIn: string, checkOut: string): number {
  const a = new Date(`${checkIn}T00:00:00Z`).getTime()
  const b = new Date(`${checkOut}T00:00:00Z`).getTime()
  const diff = Math.round((b - a) / 86_400_000)
  return diff
}

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100
}

export function computePrice(params: {
  roomRate: number
  checkIn: string
  checkOut: string
  units?: number
  coupon?: CouponInput
  settings?: PricingSettings
}): PriceBreakdown {
  const settings = params.settings ?? DEFAULT_PRICING
  const units = Math.max(1, params.units ?? 1)
  const nights = nightsBetween(params.checkIn, params.checkOut)
  const roomRate = params.roomRate

  const subtotal = round2(roomRate * nights * units)

  let discountAmount = 0
  let couponApplied: string | null = null
  let couponError: string | null = null

  if (params.coupon) {
    const c = params.coupon
    if (nights < c.minNights) {
      couponError = `Coupon requires at least ${c.minNights} night(s).`
    } else if (subtotal < c.minAmount) {
      couponError = `Coupon requires a minimum of ${settings.currency} ${c.minAmount}.`
    } else {
      discountAmount = c.type === 'percent' ? round2((subtotal * c.value) / 100) : round2(Math.min(c.value, subtotal))
      couponApplied = c.code
    }
  }

  const taxableBase = round2(subtotal - discountAmount)
  const taxAmount = round2((taxableBase * settings.taxPercent) / 100)
  const serviceFeeAmount = round2((taxableBase * settings.serviceFeePercent) / 100)
  const total = round2(taxableBase + taxAmount + serviceFeeAmount)

  return {
    nights,
    units,
    roomRate,
    subtotal,
    discountAmount,
    taxableBase,
    taxAmount,
    serviceFeeAmount,
    total,
    currency: settings.currency,
    couponApplied,
    couponError,
  }
}

export function formatMoney(amount: number, currency = 'NPR'): string {
  const formatted = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(Math.round(amount))
  return `${currency} ${formatted}`
}
