/**
 * ============================================================================
 * SERVER-SIDE SESSION & AUTHORIZATION
 * ============================================================================
 *
 * Every protected page, server action and API route MUST resolve the session
 * here. UI hiding is never authorization — these helpers are the gate.
 * ============================================================================
 */

import 'server-only'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'

export type SessionUser = {
  id: string
  name: string
  email: string
  emailVerified: boolean
  role: string
  image?: string | null
}

/** Returns the current user or null. Never throws. */
export async function getCurrentUser(): Promise<SessionUser | null> {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) return null
    const u = session.user as unknown as SessionUser
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      emailVerified: u.emailVerified,
      role: (u.role as string) ?? 'customer',
      image: u.image ?? null,
    }
  } catch {
    return null
  }
}

/** Require any authenticated user, else redirect to login. */
export async function requireUser(returnTo = '/account'): Promise<SessionUser> {
  const user = await getCurrentUser()
  if (!user) redirect(`/login?redirect=${encodeURIComponent(returnTo)}`)
  return user
}

/** Require an admin/staff user, else redirect. */
export async function requireAdmin(): Promise<SessionUser> {
  const user = await getCurrentUser()
  if (!user) redirect('/login?redirect=/admin')
  if (user.role !== 'admin' && user.role !== 'staff') redirect('/account')
  return user
}

export function isAdminRole(role: string | undefined | null): boolean {
  return role === 'admin' || role === 'staff'
}
