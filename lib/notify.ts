/**
 * ============================================================================
 * NOTIFICATIONS — booking lifecycle emails + in-app records
 * ============================================================================
 * All functions are best-effort and never throw to the caller.
 * ============================================================================
 */

import 'server-only'
import { db } from '@/lib/db'
import * as s from '@/lib/db/schema'
import { newId } from '@/lib/ids'
import { getBaseUrl, env } from '@/lib/env'
import {
  sendEmail,
  bookingConfirmationTemplate,
  bookingCancellationTemplate,
  paymentConfirmationTemplate,
  bookingStatusTemplate,
  adminNewBookingTemplate,
} from '@/lib/email'
import { formatMoney } from '@/lib/pricing'

type BookingLike = typeof s.bookings.$inferSelect

function toEmailData(b: BookingLike, roomName: string) {
  return {
    guestName: b.guestName,
    reference: b.reference,
    roomName,
    checkIn: b.checkIn,
    checkOut: b.checkOut,
    nights: b.nights,
    total: formatMoney(Number(b.total), b.currency).replace(`${b.currency} `, ''),
    currency: b.currency,
    status: b.status,
  }
}

async function addNotification(userId: string | null, type: string, title: string, body: string) {
  if (!userId) return
  try {
    await db.insert(s.notifications).values({ id: newId('ntf'), userId, type, title, body })
  } catch {
    /* best-effort */
  }
}

export async function notifyBookingCreated(b: BookingLike, roomName: string) {
  const manageUrl = `${getBaseUrl()}/account/bookings/${b.reference}`
  const data = toEmailData(b, roomName)
  await sendEmail({
    to: b.guestEmail,
    subject: `Booking received · ${b.reference}`,
    html: bookingConfirmationTemplate(data, manageUrl),
  }).catch(() => {})
  await addNotification(b.userId, 'booking', 'Booking received', `Your booking ${b.reference} is pending payment.`)

  // Admin notification (email if an admin address is configured).
  if (env.ADMIN_EMAIL) {
    await sendEmail({
      to: env.ADMIN_EMAIL,
      subject: `New booking · ${b.reference}`,
      html: adminNewBookingTemplate(data),
    }).catch(() => {})
  }
}

export async function notifyPaymentPaid(b: BookingLike, roomName: string) {
  const data = toEmailData(b, roomName)
  await sendEmail({
    to: b.guestEmail,
    subject: `Payment received · ${b.reference}`,
    html: paymentConfirmationTemplate(data),
  }).catch(() => {})
  await addNotification(b.userId, 'payment', 'Payment received', `Payment confirmed for booking ${b.reference}.`)
}

export async function notifyBookingCancelled(b: BookingLike, roomName: string) {
  const data = toEmailData(b, roomName)
  await sendEmail({
    to: b.guestEmail,
    subject: `Booking cancelled · ${b.reference}`,
    html: bookingCancellationTemplate(data),
  }).catch(() => {})
  await addNotification(b.userId, 'booking', 'Booking cancelled', `Booking ${b.reference} was cancelled.`)
}

export async function notifyBookingStatus(b: BookingLike, roomName: string) {
  const data = toEmailData(b, roomName)
  await sendEmail({
    to: b.guestEmail,
    subject: `Booking update · ${b.reference}`,
    html: bookingStatusTemplate(data),
  }).catch(() => {})
  await addNotification(b.userId, 'booking', 'Booking updated', `Booking ${b.reference} is now ${b.status}.`)
}
