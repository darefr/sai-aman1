/**
 * ============================================================================
 * DATABASE SCHEMA (Drizzle ORM · PostgreSQL)
 * ============================================================================
 *
 * The relational model for the Hotel Sai Aman booking platform.
 *
 * Auth tables (`user`, `session`, `account`, `verification`) follow the exact
 * shape Better Auth expects. All other tables are application-owned.
 *
 * Column names for the Better Auth tables intentionally use camelCase quoted
 * identifiers to match Better Auth's default schema.
 * ============================================================================
 */

import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  numeric,
  jsonb,
  date,
  uniqueIndex,
  index,
  primaryKey,
} from 'drizzle-orm/pg-core'

/* -------------------------------------------------------------------------- */
/* BETTER AUTH CORE TABLES                                                     */
/* -------------------------------------------------------------------------- */

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified')
    .$defaultFn(() => false)
    .notNull(),
  image: text('image'),
  // Application role: 'customer' | 'admin' | 'staff'
  role: text('role').default('customer').notNull(),
  banned: boolean('banned').default(false),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
})

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expiresAt').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
})

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  accessTokenExpiresAt: timestamp('accessTokenExpiresAt'),
  refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
})

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
})

/* -------------------------------------------------------------------------- */
/* CUSTOMER PROFILES                                                          */
/* -------------------------------------------------------------------------- */

