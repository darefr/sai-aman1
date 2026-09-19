/**
 * ============================================================================
 * AVAILABILITY ENGINE
 * ============================================================================
 *
 * Availability for typed room inventory (each room type has N physical units).
 * A date range is available if, for EVERY night in [checkIn, checkOut), the
 * number of already-committed units (active bookings + admin blocks) leaves at
 * least the requested units free.
 *
 * This module provides read-only checks used by search and the booking form.
 * The atomic, race-safe reservation happens in lib/bookings.ts inside a
 * transaction that locks the room row before re-running this same logic.
 * ============================================================================
 */

import 'server-only'
import { and, eq, inArray, lt, gt } from 'drizzle-orm'
import type { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { db } from '@/lib/db'
import * as s from '@/lib/db/schema'
import type { BookingStatus } from '@/lib/db/schema'
import { nightsBetween } from '@/lib/pricing'

const ACTIVE_STATUSES: BookingStatus[] = ['pending', 'confirmed']

type DbLike = NodePgDatabase<typeof s> | typeof db

function eachNight(checkIn: string, checkOut: string): string[] {
  const nights: string[] = []
  const start = new Date(`${checkIn}T00:00:00Z`)
  const end = new Date(`${checkOut}T00:00:00Z`)
  for (let d = new Date(start); d < end; d.setUTCDate(d.getUTCDate() + 1)) {
    nights.push(d.toISOString().slice(0, 10))
  }
  return nights
}

/**
 * Minimum free units across all requested nights. Returns 0 for invalid ranges.
 * Optionally excludes a booking id (used when re-checking during an edit).
 */
export async function getAvailableUnits(
  roomId: string,
  checkIn: string,
  checkOut: string,
  options: { database?: DbLike; excludeBookingId?: string } = {},
): Promise<number> {
  const database = options.database ?? db
  const nights = nightsBetween(checkIn, checkOut)
  if (nights <= 0) return 0

  const [room] = await database.select().from(s.rooms).where(eq(s.rooms.id, roomId)).limit(1)
  if (!room || !room.active) return 0

  // Overlapping active bookings.
  const overlappingBookings = await database
    .select({
      checkIn: s.bookings.checkIn,
      checkOut: s.bookings.checkOut,
      units: s.bookings.unitsBooked,
      id: s.bookings.id,
    })
    .from(s.bookings)
    .where(
      and(
        eq(s.bookings.roomId, roomId),
        inArray(s.bookings.status, ACTIVE_STATUSES),
        lt(s.bookings.checkIn, checkOut),
        gt(s.bookings.checkOut, checkIn),
      ),
    )

  // Overlapping admin blocks (maintenance / manual holds).
  const overlappingBlocks = await database
    .select({
      startDate: s.roomBlocks.startDate,
      endDate: s.roomBlocks.endDate,
      units: s.roomBlocks.units,
    })
    .from(s.roomBlocks)
    .where(
      and(
        eq(s.roomBlocks.roomId, roomId),
        lt(s.roomBlocks.startDate, checkOut),
        gt(s.roomBlocks.endDate, checkIn),
      ),
    )

  const nightList = eachNight(checkIn, checkOut)
  let minFree = room.totalUnits

  for (const night of nightList) {
    let used = 0
    for (const b of overlappingBookings) {
      if (options.excludeBookingId && b.id === options.excludeBookingId) continue
      if (b.checkIn <= night && night < b.checkOut) used += b.units
    }
    for (const blk of overlappingBlocks) {
      if (blk.startDate <= night && night < blk.endDate) used += blk.units
    }
    const free = room.totalUnits - used
    if (free < minFree) minFree = free
  }

  return Math.max(0, minFree)
}

export type RoomAvailability = {
  roomId: string
  availableUnits: number
  available: boolean
}

/** Availability for many rooms at once (used by the search results grid). */
export async function getAvailabilityForRooms(
  roomIds: string[],
  checkIn: string,
  checkOut: string,
  requestedUnits = 1,
): Promise<RoomAvailability[]> {
  const results: RoomAvailability[] = []
  for (const roomId of roomIds) {
    const availableUnits = await getAvailableUnits(roomId, checkIn, checkOut)
    results.push({ roomId, availableUnits, available: availableUnits >= requestedUnits })
  }
  return results
}

export { eachNight }
