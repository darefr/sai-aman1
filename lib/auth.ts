/**
 * ============================================================================
 * AUTHENTICATION (Better Auth · email + password)
 * ============================================================================
 *
 * Email + password auth with email verification and password reset. Roles are
 * stored on the user record (`customer` | `admin` | `staff`) and enforced in
 * the server data path (see lib/session.ts).
 *
 * When SMTP is not configured, verification/reset emails are logged instead of
 * sent (see lib/email). When the database is not configured, Better Auth falls
 * back to an in-memory adapter so the app still builds and renders.
 * ============================================================================
 */

import { betterAuth } from 'better-auth'
import { nextCookies } from 'better-auth/next-js'
import { pool } from '@/lib/db'
import { getBaseUrl } from '@/lib/env'
import {
  sendEmail,
  verifyEmailTemplate,
  welcomeTemplate,
  resetPasswordTemplate,
} from '@/lib/email'

function buildTrustedOrigins(): string[] {
  const origins = new Set<string>()
  if (process.env.NODE_ENV === 'development') {
    origins.add('http://localhost:3000')
    for (const key of ['V0_RUNTIME_URL', 'V0_DEV_APP_URL', 'V0_BUILD_URL', 'V0_SANDBOX_URL']) {
      const v = process.env[key]
      if (v) origins.add(v.replace(/\/$/, ''))
    }
  } else {
    for (const key of ['VERCEL_PROJECT_PRODUCTION_URL', 'VERCEL_URL']) {
      const v = process.env[key]
      if (v) origins.add(`https://${v}`)
    }
  }
  return Array.from(origins)
}

export const auth = betterAuth({
  baseURL: getBaseUrl(),
  database: pool ?? undefined,
  trustedOrigins: buildTrustedOrigins(),

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    minPasswordLength: 8,
    sendResetPassword: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: 'Reset your Hotel Sai Aman password',
        html: resetPasswordTemplate(user.name || 'guest', url),
      })
    },
  },

  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: 'Confirm your email · Hotel Sai Aman',
        html: verifyEmailTemplate(user.name || 'guest', url),
      })
    },
  },

  user: {
    additionalFields: {
      role: {
        type: 'string',
        required: false,
        defaultValue: 'customer',
        input: false, // never settable from the client
      },
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // refresh daily
  },

  databaseHooks: {
    user: {
      create: {
        after: async (createdUser) => {
          // Best-effort welcome email; never blocks sign-up.
          await sendEmail({
            to: createdUser.email,
            subject: 'Welcome to Hotel Sai Aman',
            html: welcomeTemplate(createdUser.name || 'guest'),
          }).catch(() => {})
        },
      },
    },
  },

  // Required by the cross-site v0 preview iframe. Without these attributes,
  // login succeeds but the next request appears signed out.
  ...(process.env.NODE_ENV === 'development'
    ? {
        advanced: {
          defaultCookieAttributes: {
            sameSite: 'none' as const,
            secure: true,
          },
        },
      }
    : {}),

  plugins: [nextCookies()],
})

export type Session = typeof auth.$Infer.Session
