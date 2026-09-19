/**
 * ============================================================================
 * BOOKING ENGINE — INTEGRATION SEAM (frontend contract only)
 * ============================================================================
 *
 * This file defines the TYPES and the CLIENT-SIDE entry point the booking form
 * calls. Today `submitBookingRequest` just simulates a request so the UI is
 * fully functional. A backend team can implement the real flow behind the same
 * function signature without changing any UI code.
 *
 * RECOMMENDED BACKEND WIRING (do NOT put secrets in the client):
 *
 *   1. AVAILABILITY  — GET /api/availability?roomId&checkIn&checkOut&guests
 *      TODO(PMS): Query your Property Management System / channel manager
 *      (e.g. eZee, Cloudbeds, Hotelogix) for live inventory + rates and return
 *      them. Use the result to override the static `content.ts` snapshot.
 *
 *   2. CREATE BOOKING — POST /api/bookings  (Route Handler / Server Action)
 *      TODO(PMS): Reserve the room in the PMS and persist the booking in your
 *      database. Return a `bookingId` and an amount to charge.
 *
 *   3. PAYMENT — POST /api/payments/checkout
 *      TODO(PAYMENT): Create a payment session and redirect the guest.
 *        - eSewa:  https://developer.esewa.com.np  (form POST + signature)
 *        - Khalti: https://docs.khalti.com          (ePayment initiate API)
 *        - Stripe: stripe.checkout.sessions.create  (for international cards)
 *      Verify the payment server-side via webhook BEFORE confirming the room.
 *
 *   4. CHANNEL MANAGER SYNC — after confirmation
 *      TODO(CHANNEL): Push the reservation back to OTAs (Booking.com, Agoda,
 *      Expedia) through your channel manager so inventory stays in sync and
 *      avoids overbooking.
 *
 *   5. NOTIFICATIONS
 *      TODO(NOTIFY): Send guest confirmation email/SMS and notify reception.
 * ============================================================================
 */

export type BookingRequest = {
  name: string
  email: string
  phone: string
  checkIn: string
  checkOut: string
  guests: number
  roomId: string
  message?: string
}

export type BookingResult =
  | { ok: true; bookingId: string }
  | { ok: false; error: string }

/**
 * Client entry point for the booking form.
 *
 * TODO(BACKEND): Replace the simulated response with a real call:
 *   const res = await fetch('/api/bookings', {
 *     method: 'POST',
 *     headers: { 'Content-Type': 'application/json' },
 *     body: JSON.stringify(request),
 *   })
 *   return res.json()
 */
export async function submitBookingRequest(
  request: BookingRequest,
): Promise<BookingResult> {
  // Simulated latency so the UI reflects a realistic async flow.
  await new Promise((resolve) => setTimeout(resolve, 900))

  if (new Date(request.checkOut) <= new Date(request.checkIn)) {
    return { ok: false, error: 'Check-out must be after check-in.' }
  }

  return { ok: true, bookingId: `SA-${Date.now().toString(36).toUpperCase()}` }
}
