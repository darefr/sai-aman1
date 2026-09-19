'use server'

import { revalidatePath } from 'next/cache'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import * as s from '@/lib/db/schema'
import { newId } from '@/lib/ids'
import { requireAdmin } from '@/lib/session'
import { audit } from '@/lib/audit'
import { roomSchema, couponSchema } from '@/lib/validation'
import { getBookingById } from '@/lib/bookings'
import { getRoomById } from '@/lib/data'
import { notifyBookingStatus, notifyBookingCancelled } from '@/lib/notify'
import type { BookingStatus, PaymentStatus } from '@/lib/db/schema'

type ActionResult = { ok: boolean; error?: string; id?: string }

function slugify(input: string): string {
  return input.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

/* -------------------------------------------------------------------------- */
/* BOOKINGS                                                                    */
/* -------------------------------------------------------------------------- */

export async function updateBookingStatusAction(bookingId: string, status: BookingStatus): Promise<ActionResult> {
  const admin = await requireAdmin()
  await db
    .update(s.bookings)
    .set({
      status,
      ...(status === 'cancelled' ? { cancelledAt: new Date(), cancellationReason: 'Cancelled by hotel' } : {}),
      updatedAt: new Date(),
    })
    .where(eq(s.bookings.id, bookingId))

  const booking = await getBookingById(bookingId)
  if (booking) {
    const room = await getRoomById(booking.roomId)
    if (status === 'cancelled') await notifyBookingCancelled(booking, room?.name ?? 'Room')
    else await notifyBookingStatus(booking, room?.name ?? 'Room')
  }
  await audit({ actorId: admin.id, actorEmail: admin.email, action: 'booking.status', entity: 'booking', entityId: bookingId, meta: { status } })
  revalidatePath('/admin/bookings')
  revalidatePath(`/admin/bookings/${bookingId}`)
  return { ok: true }
}

export async function updatePaymentStatusAction(bookingId: string, paymentStatus: PaymentStatus): Promise<ActionResult> {
  const admin = await requireAdmin()
  await db.update(s.bookings).set({ paymentStatus, updatedAt: new Date() }).where(eq(s.bookings.id, bookingId))
  await audit({ actorId: admin.id, actorEmail: admin.email, action: 'payment.status', entity: 'booking', entityId: bookingId, meta: { paymentStatus } })
  revalidatePath('/admin/bookings')
  revalidatePath(`/admin/bookings/${bookingId}`)
  return { ok: true }
}

/* -------------------------------------------------------------------------- */
/* ROOMS                                                                       */
/* -------------------------------------------------------------------------- */

export async function saveRoomAction(raw: unknown, roomId?: string): Promise<ActionResult> {
  const admin = await requireAdmin()
  const parsed = roomSchema.safeParse(raw)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid room data.' }
  const d = parsed.data
  const slug = d.slug || slugify(d.name)

  const values = {
    slug,
    name: d.name,
    description: d.description,
    beds: d.beds,
    maxGuests: d.maxGuests,
    sizeSqm: d.sizeSqm,
    pricePerNight: String(d.pricePerNight),
    totalUnits: d.totalUnits,
    amenities: d.amenities,
    featured: d.featured,
    active: d.active,
    sortOrder: d.sortOrder,
    updatedAt: new Date(),
  }

  if (roomId) {
    await db.update(s.rooms).set(values).where(eq(s.rooms.id, roomId))
    await audit({ actorId: admin.id, actorEmail: admin.email, action: 'room.update', entity: 'room', entityId: roomId })
    revalidatePath('/admin/rooms')
    return { ok: true, id: roomId }
  }

  const id = newId('room')
  await db.insert(s.rooms).values({ id, ...values })
  await audit({ actorId: admin.id, actorEmail: admin.email, action: 'room.create', entity: 'room', entityId: id })
  revalidatePath('/admin/rooms')
  revalidatePath('/')
  return { ok: true, id }
}

export async function updateRoomImagesAction(
  roomId: string,
  gallery: { src: string; alt: string }[],
): Promise<ActionResult> {
  await requireAdmin()
  await db.update(s.rooms).set({ gallery, updatedAt: new Date() }).where(eq(s.rooms.id, roomId))
  revalidatePath('/admin/rooms')
  return { ok: true }
}

export async function deleteRoomAction(roomId: string): Promise<ActionResult> {
  const admin = await requireAdmin()
  // Soft-guard: don't hard-delete rooms with bookings; deactivate instead.
  const [existing] = await db.select().from(s.bookings).where(eq(s.bookings.roomId, roomId)).limit(1)
  if (existing) {
    await db.update(s.rooms).set({ active: false, updatedAt: new Date() }).where(eq(s.rooms.id, roomId))
    await audit({ actorId: admin.id, actorEmail: admin.email, action: 'room.deactivate', entity: 'room', entityId: roomId })
    revalidatePath('/admin/rooms')
    return { ok: true, error: 'Room has bookings; it was deactivated instead of deleted.' }
  }
  await db.delete(s.rooms).where(eq(s.rooms.id, roomId))
  await audit({ actorId: admin.id, actorEmail: admin.email, action: 'room.delete', entity: 'room', entityId: roomId })
  revalidatePath('/admin/rooms')
  return { ok: true }
}

/* -------------------------------------------------------------------------- */
/* ROOM BLOCKS                                                                 */
/* -------------------------------------------------------------------------- */

export async function createRoomBlockAction(input: {
  roomId: string
  startDate: string
  endDate: string
  units: number
  reason: string
  note?: string
}): Promise<ActionResult> {
  const admin = await requireAdmin()
  if (input.endDate <= input.startDate) return { ok: false, error: 'End date must be after start date.' }
  const id = newId('blk')
  await db.insert(s.roomBlocks).values({
    id,
    roomId: input.roomId,
    startDate: input.startDate,
    endDate: input.endDate,
    units: Math.max(1, input.units),
    reason: input.reason,
    note: input.note ?? null,
    createdBy: admin.id,
  })
  await audit({ actorId: admin.id, actorEmail: admin.email, action: 'roomblock.create', entity: 'room', entityId: input.roomId })
  revalidatePath('/admin/rooms')
  return { ok: true, id }
}

export async function deleteRoomBlockAction(blockId: string): Promise<ActionResult> {
  await requireAdmin()
  await db.delete(s.roomBlocks).where(eq(s.roomBlocks.id, blockId))
  revalidatePath('/admin/rooms')
  return { ok: true }
}

/* -------------------------------------------------------------------------- */
/* COUPONS                                                                     */
/* -------------------------------------------------------------------------- */

export async function saveCouponAction(raw: unknown, couponId?: string): Promise<ActionResult> {
  const admin = await requireAdmin()
  const parsed = couponSchema.safeParse(raw)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid coupon.' }
  const d = parsed.data
  const values = {
    code: d.code.toUpperCase(),
    description: d.description || null,
    type: d.type,
    value: String(d.value),
    minNights: d.minNights,
    minAmount: String(d.minAmount),
    maxRedemptions: d.maxRedemptions ?? null,
    active: d.active,
  }
  if (couponId) {
    await db.update(s.coupons).set(values).where(eq(s.coupons.id, couponId))
  } else {
    await db.insert(s.coupons).values({ id: newId('cpn'), ...values })
  }
  await audit({ actorId: admin.id, actorEmail: admin.email, action: couponId ? 'coupon.update' : 'coupon.create', entity: 'coupon', entityId: couponId })
  revalidatePath('/admin/coupons')
  return { ok: true }
}

export async function deleteCouponAction(couponId: string): Promise<ActionResult> {
  await requireAdmin()
  await db.delete(s.coupons).where(eq(s.coupons.id, couponId))
  revalidatePath('/admin/coupons')
  return { ok: true }
}

/* -------------------------------------------------------------------------- */
/* OFFERS                                                                      */
/* -------------------------------------------------------------------------- */

export async function saveOfferAction(input: {
  id?: string
  title: string
  description: string
  badge?: string
  couponCode?: string
  ctaLabel?: string
  active: boolean
  sortOrder: number
}): Promise<ActionResult> {
  await requireAdmin()
  if (!input.title.trim() || !input.description.trim()) return { ok: false, error: 'Title and description are required.' }
  const values = {
    title: input.title,
    description: input.description,
    badge: input.badge || null,
    couponCode: input.couponCode || null,
    ctaLabel: input.ctaLabel || null,
    active: input.active,
    sortOrder: input.sortOrder,
  }
  if (input.id) await db.update(s.offers).set(values).where(eq(s.offers.id, input.id))
  else await db.insert(s.offers).values({ id: newId('ofr'), ...values })
  revalidatePath('/admin/offers')
  revalidatePath('/')
  return { ok: true }
}

export async function deleteOfferAction(id: string): Promise<ActionResult> {
  await requireAdmin()
  await db.delete(s.offers).where(eq(s.offers.id, id))
  revalidatePath('/admin/offers')
  return { ok: true }
}

/* -------------------------------------------------------------------------- */
/* REVIEWS                                                                     */
/* -------------------------------------------------------------------------- */

export async function setReviewApprovedAction(id: string, approved: boolean): Promise<ActionResult> {
  await requireAdmin()
  await db.update(s.reviews).set({ approved }).where(eq(s.reviews.id, id))
  revalidatePath('/admin/reviews')
  revalidatePath('/')
  return { ok: true }
}

export async function deleteReviewAction(id: string): Promise<ActionResult> {
  await requireAdmin()
  await db.delete(s.reviews).where(eq(s.reviews.id, id))
  revalidatePath('/admin/reviews')
  return { ok: true }
}

export async function createReviewAction(input: {
  author: string
  country?: string
  rating: number
  quote: string
  stayType?: string
  approved: boolean
}): Promise<ActionResult> {
  await requireAdmin()
  if (!input.author.trim() || !input.quote.trim()) return { ok: false, error: 'Author and quote are required.' }
  await db.insert(s.reviews).values({
    id: newId('rev'),
    author: input.author,
    country: input.country || null,
    rating: Math.min(10, Math.max(1, input.rating)),
    quote: input.quote,
    stayType: input.stayType || null,
    approved: input.approved,
  })
  revalidatePath('/admin/reviews')
  return { ok: true }
}

/* -------------------------------------------------------------------------- */
/* GALLERY                                                                     */
/* -------------------------------------------------------------------------- */

export async function saveGalleryItemAction(input: {
  id?: string
  src: string
  alt: string
  category: string
  sortOrder: number
  active: boolean
}): Promise<ActionResult> {
  await requireAdmin()
  if (!input.src.trim()) return { ok: false, error: 'Image URL is required.' }
  const values = {
    src: input.src,
    alt: input.alt || 'Hotel Sai Aman',
    category: input.category || 'general',
    sortOrder: input.sortOrder,
    active: input.active,
  }
  if (input.id) await db.update(s.gallery).set(values).where(eq(s.gallery.id, input.id))
  else await db.insert(s.gallery).values({ id: newId('gal'), ...values })
  revalidatePath('/admin/gallery')
  revalidatePath('/')
  return { ok: true }
}

export async function deleteGalleryItemAction(id: string): Promise<ActionResult> {
  await requireAdmin()
  await db.delete(s.gallery).where(eq(s.gallery.id, id))
  revalidatePath('/admin/gallery')
  return { ok: true }
}

/* -------------------------------------------------------------------------- */
/* FAQS                                                                        */
/* -------------------------------------------------------------------------- */

export async function saveFaqAction(input: {
  id?: string
  question: string
  answer: string
  sortOrder: number
  active: boolean
}): Promise<ActionResult> {
  await requireAdmin()
  if (!input.question.trim() || !input.answer.trim()) return { ok: false, error: 'Question and answer are required.' }
  const values = { question: input.question, answer: input.answer, sortOrder: input.sortOrder, active: input.active }
  if (input.id) await db.update(s.faqs).set(values).where(eq(s.faqs.id, input.id))
  else await db.insert(s.faqs).values({ id: newId('faq'), ...values })
  revalidatePath('/admin/faqs')
  revalidatePath('/')
  return { ok: true }
}

export async function deleteFaqAction(id: string): Promise<ActionResult> {
  await requireAdmin()
  await db.delete(s.faqs).where(eq(s.faqs.id, id))
  revalidatePath('/admin/faqs')
  return { ok: true }
}

/* -------------------------------------------------------------------------- */
/* CUSTOMERS                                                                   */
/* -------------------------------------------------------------------------- */

export async function setUserRoleAction(userId: string, role: 'customer' | 'staff' | 'admin'): Promise<ActionResult> {
  const admin = await requireAdmin()
  if (admin.role !== 'admin') return { ok: false, error: 'Only admins can change roles.' }
  await db.update(s.user).set({ role, updatedAt: new Date() }).where(eq(s.user.id, userId))
  await audit({ actorId: admin.id, actorEmail: admin.email, action: 'user.role', entity: 'user', entityId: userId, meta: { role } })
  revalidatePath('/admin/customers')
  return { ok: true }
}

export async function setUserBannedAction(userId: string, banned: boolean): Promise<ActionResult> {
  const admin = await requireAdmin()
  if (admin.role !== 'admin') return { ok: false, error: 'Only admins can ban users.' }
  await db.update(s.user).set({ banned, updatedAt: new Date() }).where(eq(s.user.id, userId))
  await audit({ actorId: admin.id, actorEmail: admin.email, action: 'user.ban', entity: 'user', entityId: userId, meta: { banned } })
  revalidatePath('/admin/customers')
  return { ok: true }
}

/* -------------------------------------------------------------------------- */
/* CMS CONTENT + SETTINGS                                                      */
/* -------------------------------------------------------------------------- */

export async function saveContentAction(key: string, value: Record<string, unknown>): Promise<ActionResult> {
  const admin = await requireAdmin()
  const [existing] = await db.select().from(s.cmsContent).where(eq(s.cmsContent.key, key)).limit(1)
  if (existing) {
    await db.update(s.cmsContent).set({ value, updatedAt: new Date() }).where(eq(s.cmsContent.key, key))
  } else {
    await db.insert(s.cmsContent).values({ key, value })
  }
  await audit({ actorId: admin.id, actorEmail: admin.email, action: 'content.update', entity: 'cms', entityId: key })
  revalidatePath('/')
  revalidatePath('/admin/content')
  return { ok: true }
}

export async function saveSettingAction(key: string, value: Record<string, unknown>): Promise<ActionResult> {
  const admin = await requireAdmin()
  const [existing] = await db.select().from(s.settings).where(eq(s.settings.key, key)).limit(1)
  if (existing) {
    await db.update(s.settings).set({ value, updatedAt: new Date() }).where(eq(s.settings.key, key))
  } else {
    await db.insert(s.settings).values({ key, value })
  }
  await audit({ actorId: admin.id, actorEmail: admin.email, action: 'setting.update', entity: 'setting', entityId: key })
  revalidatePath('/')
  revalidatePath('/admin/settings')
  return { ok: true }
}
