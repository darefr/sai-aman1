import { randomBytes, randomUUID } from 'crypto'

/** Stable unique id for table primary keys. */
export function newId(prefix = ''): string {
  return prefix ? `${prefix}_${randomUUID()}` : randomUUID()
}

/** Human-friendly, collision-resistant booking reference, e.g. SA-7F3K9Q. */
export function newBookingReference(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const bytes = randomBytes(6)
  let out = ''
  for (let i = 0; i < 6; i++) out += alphabet[bytes[i] % alphabet.length]
  return `SA-${out}`
}

/** Sequential-looking invoice number based on date + random suffix. */
export function newInvoiceNumber(): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const rand = randomBytes(3).toString('hex').toUpperCase()
  return `INV-${y}${m}-${rand}`
}

/** Transaction reference for a payment attempt. */
export function newTransactionRef(): string {
  return `TXN-${Date.now().toString(36).toUpperCase()}-${randomBytes(3).toString('hex').toUpperCase()}`
}
