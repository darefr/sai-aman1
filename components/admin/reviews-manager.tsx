'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Trash2, Plus, Star } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createReviewAction, setReviewApprovedAction, deleteReviewAction } from '@/app/actions/admin'
import type { ReviewRow } from '@/lib/db/schema'

export function ReviewsManager({ reviews }: { reviews: ReviewRow[] }) {
  const router = useRouter()
  const [author, setAuthor] = useState('')
  const [country, setCountry] = useState('')
  const [rating, setRating] = useState(9)
  const [quote, setQuote] = useState('')
  const [stayType, setStayType] = useState('')
  const [isPending, start] = useTransition()

  function create(e: React.FormEvent) {
    e.preventDefault()
    start(async () => {
      const res = await createReviewAction({ author, country, rating, quote, stayType, approved: true })
      if (!res.ok) {
        toast.error(res.error ?? 'Could not save review.')
        return
      }
      toast.success('Review added.')
      setAuthor('')
      setCountry('')
      setQuote('')
      setStayType('')
      router.refresh()
    })
  }

  function toggle(r: ReviewRow) {
    start(async () => {
      await setReviewApprovedAction(r.id, !r.approved)
      router.refresh()
    })
  }

  function remove(id: string) {
    if (!confirm('Delete this review?')) return
    start(async () => {
      await deleteReviewAction(id)
      toast.success('Review deleted.')
      router.refresh()
    })
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <Card className="lg:sticky lg:top-6 lg:self-start">
        <CardHeader>
          <CardTitle>Add review</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={create} className="grid gap-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="author">Author</Label>
                <Input id="author" value={author} onChange={(e) => setAuthor(e.target.value)} required />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="country">Country</Label>
                <Input id="country" value={country} onChange={(e) => setCountry(e.target.value)} />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="rating">Rating (1-10)</Label>
                <Input id="rating" type="number" min={1} max={10} value={rating} onChange={(e) => setRating(Number(e.target.value))} />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="stayType">Stay type</Label>
                <Input id="stayType" value={stayType} onChange={(e) => setStayType(e.target.value)} placeholder="Business" />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="quote">Quote</Label>
              <Textarea id="quote" value={quote} onChange={(e) => setQuote(e.target.value)} required />
            </div>
            <Button type="submit" disabled={isPending}>
              {isPending ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />} Add review
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          {reviews.length === 0 ? (
            <p className="py-10 text-center text-muted-foreground">No reviews yet.</p>
          ) : (
            <div className="grid gap-3">
              {reviews.map((r) => (
                <div key={r.id} className="rounded-lg border border-border p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{r.author}</span>
                      {r.country && <span className="text-sm text-muted-foreground">· {r.country}</span>}
                      <span className="inline-flex items-center gap-0.5 text-sm text-gold">
                        <Star className="size-3.5 fill-gold" /> {r.rating}
                      </span>
                      {r.approved ? <Badge variant="success">Approved</Badge> : <Badge variant="warning">Pending</Badge>}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => toggle(r)} disabled={isPending}>
                        {r.approved ? 'Unapprove' : 'Approve'}
                      </Button>
                      <button onClick={() => remove(r.id)} disabled={isPending} className="text-destructive hover:opacity-80 disabled:opacity-50" aria-label="Delete review">
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{r.quote}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
