/**
 * ============================================================================
 * ENVIRONMENT CONFIGURATION
 * ============================================================================
 *
 * Central, safe access to environment variables. Nothing here throws at import
 * time so the site keeps rendering even when optional services (database, SMTP,
 * payment gateways) are not configured yet. Feature code checks the relevant
 * `is*Configured()` helper and degrades gracefully (setup notices, safe mock
 * payments, logged-instead-of-sent email).
 *
 * NEVER expose secrets to the client. Only values explicitly prefixed with
 * NEXT_PUBLIC_ are safe in browser bundles.
 * ============================================================================
 */

export const env = {
  DATABASE_URL: process.env.DATABASE_URL ?? '',
  BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET ?? '',
  BETTER_AUTH_URL: process.env.BETTER_AUTH_URL ?? '',

  // SMTP (optional)
  SMTP_HOST: process.env.SMTP_HOST ?? '',
  SMTP_PORT: process.env.SMTP_PORT ?? '587',
  SMTP_USER: process.env.SMTP_USER ?? '',
  SMTP_PASSWORD: process.env.SMTP_PASSWORD ?? '',
  SMTP_FROM: process.env.SMTP_FROM ?? 'Hotel Sai Aman <no-reply@hotelsaiaman.com>',

  // Payment gateways (optional — safe mock used when absent)
  PAYMENT_MODE: (process.env.PAYMENT_MODE ?? 'test') as 'test' | 'live',

  ESEWA_MERCHANT_CODE: process.env.ESEWA_MERCHANT_CODE ?? '',
  ESEWA_SECRET_KEY: process.env.ESEWA_SECRET_KEY ?? '',

  KHALTI_SECRET_KEY: process.env.KHALTI_SECRET_KEY ?? '',

  FONEPAY_MERCHANT_CODE: process.env.FONEPAY_MERCHANT_CODE ?? '',
  FONEPAY_SECRET_KEY: process.env.FONEPAY_SECRET_KEY ?? '',

  // Seeded admin bootstrap (optional)
  ADMIN_EMAIL: process.env.ADMIN_EMAIL ?? '',
}

/** Public base URL of the deployment / preview, resolved from Vercel/v0 vars. */
export function getBaseUrl(): string {
  if (env.BETTER_AUTH_URL) return env.BETTER_AUTH_URL.replace(/\/$/, '')
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL)
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  if (process.env.V0_RUNTIME_URL) return process.env.V0_RUNTIME_URL.replace(/\/$/, '')
  return 'http://localhost:3000'
}

export function isDatabaseConfigured(): boolean {
  return env.DATABASE_URL.length > 0
}

export function isAuthConfigured(): boolean {
  return isDatabaseConfigured() && env.BETTER_AUTH_SECRET.length >= 16
}

export function isSmtpConfigured(): boolean {
  return env.SMTP_HOST.length > 0 && env.SMTP_USER.length > 0 && env.SMTP_PASSWORD.length > 0
}

export function isEsewaConfigured(): boolean {
  return env.PAYMENT_MODE === 'live' && env.ESEWA_MERCHANT_CODE.length > 0 && env.ESEWA_SECRET_KEY.length > 0
}

export function isKhaltiConfigured(): boolean {
  return env.PAYMENT_MODE === 'live' && env.KHALTI_SECRET_KEY.length > 0
}

export function isFonepayConfigured(): boolean {
  return (
    env.PAYMENT_MODE === 'live' &&
    env.FONEPAY_MERCHANT_CODE.length > 0 &&
    env.FONEPAY_SECRET_KEY.length > 0
  )
}
