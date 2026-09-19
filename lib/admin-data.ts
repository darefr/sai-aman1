import 'server-only'
import { and, desc, eq, gte, ilike, or, sql, count } from 'drizzle-orm'
import { db } from '@/lib/db'
import * as s from '@/lib/db/schema'
import type { BookingStatus, PaymentStatus } from '@/lib/db/schema'

export async function getDashboardStats() {
  const today = new Date().toISOString().slice(0, 10)
  const monthStart = `${today.slice(0, 7)}-01`

  const [totals] = await db
    .select({
      totalBookings: count(),
      revenue: sql<string>`coalesce(sum(case when ${s.bookings.paymentStatus} = 'paid' then ${s.bookings.total} else 0 end), 0)`,
    })
    .from(s.bookings)

  const [pending] = await db
    .select({ c: count() })
    .from(s.bookings)
    .where(eq(s.bookings.status, 'pending'))

  const [monthly] = await db
    .select({
      revenue: sql<string>`coalesce(sum(case when ${s.bookings.paymentStatus} = 'paid' then ${s.bookings.total} else 0 end), 0)`,
      bookings: count(),
    })
    .from(s.bookings)
    .where(gte(s.bookings.createdAt, new Date(monthStart)))

  const [upcoming] = await db
    .select({ c: count() })
    .from(s.bookings)
    .where(and(gte(s.bookings.checkIn, today), eq(s.bookings.status, 'confirmed')))

  const [customers] = await db.select({ c: count() }).from(s.user).where(eq(s.user.role, 'customer'))
  const [roomsCount] = await db.select({ c: count() }).from(s.rooms).where(eq(s.rooms.active, true))

  return {
    totalBookings: Number(totals?.totalBookings ?? 0),
    totalRevenue: Number(totals?.revenue ?? 0),
    pendingBookings: Number(pending?.c ?? 0),
    monthlyRevenue: Number(monthly?.revenue ?? 0),
    monthlyBookings: Number(monthly?.bookings ?? 0),
    upcomingStays: Number(upcoming?.c ?? 0),
    customers: Number(customers?.c ?? 0),
    activeRooms: Number(roomsCount?.c ?? 0),
  }
}

export async function getRecentBookings(limit = 6) {
  return db.select().from(s.bookings).orderBy(desc(s.bookings.createdAt)).limit(limit)
}

export async function searchBookings(filters: {
  q?: string
  status?: BookingStatus | 'all'
  paymentStatus?: PaymentStatus | 'all'
}) {
  const conditions = []
  if (filters.q) {
    conditions.push(
      or(
        ilike(s.bookings.reference, `%${filters.q}%`),
        ilike(s.bookings.guestName, `%${filters.q}%`),
        ilike(s.bookings.guestEmail, `%${filters.q}%`),
      ),
    )
  }
  if (filters.status && filters.status !== 'all') conditions.push(eq(s.bookings.status, filters.status))
  if (filters.paymentStatus && filters.paymentStatus !== 'all')
    conditions.push(eq(s.bookings.paymentStatus, filters.paymentStatus))

  const where = conditions.length ? and(...conditions) : undefined
  return db.select().from(s.bookings).where(where).orderBy(desc(s.bookings.createdAt)).limit(200)
}

export async function getCustomers() {
  const rows = await db
    .select({
      id: s.user.id,
      name: s.user.name,
      email: s.user.email,
      role: s.user.role,
      banned: s.user.banned,
      emailVerified: s.user.emailVerified,
      createdAt: s.user.createdAt,
      bookingCount: sql<number>`(select count(*) from ${s.bookings} where ${s.bookings.userId} = ${s.user.id})`,
    })
    .from(s.user)
    .orderBy(desc(s.user.createdAt))
    .limit(500)
  return rows
}

export async function getAllCoupons() {
  return db.select().from(s.coupons).orderBy(desc(s.coupons.createdAt))
}

export async function getAllOffers() {
  return db.select().from(s.offers).orderBy(s.offers.sortOrder)
}

export async function getAllReviews() {
  return db.select().from(s.reviews).orderBy(desc(s.reviews.createdAt))
}

export async function getAllGallery() {
  return db.select().from(s.gallery).orderBy(s.gallery.sortOrder)
}

export async function getAllFaqs() {
  return db.select().from(s.faqs).orderBy(s.faqs.sortOrder)
}

export async function getRoomBlocks(roomId: string) {
  return db.select().from(s.roomBlocks).where(eq(s.roomBlocks.roomId, roomId)).orderBy(s.roomBlocks.startDate)
}

export async function getAuditLog(limit = 50) {
  return db.select().from(s.auditLog).orderBy(desc(s.auditLog.createdAt)).limit(limit)
}
