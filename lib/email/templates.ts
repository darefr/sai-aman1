/**
 * Branded transactional email templates for Hotel Sai Aman.
 * Plain inline-styled HTML for broad email-client compatibility.
 */

const GOLD = '#b8894b'
const INK = '#161310'

export function baseEmail(title: string, inner: string): string {
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${escapeHtml(
    title,
  )}</title></head>
  <body style="margin:0;background:#f5f2ec;font-family:Helvetica,Arial,sans-serif;color:${INK};">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f2ec;padding:24px 0;">
      <tr><td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #e7e0d4;">
          <tr><td style="background:${INK};padding:22px 28px;">
            <span style="color:#ffffff;font-size:20px;font-weight:600;letter-spacing:.3px;">Hotel Sai&nbsp;<span style="color:${GOLD};">Aman</span></span>
          </td></tr>
          <tr><td style="padding:32px 28px;font-size:15px;line-height:1.6;">${inner}</td></tr>
          <tr><td style="padding:20px 28px;background:#faf7f1;border-top:1px solid #e7e0d4;font-size:12px;color:#8a8278;">
            New Bus Park, Butwal, Lumbini Province, Nepal<br/>
            This is an automated message from Hotel Sai Aman.
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body></html>`
}

function button(href: string, label: string): string {
  return `<a href="${href}" style="display:inline-block;background:${GOLD};color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:9px;font-weight:600;font-size:14px;">${escapeHtml(
    label,
  )}</a>`
}

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function verifyEmailTemplate(name: string, url: string): string {
  return `<h2 style="margin:0 0 12px;">Confirm your email</h2>
  <p>Namaste ${escapeHtml(name)},</p>
  <p>Welcome to Hotel Sai Aman. Please confirm your email address to activate your account.</p>
  <p style="margin:24px 0;">${button(url, 'Verify email')}</p>
  <p style="font-size:13px;color:#8a8278;">If you did not create an account, you can safely ignore this email.</p>`
}

export function welcomeTemplate(name: string): string {
  return `<h2 style="margin:0 0 12px;">Welcome, ${escapeHtml(name)}</h2>
  <p>Your Hotel Sai Aman account is ready. You can now book rooms, manage reservations and download receipts from your dashboard.</p>
  <p>We look forward to hosting you in Butwal.</p>`
}

export function resetPasswordTemplate(name: string, url: string): string {
  return `<h2 style="margin:0 0 12px;">Reset your password</h2>
  <p>Namaste ${escapeHtml(name)},</p>
  <p>We received a request to reset your password. This link expires in 1 hour.</p>
  <p style="margin:24px 0;">${button(url, 'Reset password')}</p>
  <p style="font-size:13px;color:#8a8278;">If you did not request this, no action is needed.</p>`
}

type BookingEmailData = {
  guestName: string
  reference: string
  roomName: string
  checkIn: string
  checkOut: string
  nights: number
  total: string
  currency: string
  status: string
}

export function bookingConfirmationTemplate(d: BookingEmailData, manageUrl: string): string {
  return `<h2 style="margin:0 0 12px;">Booking ${escapeHtml(d.status)}</h2>
  <p>Namaste ${escapeHtml(d.guestName)},</p>
  <p>Thank you for choosing Hotel Sai Aman. Here are your booking details:</p>
  ${detailsTable(d)}
  <p style="margin:24px 0;">${button(manageUrl, 'View booking')}</p>`
}

export function bookingCancellationTemplate(d: BookingEmailData): string {
  return `<h2 style="margin:0 0 12px;">Booking cancelled</h2>
  <p>Namaste ${escapeHtml(d.guestName)},</p>
  <p>Your booking <strong>${escapeHtml(d.reference)}</strong> has been cancelled. If this was a mistake, please contact us or make a new reservation.</p>
  ${detailsTable(d)}`
}

export function paymentConfirmationTemplate(d: BookingEmailData): string {
  return `<h2 style="margin:0 0 12px;">Payment received</h2>
  <p>Namaste ${escapeHtml(d.guestName)},</p>
  <p>We have received your payment for booking <strong>${escapeHtml(d.reference)}</strong>.</p>
  ${detailsTable(d)}`
}

export function bookingStatusTemplate(d: BookingEmailData): string {
  return `<h2 style="margin:0 0 12px;">Booking update</h2>
  <p>Namaste ${escapeHtml(d.guestName)},</p>
  <p>The status of your booking <strong>${escapeHtml(d.reference)}</strong> is now <strong>${escapeHtml(
    d.status,
  )}</strong>.</p>
  ${detailsTable(d)}`
}

export function adminNewBookingTemplate(d: BookingEmailData): string {
  return `<h2 style="margin:0 0 12px;">New booking received</h2>
  <p>A new booking has been placed by ${escapeHtml(d.guestName)}.</p>
  ${detailsTable(d)}`
}

function detailsTable(d: BookingEmailData): string {
  const row = (k: string, v: string) =>
    `<tr><td style="padding:6px 0;color:#8a8278;">${escapeHtml(k)}</td><td style="padding:6px 0;text-align:right;font-weight:600;">${escapeHtml(
      v,
    )}</td></tr>`
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;border-top:1px solid #e7e0d4;border-bottom:1px solid #e7e0d4;">
    ${row('Reference', d.reference)}
    ${row('Room', d.roomName)}
    ${row('Check-in', d.checkIn)}
    ${row('Check-out', d.checkOut)}
    ${row('Nights', String(d.nights))}
    ${row('Total', `${d.currency} ${d.total}`)}
  </table>`
}
