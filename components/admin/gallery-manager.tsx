'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Loader2, Trash2, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { saveGalleryItemAction, deleteGalleryItemAction } from '@/app/actions/admin'
import type { GalleryRow } from '@/lib/db/schema'

export function GalleryManager({ items }: { items: GalleryRow[] }) {
  const router = useRouter()
  const [src, setSrc] = useState('')
  const [alt, setAlt] = useState('')
  const [category, setCategory] = useState('general')
  const [isPending, start] = useTransition()

  function create(e: React.FormEvent) {
    e.preventDefault()
    start(async () => {
      const res = await saveGalleryItemAction({ src, alt, category, sortOrder: items.length, active: true })
      if (!res.ok) {
        toast.error(res.error ?? 'Could not add image.')
        return
      }
      toast.success('Image added.')
      setSrc('')
      setAlt('')
      router.refresh()
    })
  }

  function remove(id: string) {
    if (!confirm('Remove this image?')) return
    start(async () => {
      await deleteGalleryItemAction(id)
      toast.success('Image removed.')
      router.refresh()
    })
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Add image</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={create} className="grid gap-3 sm:grid-cols-[1fr_1fr_160px_auto] sm:items-end">
            <div className="grid gap-1.5">
              <Label htmlFor="src">Image URL</Label>
              <Input id="src" value={src} onChange={(e) => setSrc(e.target.value)} placeholder="/images/exterior-day.png" required />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="alt">Alt text</Label>
              <Input id="alt" value={alt} onChange={(e) => setAlt(e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="cat">Category</Label>
              <Input id="cat" value={category} onChange={(e) => setCategory(e.target.value)} />
            </div>
            <Button type="submit" disabled={isPending}>
              {isPending ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />} Add
            </Button>
          </form>
        </CardContent>
      </Card>

      {items.length === 0 ? (
        <p className="py-10 text-center text-muted-foreground">No gallery images yet.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((g) => (
            <div key={g.id} className="group relative overflow-hidden rounded-xl border border-border">
              <div className="relative aspect-[4/3]">
                <Image src={g.src} alt={g.alt} fill sizes="200px" className="object-cover" />
              </div>
              <div className="flex items-center justify-between p-2 text-xs">
                <span className="truncate text-muted-foreground">{g.category}</span>
                <button onClick={() => remove(g.id)} disabled={isPending} className="text-destructive hover:opacity-80 disabled:opacity-50" aria-label="Remove image">
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
