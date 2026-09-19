import 'server-only'
import { db } from '@/lib/db'
import * as s from '@/lib/db/schema'
import { newId } from '@/lib/ids'

export async function audit(params: {
  actorId?: string | null
  actorEmail?: string | null
  action: string
  entity?: string
  entityId?: string
  meta?: Record<string, unknown>
}): Promise<void> {
  try {
    await db.insert(s.auditLog).values({
      id: newId('aud'),
      actorId: params.actorId ?? null,
      actorEmail: params.actorEmail ?? null,
      action: params.action,
      entity: params.entity ?? null,
      entityId: params.entityId ?? null,
      meta: params.meta ?? {},
    })
  } catch {
    /* best-effort */
  }
}
