'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Trash2, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { createRoomBlockAction, deleteRoomBlockAction } from '@/app/actions/admin'

type Block = {
  id: string
  startDate: string
  endDate: string
  units: number
  reason: string
  note: string | null
}

export function RoomBlocks({ roomId, blocks }: { roomId: string; blocks: Block[] }) {
  const router = useRouter()
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [units, setUnits] = useState(1)
  const [reason, setReason] = useState('maintenance')
  const [note, setNote] = useState('')
  const [isPending, startTransition] = useTransition()

  function add(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const res = await createRoomBlockAction({ roomId, startDate: start, endDate: end, units, reason, note })
      if (!res.ok) {
        toast.error(res.error ?? 'Could not add block.')
        return
      }
      toast.success('Block added.')
      setStart('')
      setEnd('')
      setNote('')
      router.refresh()
    })
  }

  function remove(id: string) {
    startTransition(async () => {
      await deleteRoomBlockAction(id)
      toast.success('Block removed.')
      router.refresh()
    })
  }

  return (
    <div>
      <form onSubmit={add} className="grid gap-3 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor="bStart">From</Label>
          <Input id="bStart" type="date" value={start} onChange={(e) => setStart(e.target.value)} required />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="bEnd">To</Label>
          <Input id="bEnd" type="date" value={end} onChange={(e) => setEnd(e.target.value)} required />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="bUnits">Units to block</Label>
          <Input id="bUnits" type="number" min={1} value={units} onChange={(e) => setUnits(Number(e.target.value))} required />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="bReason">Reason</Label>
          <Select id="bReason" value={reason} onChange={(e) => setReason(e.target.value)}>
            <option value="maintenance">Maintenance</option>
            <option value="manual">Manual reservation</option>
            <option value="hold">Hold</option>
          </Select>
        </div>
        <div className="grid gap-1.5 sm:col-span-2">
          <Label htmlFor="bNote">Note (optional)</Label>
          <Input id="bNote" value={note} onChange={(e) => setNote(e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <Button type="submit" disabled={isPending}>
            {isPending ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />} Add block
          </Button>
        </div>
      </form>

      <div className="mt-6">
        {blocks.length === 0 ? (
          <p className="text-sm text-muted-foreground">No blocked dates.</p>
        ) : (
          <ul className="grid gap-2">
            {blocks.map((b) => (
              <li key={b.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm">
                <span>
                  <span className="font-medium">
                    {b.startDate} → {b.endDate}
                  </span>{' '}
                  <span className="text-muted-foreground">
                    · {b.units} unit(s) · {b.reason}
                    {b.note ? ` · ${b.note}` : ''}
                  </span>
                </span>
                <button
                  onClick={() => remove(b.id)}
                  disabled={isPending}
                  className="text-destructive hover:opacity-80 disabled:opacity-50"
                  aria-label="Remove block"
                >
                  <Trash2 className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
