/**
 * ============================================================================
 * DATA ACCESS LAYER
 * ============================================================================
 *
 * Read helpers for rooms, settings and CMS content. Every function degrades
 * gracefully: if the database is not configured (or a query fails) it returns
 * the original static content from lib/content.ts so the public site keeps
 * rendering exactly as before.
 * ============================================================================
 */

import 'server-only'
import { eq, asc, and } from 'drizzle-orm'
import { db } from '@/lib/db'
import * as s from '@/lib/db/schema'
import { isDatabaseConfigured } from '@/lib/env'
import { DEFAULT_PRICING, type PricingSettings } from '@/lib/pricing'
import { rooms as staticRooms } from '@/lib/content'

export type PublicRoom = {
  id: string
  slug: string
  name: string
  description: string
  beds: string
  maxGuests: number
  sizeSqm: number
  pricePerNight: number
  currency: string
  totalUnits: number
  amenities: string[]
  gallery: { src: string; alt: string }[]
  virtualTourUrl: string | null
  featured: boolean
}

function staticRoomsAsPublic(): PublicRoom[] {
  return staticRooms.map((r) => ({
    id: r.id,
    slug: r.id,
    name: r.fallbackName,
    description: r.fallbackDescription,
    beds: r.beds,
    maxGuests: r.maxGuests,
    sizeSqm: r.sizeSqm,
    pricePerNight: r.pricePerNight.amount,
    currency: r.pricePerNight.currency,
    totalUnits: r.availableRooms,
    amenities: r.amenities,
    gallery: r.gallery.map((g) => ({ src: g.src, alt: g.fallbackAlt })),
    virtualTourUrl: r.virtualTourUrl,
    featured: Boolean(r.featured),
  }))
}

export async function getRooms(): Promise<PublicRoom[]> {
  if (!isDatabaseConfigured()) return staticRoomsAsPublic()
  try {
    const rows = await db.select().from(s.rooms).where(eq(s.rooms.active, true)).orderBy(asc(s.rooms.sortOrder))
    if (rows.length === 0) return staticRoomsAsPublic()
    return rows.map(rowToPublicRoom)
  } catch (error) {
    console.error('[v0][data] getRooms failed, using static content:', error)
    return staticRoomsAsPublic()
  }
}

export async function getAllRoomsAdmin(): Promise<s.RoomRow[]> {
  const rows = await db.select().from(s.rooms).orderBy(asc(s.rooms.sortOrder))
  return rows
}

export async function getRoomBySlug(slug: string): Promise<PublicRoom | null> {
  if (!isDatabaseConfigured()) {
    return staticRoomsAsPublic().find((r) => r.slug === slug) ?? null
  }
  try {
    const [row] = await db.select().from(s.rooms).where(eq(s.rooms.slug, slug)).limit(1)
    return row ? rowToPublicRoom(row) : null
  } catch {
    return staticRoomsAsPublic().find((r) => r.slug === slug) ?? null
  }
}

export async function getRoomById(id: string): Promise<s.RoomRow | null> {
  const [row] = await db.select().from(s.rooms).where(eq(s.rooms.id, id)).limit(1)
  return row ?? null
}

function rowToPublicRoom(r: s.RoomRow): PublicRoom {
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    description: r.description,
    beds: r.beds,
    maxGuests: r.maxGuests,
    sizeSqm: r.sizeSqm,
    pricePerNight: Number(r.pricePerNight),
    currency: r.currency,
    totalUnits: r.totalUnits,
    amenities: r.amenities ?? [],
    gallery: r.gallery ?? [],
    virtualTourUrl: r.virtualTourUrl,
    featured: r.featured,
  }
}

/* -------------------------------------------------------------------------- */
/* SETTINGS                                                                    */
/* -------------------------------------------------------------------------- */

export async function getPricingSettings(): Promise<PricingSettings> {
  if (!isDatabaseConfigured()) return DEFAULT_PRICING
  try {
    const [row] = await db.select().from(s.settings).where(eq(s.settings.key, 'pricing')).limit(1)
    if (!row) return DEFAULT_PRICING
    return { ...DEFAULT_PRICING, ...(row.value as Partial<PricingSettings>) }
  } catch {
    return DEFAULT_PRICING
  }
}

