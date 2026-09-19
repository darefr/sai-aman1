'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { saveRoomAction } from '@/app/actions/admin'

const AMENITIES = [
  { id: 'private-bathroom', label: 'Private bathroom' },
  { id: 'free-wifi', label: 'Free WiFi' },
  { id: 'desk', label: 'Work desk' },
  { id: 'carpeting', label: 'Carpeting' },
  { id: 'air-conditioning', label: 'Air conditioning' },
  { id: 'flat-screen-tv', label: 'Flat-screen TV' },
  { id: 'room-service', label: 'Room service' },
]

export type RoomFormValues = {
  slug: string
  name: string
  description: string
  beds: string
  maxGuests: number
  sizeSqm: number
  pricePerNight: number
  totalUnits: number
  amenities: string[]
  featured: boolean
  active: boolean
  sortOrder: number
  gallery: { src: string; alt: string }[]
}

export function RoomForm({ roomId, initial }: { roomId?: string; initial: RoomFormValues }) {
  const router = useRouter()
  const [form, setForm] = useState(initial)
  const [galleryText, setGalleryText] = useState(initial.gallery.map((g) => g.src).join('\n'))
  const [error, setError] = useState<string | null>(null)
  const [isPending, start] = useTransition()

  function set<K extends keyof RoomFormValues>(key: K, value: RoomFormValues[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function toggleAmenity(id: string) {
    setForm((f) => ({
      ...f,
      amenities: f.amenities.includes(id) ? f.amenities.filter((a) => a !== id) : [...f.amenities, id],
    }))
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const gallery = galleryText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((src) => ({ src, alt: form.name }))

    start(async () => {
      const res = await saveRoomAction(
        {
          slug: form.slug || undefined,
          name: form.name,
          description: form.description,
          beds: form.beds,
          maxGuests: form.maxGuests,
          sizeSqm: form.sizeSqm,
          pricePerNight: form.pricePerNight,
          totalUnits: form.totalUnits,
          amenities: form.amenities,
          featured: form.featured,
          active: form.active,
          sortOrder: form.sortOrder,
        },
        roomId,
      )
      if (!res.ok && !res.id) {
        setError(res.error ?? 'Could not save room.')
        return
      }
      // Persist gallery separately (server action for images).
      const targetId = res.id ?? roomId
      if (targetId) {
        const { updateRoomImagesAction } = await import('@/app/actions/admin')
        await updateRoomImagesAction(targetId, gallery)
      }
      toast.success('Room saved.')
      router.push('/admin/rooms')
      router.refresh()
    })
  }

  return (
    <form onSubmit={onSubmit} className="grid max-w-2xl gap-5">
      <div className="grid gap-1.5">
        <Label htmlFor="name">Name</Label>
        <Input id="name" value={form.name} onChange={(e) => set('name', e.target.value)} required />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="slug">Slug (optional)</Label>
        <Input id="slug" value={form.slug} onChange={(e) => set('slug', e.target.value)} placeholder="auto from name" />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" value={form.description} onChange={(e) => set('description', e.target.value)} required />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor="beds">Beds</Label>
          <Input id="beds" value={form.beds} onChange={(e) => set('beds', e.target.value)} required />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="price">Price / night (NPR)</Label>
          <Input id="price" type="number" min={0} value={form.pricePerNight} onChange={(e) => set('pricePerNight', Number(e.target.value))} required />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="maxGuests">Max guests</Label>
          <Input id="maxGuests" type="number" min={1} value={form.maxGuests} onChange={(e) => set('maxGuests', Number(e.target.value))} required />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="sizeSqm">Size (sqm)</Label>
          <Input id="sizeSqm" type="number" min={1} value={form.sizeSqm} onChange={(e) => set('sizeSqm', Number(e.target.value))} required />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="totalUnits">Total units (inventory)</Label>
          <Input id="totalUnits" type="number" min={0} value={form.totalUnits} onChange={(e) => set('totalUnits', Number(e.target.value))} required />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="sortOrder">Sort order</Label>
          <Input id="sortOrder" type="number" value={form.sortOrder} onChange={(e) => set('sortOrder', Number(e.target.value))} />
        </div>
      </div>

      <div className="grid gap-2">
        <Label>Amenities</Label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {AMENITIES.map((a) => (
            <label key={a.id} className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.amenities.includes(a.id)} onChange={() => toggleAmenity(a.id)} className="size-4 rounded border-input" />
              {a.label}
            </label>
          ))}
        </div>
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="gallery">Image URLs (one per line)</Label>
        <Textarea id="gallery" value={galleryText} onChange={(e) => setGalleryText(e.target.value)} placeholder="/images/room-double.png" />
      </div>

      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.featured} onChange={(e) => set('featured', e.target.checked)} className="size-4" /> Featured
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.active} onChange={(e) => set('active', e.target.checked)} className="size-4" /> Active (bookable)
        </label>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? <Loader2 className="size-4 animate-spin" /> : 'Save room'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push('/admin/rooms')}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
