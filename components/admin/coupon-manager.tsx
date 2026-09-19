'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Trash2, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { saveCouponAction, deleteCouponAction } from '@/app/actions/admin'
import type { CouponRow } from '@/lib/db/schema'

export function CouponManager({ coupons }: { coupons: CouponRow[] }) {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [type, setType] = useState('percent')
  const [value, setValue] = useState(10)
  const [minNights, setMinNights] = useState(1)
  const [minAmount, setMinAmount] = useState(0)
  const [description, setDescription] = useState('')
  const [isPending, start] = useTransition()

  function create(e: React.FormEvent) {
    e.preventDefault()
    start(async () => {
      const res = await saveCouponAction({ code, type, value, minNights, minAmount, description, active: true })
      if (!res.ok) {
        toast.error(res.error ?? 'Could not save coupon.')
        return
      }
      toast.success('Coupon created.')
      setCode('')
      setDescription('')
      router.refresh()
    })
  }

  function toggleActive(c: CouponRow) {
    start(async () => {
      await saveCouponAction(
        {
          code: c.code,
          type: c.type,
          value: Number(c.value),
          minNights: c.minNights,
          minAmount: Number(c.minAmount),
          description: c.description ?? '',
          maxRedemptions: c.maxRedemptions ?? undefined,
          active: !c.active,
        },
        c.id,
      )
      router.refresh()
    })
  }

  function remove(id: string) {
    if (!confirm('Delete this coupon?')) return
    start(async () => {
      await deleteCouponAction(id)
      toast.success('Coupon deleted.')
      router.refresh()
    })
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <Card className="lg:sticky lg:top-6 lg:self-start">
        <CardHeader>
          <CardTitle>New coupon</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={create} className="grid gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="code">Code</Label>
              <Input id="code" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="WELCOME10" required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="type">Type</Label>
                <Select id="type" value={type} onChange={(e) => setType(e.target.value)}>
                  <option value="percent">Percent</option>
                  <option value="fixed">Fixed (NPR)</option>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="value">Value</Label>
                <Input id="value" type="number" min={0} value={value} onChange={(e) => setValue(Number(e.target.value))} required />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="minNights">Min nights</Label>
                <Input id="minNights" type="number" min={1} value={minNights} onChange={(e) => setMinNights(Number(e.target.value))} />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="minAmount">Min amount</Label>
                <Input id="minAmount" type="number" min={0} value={minAmount} onChange={(e) => setMinAmount(Number(e.target.value))} />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="desc">Description</Label>
              <Input id="desc" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <Button type="submit" disabled={isPending}>
              {isPending ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />} Create coupon
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          {coupons.length === 0 ? (
            <p className="py-10 text-center text-muted-foreground">No coupons yet.</p>
          ) : (
            <div className="grid gap-3">
              {coupons.map((c) => (
                <div key={c.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold">{c.code}</span>
                      {c.active ? <Badge variant="success">Active</Badge> : <Badge variant="muted">Inactive</Badge>}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {c.type === 'percent' ? `${Number(c.value)}% off` : `NPR ${Number(c.value)} off`} · min {c.minNights}{' '}
                      night(s) · used {c.timesRedeemed}
                      {c.description ? ` · ${c.description}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => toggleActive(c)} disabled={isPending}>
                      {c.active ? 'Disable' : 'Enable'}
                    </Button>
                    <button
                      onClick={() => remove(c.id)}
                      disabled={isPending}
                      className="text-destructive hover:opacity-80 disabled:opacity-50"
                      aria-label="Delete coupon"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