export type BookingSettings = {
  minNights: number
  maxNights: number
  maxGuestsPerBooking: number
  checkInTime: string
  checkOutTime: string
  cancellationHours: number
  allowGuestCheckout: boolean
}

export const DEFAULT_BOOKING_SETTINGS: BookingSettings = {
  minNights: 1,
  maxNights: 30,
  maxGuestsPerBooking: 6,
  checkInTime: '14:00',
  checkOutTime: '12:00',
  cancellationHours: 24,
  allowGuestCheckout: true,
}

export async function getBookingSettings(): Promise<BookingSettings> {
  if (!isDatabaseConfigured()) return DEFAULT_BOOKING_SETTINGS
  try {
    const [row] = await db.select().from(s.settings).where(eq(s.settings.key, 'booking')).limit(1)
    if (!row) return DEFAULT_BOOKING_SETTINGS
    return { ...DEFAULT_BOOKING_SETTINGS, ...(row.value as Partial<BookingSettings>) }
  } catch {
    return DEFAULT_BOOKING_SETTINGS
  }
}

export async function getSetting<T = Record<string, unknown>>(key: string): Promise<T | null> {
  if (!isDatabaseConfigured()) return null
  try {
    const [row] = await db.select().from(s.settings).where(eq(s.settings.key, key)).limit(1)
    return (row?.value as T) ?? null
  } catch {
    return null
  }
}

/* -------------------------------------------------------------------------- */
/* CMS CONTENT                                                                 */
/* -------------------------------------------------------------------------- */

export async function getContent<T = Record<string, unknown>>(key: string, fallback: T): Promise<T> {
  if (!isDatabaseConfigured()) return fallback
  try {
    const [row] = await db.select().from(s.cmsContent).where(eq(s.cmsContent.key, key)).limit(1)
    return (row?.value as T) ?? fallback
  } catch {
    return fallback
  }
}

export async function getAllContent(): Promise<Record<string, unknown>> {
  if (!isDatabaseConfigured()) return {}
  try {
    const rows = await db.select().from(s.cmsContent)
    return Object.fromEntries(rows.map((r) => [r.key, r.value]))
  } catch {
    return {}
  }
}

/* -------------------------------------------------------------------------- */
/* PUBLIC COLLECTIONS (offers, reviews, gallery, faqs)                         */
/* -------------------------------------------------------------------------- */

export async function getActiveOffers(): Promise<s.OfferRow[]> {
  if (!isDatabaseConfigured()) return []
  try {
    return await db.select().from(s.offers).where(eq(s.offers.active, true)).orderBy(asc(s.offers.sortOrder))
  } catch {
    return []
  }
}

export async function getApprovedReviews(): Promise<s.ReviewRow[]> {
  if (!isDatabaseConfigured()) return []
  try {
    return await db.select().from(s.reviews).where(eq(s.reviews.approved, true)).orderBy(asc(s.reviews.createdAt))
  } catch {
    return []
  }
}

export async function getActiveFaqs(): Promise<s.FaqRow[]> {
  if (!isDatabaseConfigured()) return []
  try {
    return await db.select().from(s.faqs).where(eq(s.faqs.active, true)).orderBy(asc(s.faqs.sortOrder))
  } catch {
    return []
  }
}

export async function getActiveGallery(): Promise<s.GalleryRow[]> {
  if (!isDatabaseConfigured()) return []
  try {
    return await db
      .select()
      .from(s.gallery)
      .where(eq(s.gallery.active, true))
      .orderBy(asc(s.gallery.sortOrder))
  } catch {
    return []
  }
}

export async function getActiveCoupon(code: string): Promise<s.CouponRow | null> {
  if (!isDatabaseConfigured()) return null
  try {
    const [row] = await db
      .select()
      .from(s.coupons)
      .where(and(eq(s.coupons.code, code.toUpperCase()), eq(s.coupons.active, true)))
      .limit(1)
    return row ?? null
  } catch {
    return null
  }
}
