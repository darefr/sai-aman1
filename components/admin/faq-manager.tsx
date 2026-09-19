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
import { saveFaqAction, deleteFaqAction } from '@/app/actions/admin'
import type { FaqRow } from '@/lib/db/schema'

export function FaqManager({ faqs }: { faqs: FaqRow[] }) {
  const router = useRouter()
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [isPending, start] = useTransition()

  function create(e: React.FormEvent) {
    e.preventDefault()
    start(async () => {
      const res = await saveFaqAction({ question, answer, sortOrder: faqs.length, active: true })
      if (!res.ok) {
        toast.error(res.error ?? 'Could not save FAQ.')
        return
      }
      toast.success('FAQ added.')
      setQuestion('')
      setAnswer('')
      router.refresh()
    })
  }

  function toggle(f: FaqRow) {
    start(async () => {
      await saveFaqAction({ id: f.id, question: f.question, answer: f.answer, sortOrder: f.sortOrder, active: !f.active })
      router.refresh()
    })
  }

  function remove(id: string) {
    if (!confirm('Delete this FAQ?')) return
    start(async () => {
      await deleteFaqAction(id)
      toast.success('FAQ deleted.')
      router.refresh()
    })
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <Card className="lg:sticky lg:top-6 lg:self-start">
        <CardHeader>
          <CardTitle>Add FAQ</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={create} className="grid gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="q">Question</Label>
              <Input id="q" value={question} onChange={(e) => setQuestion(e.target.value)} required />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="a">Answer</Label>
              <Textarea id="a" value={answer} onChange={(e) => setAnswer(e.target.value)} required />
            </div>
            <Button type="submit" disabled={isPending}>
              {isPending ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />} Add FAQ
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          {faqs.length === 0 ? (
            <p className="py-10 text-center text-muted-foreground">No FAQs yet.</p>
          ) : (
            <div className="grid gap-3">
              {faqs.map((f) => (
                <div key={f.id} className="rounded-lg border border-border p-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-medium">{f.question}</p>
                    <div className="flex items-center gap-2">
                      {f.active ? <Badge variant="success">Live</Badge> : <Badge variant="muted">Hidden</Badge>}
                      <Button size="sm" variant="outline" onClick={() => toggle(f)} disabled={isPending}>
                        {f.active ? 'Hide' : 'Show'}
                      </Button>
                      <button onClick={() => remove(f.id)} disabled={isPending} className="text-destructive hover:opacity-80 disabled:opacity-50" aria-label="Delete FAQ">
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{f.answer}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
