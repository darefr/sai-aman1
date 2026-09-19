'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Trash2, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { saveOfferAction, deleteOfferAction } from '@/app/actions/admin'
import type { OfferRow } from '@/lib/db/schema'

export function OfferManager({ offers }: { offers: OfferRow[] }) {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [badge, setBadge] = useState('')
  const [couponCode, setCouponCode] = useState('')
  const [isPending, start] = useTransition()

  function create(e: React.FormEvent) {
    e.preventDefault()
    start(async () => {
      const res = await saveOfferAction({ title, description, badge, couponCode, active: true, sortOrder: offers.length })
      if (!res.ok) {
        toast.error(res.error ?? 'Could not save offer.')
        return
      }
      toast.success('Offer created.')
      setTitle('')
      setDescription('')
      setBadge('')
      setCouponCode('')
      router.refresh()
    })
  }

  function toggle(o: OfferRow) {
    start(async () => {
      await saveOfferAction({
        id: o.id,
        title: o.title,
        description: o.description,
        badge: o.badge ?? '',
        couponCode: o.couponCode ?? '',
        ctaLabel: o.ctaLabel ?? '',
        active: !o.active,
        sortOrder: o.sortOrder,
      })
      router.refresh()
    })
  }

  function remove(id: string) {
    if (!confirm('Delete this offer?')) return
    start(async () => {
      await deleteOfferAction(id)
      toast.success('Offer deleted.')
      router.refresh()
    })
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <Card className="lg:sticky lg:top-6 lg:self-start">
        <CardHeader>
          <CardTitle>New offer</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={create} className="grid gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="odesc">Description</Label>
              <Textarea id="odesc" value={description} onChange={(e) => setDescription(e.target.value)} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="badge">Badge</Label>
                <Input id="badge" value={badge} onChange={(e) => setBadge(e.target.value)} placeholder="Save 10%" />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="ocoupon">Coupon</Label>
                <Input id="ocoupon" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} />
              </div>
            </div>
            <Button type="submit" disabled={isPending}>
              {isPending ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />} Create offer
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          {offers.length === 0 ? (
            <p className="py-10 text-center text-muted-foreground">No offers yet.</p>
          ) : (
            <div className="grid gap-3">
              {offers.map((o) => (
                <div key={o.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{o.title}</span>
                      {o.badge && <Badge variant="gold">{o.badge}</Badge>}
                      {o.active ? <Badge variant="success">Active</Badge> : <Badge variant="muted">Hidden</Badge>}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{o.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => toggle(o)} disabled={isPending}>
                      {o.active ? 'Hide' : 'Show'}
                    </Button>
                    <button onClick={() => remove(o.id)} disabled={isPending} className="text-destructive hover:opacity-80 disabled:opacity-50" aria-label="Delete offer">
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
