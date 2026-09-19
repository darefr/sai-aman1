'use client'

import { useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Pencil, Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { deleteRoomAction } from '@/app/actions/admin'
import { formatMoney } from '@/lib/pricing'
import type { RoomRow } from '@/lib/db/schema'

export function RoomsTable({ rooms }: { rooms: RoomRow[] }) {
  const router = useRouter()
  const [isPending, start] = useTransition()

  function remove(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
    start(async () => {
      const res = await deleteRoomAction(id)
      if (!res.ok) {
        toast.error(res.error ?? 'Delete failed.')
        return
      }
      toast.success(res.error ?? 'Room deleted.')
      router.refresh()
    })
  }

  if (rooms.length === 0) {
    return <p className="py-10 text-center text-muted-foreground">No rooms yet. Add your first room.</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
            <th className="pb-2 pr-4 font-semibold">Room</th>
            <th className="pb-2 pr-4 font-semibold">Price</th>
            <th className="pb-2 pr-4 font-semibold">Units</th>
            <th className="pb-2 pr-4 font-semibold">Max</th>
            <th className="pb-2 pr-4 font-semibold">Status</th>
            <th className="pb-2 text-right font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rooms.map((r) => (
            <tr key={r.id} className="border-b border-border/60 last:border-0">
              <td className="py-3 pr-4">
                <p className="font-medium">{r.name}</p>
                <p className="text-xs text-muted-foreground">{r.slug}</p>
              </td>
              <td className="py-3 pr-4">{formatMoney(Number(r.pricePerNight), r.currency)}</td>
              <td className="py-3 pr-4">{r.totalUnits}</td>
              <td className="py-3 pr-4">{r.maxGuests}</td>
              <td className="py-3 pr-4">
                <div className="flex gap-1.5">
                  {r.active ? <Badge variant="success">Active</Badge> : <Badge variant="muted">Hidden</Badge>}
                  {r.featured && <Badge variant="gold">Featured</Badge>}
                </div>
              </td>
              <td className="py-3">
                <div className="flex items-center justify-end gap-1">
                  <Link
                    href={`/admin/rooms/${r.id}`}
                    className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-primary hover:bg-muted"
                  >
                    <Pencil className="size-4" />
                  </Link>
                  <button
                    onClick={() => remove(r.id, r.name)}
                    disabled={isPending}
                    className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-destructive hover:bg-destructive/10 disabled:opacity-50"
                  >
                    {isPending ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
