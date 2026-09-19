'use server'

import { revalidatePath } from 'next/cache'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import * as s from '@/lib/db/schema'
import { newId } from '@/lib/ids'
import { profileSchema } from '@/lib/validation'
import { requireUser } from '@/lib/session'

export type UpdateProfileResult = { ok: boolean; error?: string; fieldErrors?: Record<string, string> }

export async function updateProfileAction(raw: unknown): Promise<UpdateProfileResult> {
  const user = await requireUser()
  const parsed = profileSchema.safeParse(raw)
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      const key = issue.path[0]
      if (typeof key === 'string' && !fieldErrors[key]) fieldErrors[key] = issue.message
    }
    return { ok: false, error: 'Please correct the highlighted fields.', fieldErrors }
  }

  const data = parsed.data

  // Update display name on the user record.
  await db.update(s.user).set({ name: data.name, updatedAt: new Date() }).where(eq(s.user.id, user.id))

  // Upsert the customer profile.
  const [existing] = await db
    .select()
    .from(s.customerProfiles)
    .where(eq(s.customerProfiles.userId, user.id))
    .limit(1)

  const profileValues = {
    phone: data.phone || null,
    address: data.address || null,
    city: data.city || null,
    country: data.country || null,
    postalCode: data.postalCode || null,
    nationality: data.nationality || null,
    updatedAt: new Date(),
  }

  if (existing) {
    await db.update(s.customerProfiles).set(profileValues).where(eq(s.customerProfiles.userId, user.id))
  } else {
    await db.insert(s.customerProfiles).values({
      id: newId('cp'),
      userId: user.id,
      ...profileValues,
    })
  }

  revalidatePath('/account/profile')
  revalidatePath('/account')
  return { ok: true }
}
