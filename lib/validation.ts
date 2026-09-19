import { z } from 'zod'

const dateStr = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date')

export const availabilitySchema = z
  .object({
    checkIn: dateStr,
    checkOut: dateStr,
    adults: z.coerce.number().int().min(1).max(20),
    children: z.coerce.number().int().min(0).max(20),
    roomId: z.string().optional(),
  })
  .refine((d) => d.checkOut > d.checkIn, { message: 'Check-out must be after check-in', path: ['checkOut'] })

export const createBookingSchema = z
  .object({
    roomId: z.string().min(1),
    checkIn: dateStr,
    checkOut: dateStr,
    adults: z.coerce.number().int().min(1).max(20),
    children: z.coerce.number().int().min(0).max(20),
    units: z.coerce.number().int().min(1).max(10),
    guestName: z.string().trim().min(2, 'Please enter your full name').max(120),
    guestEmail: z.string().trim().email('Enter a valid email').max(160),
    guestPhone: z.string().trim().min(6, 'Enter a valid phone number').max(40),
    specialRequests: z.string().trim().max(1000).optional(),
    couponCode: z.string().trim().max(40).optional(),
  })
  .refine((d) => d.checkOut > d.checkIn, { message: 'Check-out must be after check-in', path: ['checkOut'] })

export const profileSchema = z.object({
  name: z.string().trim().min(2).max(120),
  phone: z.string().trim().max(40).optional().or(z.literal('')),
  address: z.string().trim().max(200).optional().or(z.literal('')),
  city: z.string().trim().max(80).optional().or(z.literal('')),
  country: z.string().trim().max(80).optional().or(z.literal('')),
  postalCode: z.string().trim().max(20).optional().or(z.literal('')),
  nationality: z.string().trim().max(80).optional().or(z.literal('')),
})

export const roomSchema = z.object({
  slug: z.string().trim().min(1).max(60).regex(/^[a-z0-9-]+$/, 'Use lowercase letters, numbers and hyphens'),
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().min(1).max(2000),
  beds: z.string().trim().min(1).max(120),
  maxGuests: z.coerce.number().int().min(1).max(20),
  sizeSqm: z.coerce.number().int().min(1).max(500),
  pricePerNight: z.coerce.number().min(0).max(10_000_000),
  totalUnits: z.coerce.number().int().min(0).max(1000),
  amenities: z.array(z.string()).default([]),
  featured: z.coerce.boolean().default(false),
  active: z.coerce.boolean().default(true),
  sortOrder: z.coerce.number().int().default(0),
})

export const couponSchema = z.object({
  code: z.string().trim().min(2).max(40),
  description: z.string().trim().max(200).optional().or(z.literal('')),
  type: z.enum(['percent', 'fixed']),
  value: z.coerce.number().min(0),
  minNights: z.coerce.number().int().min(1).default(1),
  minAmount: z.coerce.number().min(0).default(0),
  maxRedemptions: z.coerce.number().int().min(0).optional(),
  active: z.coerce.boolean().default(true),
})
