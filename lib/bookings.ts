/**
 * ============================================================================
 * BOOKING OPERATIONS (server-authoritative, race-safe)
 * ============================================================================
 *
 * createBooking runs inside a transaction that locks the room row (SELECT ...
 * FOR UPDATE) so two concurrent requests cannot oversell the same inventory.
 * Availability is re-checked inside the lock immediately before insert.
 * ============================================================================
 */

import 'server-only'
import { drizzle } from 'drizzle-orm/node-postgres'
import { and, eq, desc } from 'drizzle-orm'
import { pool, db } from '@/lib/db'
import * as s from '@/lib/db/schema'
import { newId, newBookingReference, newInvoiceNumber } from '@/lib/ids'
import { computePrice, nightsBetween, type CouponInput } from '@/lib/pricing'
import { getAvailableUnits } from '@/lib/availability'
import { getPricingSettings, getBookingSettings, getActiveCoupon } from '@/lib/data'

export type CreateBookingInput = {
  roomId: string
  checkIn: string
  checkOut: string
  adults: number
  children: number
  units: number
  guestName: string
  guestEmail: string
  guestPhone: string
  specialRequests?: string
  couponCode?: string
  userId?: string | null
}

export type CreateBookingResult =
  | { ok: true; bookingId: string; reference: string; total: number; currency: string }
  | { ok: false; error: string; code: string }

export async function createBooking(input: CreateBookingInput): Promise<CreateBookingResult> {
  if (!pool) return { ok: false, error: 'Booking is temporarily unavailable.', code: 'no_db' }

  // Basic validation.
  const nights = nightsBetween(input.checkIn, input.checkOut)
  if (nights <= 0) return { ok: false, error: 'Check-out must be after check-in.', code: 'bad_dates' }

  const today = new Date().toISOString().slice(0, 10)
  if (input.checkIn < today) return { ok: false, error: 'Check-in cannot be in the past.', code: 'past_date' }

  const bookingSettings = await getBookingSettings()
  if (nights < bookingSettings.minNights)
    return { ok: false, error: `Minimum stay is ${bookingSettings.minNights} night(s).`, code: 'min_nights' }
  if (nights > bookingSettings.maxNights)
    return { ok: false, error: `Maximum stay is ${bookingSettings.maxNights} nights.`, code: 'max_nights' }

  const totalGuests = input.adults + input.children
  if (totalGuests < 1) return { ok: false, error: 'At least one guest is required.', code: 'no_guests' }
  const units = Math.max(1, input.units)

  const pricingSettings = await getPricingSettings()

  // Resolve coupon (server-side).
  let coupon: CouponInput = null
  if (input.couponCode?.trim()) {
    const row = await getActiveCoupon(input.couponCode.trim())
    if (!row) return { ok: false, error: 'Invalid or expired coupon.', code: 'bad_coupon' }
    const now = today
    if ((row.startsAt && now < row.startsAt) || (row.expiresAt && now > row.expiresAt))
      return { ok: false, error: 'This coupon is not currently active.', code: 'coupon_window' }
    if (row.maxRedemptions != null && row.timesRedeemed >= row.maxRedemptions)
      return { ok: false, error: 'This coupon has reached its redemption limit.', code: 'coupon_max' }
    coupon = {
      code: row.code,
      type: row.type as 'percent' | 'fixed',
      value: Number(row.value),
      minNights: row.minNights,
      minAmount: Number(row.minAmount),
    }
  }

  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const tx = drizzle(client, { schema: s })

    // Lock the room row to serialize concurrent bookings of the same type.
    const locked = await client.query('SELECT * FROM "rooms" WHERE "id" = $1 FOR UPDATE', [input.roomId])
    if (locked.rowCount === 0) {
      await client.query('ROLLBACK')
      return { ok: false, error: 'Room not found.', code: 'no_room' }
    }
    const room = locked.rows[0]
    if (!room.active) {
      await client.query('ROLLBACK')
      return { ok: false, error: 'This room is not available for booking.', code: 'inactive' }
    }
    if (totalGuests > room.max_guests * units) {
      await client.query('ROLLBACK')
      return {
        ok: false,
        error: `This room accommodates up to ${room.max_guests} guest(s) per unit.`,
        code: 'over_capacity',
      }
    }

    // Re-check availability under the lock (double-booking prevention).
    const free = await getAvailableUnits(input.roomId, input.checkIn, input.checkOut, { database: tx })
    if (free < units) {
      await client.query('ROLLBACK')
      return {
        ok: false,
        error: free <= 0 ? 'No rooms available for the selected dates.' : `Only ${free} room(s) left for these dates.`,
        code: 'sold_out',
      }
    }

    const roomRate = Number(room.price_per_night)
    const price = computePrice({
      roomRate,
      checkIn: input.checkIn,
      checkOut: input.checkOut,
      units,
      coupon,
      settings: pricingSettings,
    })
    if (coupon && price.couponError) {
      await client.query('ROLLBACK')
      return { ok: false, error: price.couponError, code: 'coupon_invalid' }
    }

    const bookingId = newId('bk')
    const reference = newBookingReference()

    await tx.insert(s.bookings).values({
      id: bookingId,
      reference,
      userId: input.userId ?? null,
      roomId: input.roomId,
      guestName: input.guestName,
      guestEmail: input.guestEmail,
      guestPhone: input.guestPhone,
      checkIn: input.checkIn,
      checkOut: input.checkOut,
      nights: price.nights,
      adults: input.adults,
      children: input.children,
      unitsBooked: units,
      roomRate: String(roomRate),
      subtotal: String(price.subtotal),
      discountAmount: String(price.discountAmount),
      taxAmount: String(price.taxAmount + price.serviceFeeAmount),
      total: String(price.total),
      currency: price.currency,
      couponCode: price.couponApplied,
      specialRequests: input.specialRequests ?? null,
      status: 'pending',
      paymentStatus: 'unpaid',
    })

    if (price.couponApplied) {
      await client.query('UPDATE "coupons" SET "times_redeemed" = "times_redeemed" + 1 WHERE "code" = $1', [
        price.couponApplied,
      ])
    }

    // Generate the invoice snapshot immediately.
    await tx.insert(s.invoices).values({
      id: newId('inv'),
      bookingId,
      number: newInvoiceNumber(),
      snapshot: {
        reference,
        room: room.name,
        roomRate,
        nights: price.nights,
        units,
        subtotal: price.subtotal,
        discount: price.discountAmount,
        tax: price.taxAmount,
        serviceFee: price.serviceFeeAmount,
        total: price.total,
        currency: price.currency,
        checkIn: input.checkIn,
        checkOut: input.checkOut,
        guest: { name: input.guestName, email: input.guestEmail, phone: input.guestPhone },
      },
    })

    await client.query('COMMIT')
    return { ok: true, bookingId, reference, total: price.total, currency: price.currency }
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {})
    console.error('[v0][bookings] createBooking failed:', error)
    return { ok: false, error: 'Could not complete the booking. Please try again.', code: 'server_error' }
  } finally {
    client.release()
  }
}

