'use server'

import { revalidatePath } from 'next/cache'
import { createBookingSchema, availabilitySchema } from '@/lib/validation'
import { createBooking, getBookingForUser, canCancel, cancelBooking, getBookingById } from '@/lib/bookings'
import { getRoomById, getBookingSettings, getPricingSettings, getActiveCoupon, getRooms } from '@/lib/data'
import { getAvailableUnits } from '@/lib/availability'
import { computePrice, type CouponInput } from '@/lib/pricing'
import { getCurrentUser } from '@/lib/session'
import { notifyBookingCreated, notifyBookingCancelled } from '@/lib/notify'
import { audit } from '@/lib/audit'
import { isDatabaseConfigured } from '@/lib/env'

export type QuoteResult =
  | {
      ok: true
      available: boolean
      availableUnits: number
      breakdown: ReturnType<typeof computePrice>
    }
  | { ok: false; error: string }

/** Live quote + availability for a room and date range. */
export async function quoteBooking(raw: {
  roomId: string
  checkIn: string
  checkOut: string
  adults: number
  children: number
  units?: number
  couponCode?: string
}): Promise<QuoteResult> {
  if (!isDatabaseConfigured()) {
    return { ok: false, error: 'Online booking is not enabled yet. Please contact us to reserve.' }
  }

  const parsed = availabilitySchema.safeParse(raw)
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid search.' }
  }

  const room = await getRoomById(raw.roomId)
  if (!room) return { ok: false, error: 'Room not found.' }

  const [availableUnits, pricingSettings] = await Promise.all([
    getAvailableUnits(raw.roomId, raw.checkIn, raw.checkOut),
    getPricingSettings(),
  ])

  let coupon: CouponInput = null
  if (raw.couponCode?.trim()) {
    const c = await getActiveCoupon(raw.couponCode.trim())
    if (c) {
      coupon = {
        code: c.code,
        type: c.type as 'percent' | 'fixed',
        value: Number(c.value),
        minNights: c.minNights,
        minAmount: Number(c.minAmount),
      }
    } else {
      coupon = { code: raw.couponCode.trim(), type: 'percent', value: 0, minNights: 1, minAmount: 0 }
    }
  }

  const units = Math.max(1, raw.units ?? 1)
  const breakdown = computePrice({
    roomRate: Number(room.pricePerNight),
    checkIn: raw.checkIn,
    checkOut: raw.checkOut,
    units,
    coupon,
    settings: pricingSettings,
  })

  if (raw.couponCode?.trim() && !breakdown.couponApplied && !breakdown.couponError) {
    breakdown.couponError = 'Invalid or expired coupon.'
  }

  return { ok: true, available: availableUnits >= units, availableUnits, breakdown }
}

export type SearchResult = {
  ok: boolean
  error?: string
  rooms?: Array<{
    id: string
    slug: string
    name: string
    description: string
    beds: string
    maxGuests: number
    pricePerNight: number
    currency: string
    gallery: { src: string; alt: string }[]
    amenities: string[]
    availableUnits: number
    nights: number
    estimatedTotal: number
  }>
  nights?: number
}

/** Search all rooms for availability across a date range. */
export async function searchAvailability(raw: {
  checkIn: string
  checkOut: string
  adults: number
  children: number
}): Promise<SearchResult> {
  if (!isDatabaseConfigured()) {
    return { ok: false, error: 'Online booking is not enabled yet. Please contact us to reserve.' }
  }
  const parsed = availabilitySchema.safeParse(raw)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid search.' }

  const totalGuests = raw.adults + raw.children
  const [rooms, pricingSettings, bookingSettings] = await Promise.all([
    getRooms(),
    getPricingSettings(),
    getBookingSettings(),
  ])

  const nights = Math.max(1, Math.round((+new Date(raw.checkOut) - +new Date(raw.checkIn)) / 86_400_000))

  const results = []
  for (const room of rooms) {
    if (room.maxGuests < totalGuests) continue
    const availableUnits = await getAvailableUnits(room.id, raw.checkIn, raw.checkOut)
    if (availableUnits < 1) continue
    const breakdown = computePrice({
      roomRate: room.pricePerNight,
      checkIn: raw.checkIn,
      checkOut: raw.checkOut,
      units: 1,
      settings: pricingSettings,
    })
    results.push({
      id: room.id,
      slug: room.slug,
      name: room.name,
      description: room.description,
      beds: room.beds,
      maxGuests: room.maxGuests,
      pricePerNight: room.pricePerNight,
      currency: room.currency,
      gallery: room.gallery,
      amenities: room.amenities,
      availableUnits,
      nights,
      estimatedTotal: breakdown.total,
    })
  }

  void bookingSettings
  return { ok: true, rooms: results, nights }
}

export type CreateBookingActionResult =
  | { ok: true; reference: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> }

export async function createBookingAction(raw: unknown): Promise<CreateBookingActionResult> {
  const parsed = createBookingSchema.safeParse(raw)
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      const key = issue.path[0]
      if (typeof key === 'string' && !fieldErrors[key]) fieldErrors[key] = issue.message
    }
    return { ok: false, error: 'Please correct the highlighted fields.', fieldErrors }
  }

  const user = await getCurrentUser()
  const input = parsed.data

  const result = await createBooking({
    roomId: input.roomId,
    checkIn: input.checkIn,
    checkOut: input.checkOut,
    adults: input.adults,
    children: input.children,
    units: input.units,
    guestName: input.guestName,
    guestEmail: input.guestEmail,
    guestPhone: input.guestPhone,
    specialRequests: input.specialRequests,
    couponCode: input.couponCode,
    userId: user?.id ?? null,
  })

  if (!result.ok) return { ok: false, error: result.error }

  const booking = await getBookingById(result.bookingId)
  const room = await getRoomById(input.roomId)
  if (booking) {
    await notifyBookingCreated(booking, room?.name ?? 'Room')
    await audit({
      actorId: user?.id ?? null,
      actorEmail: input.guestEmail,
      action: 'booking.create',
      entity: 'booking',
      entityId: booking.id,
      meta: { reference: booking.reference },
    })
  }

  revalidatePath('/account/bookings')
  return { ok: true, reference: result.reference }
}

export async function cancelMyBookingAction(reference: string): Promise<{ ok: boolean; error?: string }> {
  const user = await getCurrentUser()
  if (!user) return { ok: false, error: 'Please sign in to manage your booking.' }

  const booking = await getBookingForUser(reference, user.id)
  if (!booking) return { ok: false, error: 'Booking not found.' }

  const settings = await getBookingSettings()
  const check = canCancel(booking, settings.cancellationHours)
  if (!check.allowed) return { ok: false, error: check.reason }

  await cancelBooking(booking.id, 'Cancelled by customer')
  const room = await getRoomById(booking.roomId)
  const updated = await getBookingById(booking.id)
  if (updated) await notifyBookingCancelled(updated, room?.name ?? 'Room')
  await audit({
    actorId: user.id,
    actorEmail: user.email,
    action: 'booking.cancel',
    entity: 'booking',
    entityId: booking.id,
    meta: { reference },
  })

  revalidatePath('/account/bookings')
  revalidatePath(`/account/bookings/${reference}`)
  return { ok: true }
}