export const customerProfiles = pgTable('customer_profiles', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: 'cascade' }),
  phone: text('phone'),
  address: text('address'),
  city: text('city'),
  country: text('country'),
  postalCode: text('postal_code'),
  nationality: text('nationality'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

/* -------------------------------------------------------------------------- */
/* ROOMS                                                                      */
/* -------------------------------------------------------------------------- */

export const rooms = pgTable(
  'rooms',
  {
    id: text('id').primaryKey(),
    slug: text('slug').notNull().unique(),
    name: text('name').notNull(),
    description: text('description').notNull(),
    beds: text('beds').notNull(),
    maxGuests: integer('max_guests').notNull().default(2),
    sizeSqm: integer('size_sqm').notNull().default(20),
    // Price in NPR major units.
    pricePerNight: numeric('price_per_night', { precision: 10, scale: 2 }).notNull(),
    currency: text('currency').notNull().default('NPR'),
    // Total physical rooms of this type in inventory.
    totalUnits: integer('total_units').notNull().default(1),
    amenities: jsonb('amenities').$type<string[]>().notNull().default([]),
    gallery: jsonb('gallery').$type<{ src: string; alt: string }[]>().notNull().default([]),
    virtualTourUrl: text('virtual_tour_url'),
    featured: boolean('featured').default(false).notNull(),
    active: boolean('active').default(true).notNull(),
    sortOrder: integer('sort_order').default(0).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => ({
    slugIdx: index('rooms_slug_idx').on(t.slug),
    activeIdx: index('rooms_active_idx').on(t.active),
  }),
)

/**
 * Blocked dates / manual holds / maintenance for a specific room type.
 * Each row reduces available inventory for the [startDate, endDate) range.
 */
export const roomBlocks = pgTable(
  'room_blocks',
  {
    id: text('id').primaryKey(),
    roomId: text('room_id')
      .notNull()
      .references(() => rooms.id, { onDelete: 'cascade' }),
    startDate: date('start_date').notNull(),
    endDate: date('end_date').notNull(),
    // How many units this block removes from inventory.
    units: integer('units').notNull().default(1),
    reason: text('reason').notNull().default('maintenance'),
    note: text('note'),
    createdBy: text('created_by').references(() => user.id, { onDelete: 'set null' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => ({
    roomIdx: index('room_blocks_room_idx').on(t.roomId),
    dateIdx: index('room_blocks_date_idx').on(t.startDate, t.endDate),
  }),
)

/* -------------------------------------------------------------------------- */
/* BOOKINGS                                                                    */
/* -------------------------------------------------------------------------- */

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed'
export type PaymentStatus = 'unpaid' | 'pending' | 'paid' | 'failed' | 'refunded'

export const bookings = pgTable(
  'bookings',
  {
    id: text('id').primaryKey(),
    reference: text('reference').notNull().unique(),
    userId: text('user_id').references(() => user.id, { onDelete: 'set null' }),
    roomId: text('room_id')
      .notNull()
      .references(() => rooms.id, { onDelete: 'restrict' }),

    // Guest snapshot (kept even if the account is deleted).
    guestName: text('guest_name').notNull(),
    guestEmail: text('guest_email').notNull(),
    guestPhone: text('guest_phone').notNull(),

    checkIn: date('check_in').notNull(),
    checkOut: date('check_out').notNull(),
    nights: integer('nights').notNull(),
    adults: integer('adults').notNull().default(1),
    children: integer('children').notNull().default(0),
    unitsBooked: integer('units_booked').notNull().default(1),

    // Money snapshot (NPR major units).
    roomRate: numeric('room_rate', { precision: 10, scale: 2 }).notNull(),
    subtotal: numeric('subtotal', { precision: 10, scale: 2 }).notNull(),
    discountAmount: numeric('discount_amount', { precision: 10, scale: 2 }).notNull().default('0'),
    taxAmount: numeric('tax_amount', { precision: 10, scale: 2 }).notNull().default('0'),
    total: numeric('total', { precision: 10, scale: 2 }).notNull(),
    currency: text('currency').notNull().default('NPR'),

    couponCode: text('coupon_code'),
    specialRequests: text('special_requests'),

    status: text('status').$type<BookingStatus>().notNull().default('pending'),
    paymentStatus: text('payment_status').$type<PaymentStatus>().notNull().default('unpaid'),

    cancelledAt: timestamp('cancelled_at'),
    cancellationReason: text('cancellation_reason'),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => ({
    refIdx: uniqueIndex('bookings_reference_idx').on(t.reference),
    userIdx: index('bookings_user_idx').on(t.userId),
    roomIdx: index('bookings_room_idx').on(t.roomId),
    dateIdx: index('bookings_date_idx').on(t.checkIn, t.checkOut),
    statusIdx: index('bookings_status_idx').on(t.status),
  }),
)

export const bookingGuests = pgTable('booking_guests', {
  id: text('id').primaryKey(),
  bookingId: text('booking_id')
    .notNull()
    .references(() => bookings.id, { onDelete: 'cascade' }),
  fullName: text('full_name').notNull(),
  isChild: boolean('is_child').default(false).notNull(),
  age: integer('age'),
})

/* -------------------------------------------------------------------------- */
/* PAYMENTS + INVOICES                                                         */
/* -------------------------------------------------------------------------- */

export const payments = pgTable(
  'payments',
  {
    id: text('id').primaryKey(),
    bookingId: text('booking_id')
      .notNull()
      .references(() => bookings.id, { onDelete: 'cascade' }),
    // 'esewa' | 'khalti' | 'fonepay' | 'mock'
    provider: text('provider').notNull(),
    // Amount charged (NPR major units).
    amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
    currency: text('currency').notNull().default('NPR'),
    // 'initiated' | 'pending' | 'paid' | 'failed' | 'refunded'
    status: text('status').notNull().default('initiated'),
    // Our internal transaction reference sent to the gateway.
    transactionRef: text('transaction_ref').notNull().unique(),
    // Provider's returned identifier after verification.
    providerRef: text('provider_ref'),
    // Non-sensitive gateway metadata only. NEVER store card/CVV/OTP data.
    meta: jsonb('meta').$type<Record<string, unknown>>().default({}),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => ({
    bookingIdx: index('payments_booking_idx').on(t.bookingId),
    txnIdx: uniqueIndex('payments_txn_idx').on(t.transactionRef),
  }),
)

export const invoices = pgTable('invoices', {
  id: text('id').primaryKey(),
  bookingId: text('booking_id')
    .notNull()
    .references(() => bookings.id, { onDelete: 'cascade' }),
  number: text('number').notNull().unique(),
  issuedAt: timestamp('issued_at').defaultNow().notNull(),
  // Full serialized snapshot of line items for a stable historical record.
  snapshot: jsonb('snapshot').$type<Record<string, unknown>>().notNull(),
})

/* -------------------------------------------------------------------------- */
/* COUPONS / OFFERS                                                            */
/* -------------------------------------------------------------------------- */

export const coupons = pgTable(
  'coupons',
  {
    id: text('id').primaryKey(),
    code: text('code').notNull().unique(),
    description: text('description'),
    // 'percent' | 'fixed'
    type: text('type').notNull().default('percent'),
    value: numeric('value', { precision: 10, scale: 2 }).notNull(),
    minNights: integer('min_nights').default(1).notNull(),
    minAmount: numeric('min_amount', { precision: 10, scale: 2 }).default('0').notNull(),
    maxRedemptions: integer('max_redemptions'),
    timesRedeemed: integer('times_redeemed').default(0).notNull(),
    startsAt: date('starts_at'),
    expiresAt: date('expires_at'),
    active: boolean('active').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => ({
    codeIdx: uniqueIndex('coupons_code_idx').on(t.code),
  }),
)

export const offers = pgTable('offers', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  badge: text('badge'),
  image: text('image'),
  couponCode: text('coupon_code'),
  ctaLabel: text('cta_label'),
  active: boolean('active').default(true).notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

/* -------------------------------------------------------------------------- */
/* REVIEWS / TESTIMONIALS                                                      */
/* -------------------------------------------------------------------------- */

export const reviews = pgTable('reviews', {
  id: text('id').primaryKey(),
  author: text('author').notNull(),
  country: text('country'),
  rating: integer('rating').notNull().default(5),
  quote: text('quote').notNull(),
  stayType: text('stay_type'),
  // Moderation: pending reviews are hidden until approved.
  approved: boolean('approved').default(false).notNull(),
  featured: boolean('featured').default(false).notNull(),
  userId: text('user_id').references(() => user.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

/* -------------------------------------------------------------------------- */
/* GALLERY                                                                     */
/* -------------------------------------------------------------------------- */

export const gallery = pgTable('gallery', {
  id: text('id').primaryKey(),
  src: text('src').notNull(),
  alt: text('alt').notNull(),
  category: text('category').default('general').notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
  active: boolean('active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

/* -------------------------------------------------------------------------- */
/* FAQ                                                                         */
/* -------------------------------------------------------------------------- */

export const faqs = pgTable('faqs', {
  id: text('id').primaryKey(),
  question: text('question').notNull(),
  answer: text('answer').notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
  active: boolean('active').default(true).notNull(),
})

/* -------------------------------------------------------------------------- */
/* CMS CONTENT (key/value JSON blocks) + SETTINGS                              */
/* -------------------------------------------------------------------------- */

/**
 * Flexible content store. Each row is one editable content block keyed by a
 * stable string (e.g. 'hero', 'about', 'footer', 'contact', 'policies').
 */
export const cmsContent = pgTable('cms_content', {
  key: text('key').primaryKey(),
  value: jsonb('value').$type<Record<string, unknown>>().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

/**
 * Global hotel settings: taxes, fees, booking rules, currency.
 */
export const settings = pgTable('settings', {
  key: text('key').primaryKey(),
  value: jsonb('value').$type<Record<string, unknown>>().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

/* -------------------------------------------------------------------------- */
/* NOTIFICATIONS + AUDIT LOG                                                   */
/* -------------------------------------------------------------------------- */

export const notifications = pgTable('notifications', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => user.id, { onDelete: 'cascade' }),
  // 'booking' | 'payment' | 'system' | 'admin'
  type: text('type').notNull().default('system'),
  title: text('title').notNull(),
  body: text('body').notNull(),
  read: boolean('read').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const auditLog = pgTable('audit_log', {
  id: text('id').primaryKey(),
  actorId: text('actor_id').references(() => user.id, { onDelete: 'set null' }),
  actorEmail: text('actor_email'),
  action: text('action').notNull(),
  entity: text('entity'),
  entityId: text('entity_id'),
  meta: jsonb('meta').$type<Record<string, unknown>>().default({}),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

/* -------------------------------------------------------------------------- */
/* TYPE EXPORTS                                                                */
/* -------------------------------------------------------------------------- */

export type RoomRow = typeof rooms.$inferSelect
export type BookingRow = typeof bookings.$inferSelect
export type PaymentRow = typeof payments.$inferSelect
export type CouponRow = typeof coupons.$inferSelect
export type ReviewRow = typeof reviews.$inferSelect
export type OfferRow = typeof offers.$inferSelect
export type GalleryRow = typeof gallery.$inferSelect
export type FaqRow = typeof faqs.$inferSelect
export type UserRow = typeof user.$inferSelect