/* -------------------------------------------------------------------------- */
/* READS                                                                       */
/* -------------------------------------------------------------------------- */

export async function getBookingByReference(reference: string) {
  const [row] = await db.select().from(s.bookings).where(eq(s.bookings.reference, reference)).limit(1)
  return row ?? null
}

export async function getBookingById(id: string) {
  const [row] = await db.select().from(s.bookings).where(eq(s.bookings.id, id)).limit(1)
  return row ?? null
}

export async function getUserBookings(userId: string) {
  return db.select().from(s.bookings).where(eq(s.bookings.userId, userId)).orderBy(desc(s.bookings.createdAt))
}

export async function getBookingForUser(reference: string, userId: string) {
  const [row] = await db
    .select()
    .from(s.bookings)
    .where(and(eq(s.bookings.reference, reference), eq(s.bookings.userId, userId)))
    .limit(1)
  return row ?? null
}

export async function getInvoiceForBooking(bookingId: string) {
  const [row] = await db.select().from(s.invoices).where(eq(s.invoices.bookingId, bookingId)).limit(1)
  return row ?? null
}

/* -------------------------------------------------------------------------- */
/* CANCELLATION                                                                */
/* -------------------------------------------------------------------------- */

export function canCancel(
  booking: { status: string; checkIn: string },
  cancellationHours: number,
): { allowed: boolean; reason?: string } {
  if (booking.status === 'cancelled') return { allowed: false, reason: 'Booking is already cancelled.' }
  if (booking.status === 'completed') return { allowed: false, reason: 'Completed stays cannot be cancelled.' }
  const checkInTime = new Date(`${booking.checkIn}T00:00:00`).getTime()
  const cutoff = checkInTime - cancellationHours * 3600_000
  if (Date.now() > cutoff)
    return { allowed: false, reason: `Free cancellation window (${cancellationHours}h before check-in) has passed.` }
  return { allowed: true }
}

export async function cancelBooking(bookingId: string, reason: string): Promise<void> {
  await db
    .update(s.bookings)
    .set({
      status: 'cancelled',
      cancelledAt: new Date(),
      cancellationReason: reason,
      updatedAt: new Date(),
    })
    .where(eq(s.bookings.id, bookingId))
}
