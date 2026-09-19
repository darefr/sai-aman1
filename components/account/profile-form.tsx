'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateProfileAction } from '@/app/actions/account'

type Profile = {
  name: string
  email: string
  phone: string
  address: string
  city: string
  country: string
  postalCode: string
  nationality: string
}

export function ProfileForm({ initial }: { initial: Profile }) {
  const router = useRouter()
  const [form, setForm] = useState(initial)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [isPending, start] = useTransition()

  function set<K extends keyof Profile>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFieldErrors({})
    start(async () => {
      const res = await updateProfileAction({
        name: form.name,
        phone: form.phone,
        address: form.address,
        city: form.city,
        country: form.country,
        postalCode: form.postalCode,
        nationality: form.nationality,
      })
      if (!res.ok) {
        setFieldErrors(res.fieldErrors ?? {})
        toast.error(res.error ?? 'Could not save profile.')
        return
      }
      toast.success('Profile updated.')
      router.refresh()
    })
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <div className="grid gap-1.5">
        <Label htmlFor="name">Full name</Label>
        <Input id="name" value={form.name} onChange={(e) => set('name', e.target.value)} aria-invalid={!!fieldErrors.name} required />
        {fieldErrors.name && <p className="text-xs text-destructive">{fieldErrors.name}</p>}
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" value={form.email} disabled />
        <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="nationality">Nationality</Label>
          <Input id="nationality" value={form.nationality} onChange={(e) => set('nationality', e.target.value)} />
        </div>
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="address">Address</Label>
        <Input id="address" value={form.address} onChange={(e) => set('address', e.target.value)} />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="grid gap-1.5">
          <Label htmlFor="city">City</Label>
          <Input id="city" value={form.city} onChange={(e) => set('city', e.target.value)} />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="country">Country</Label>
          <Input id="country" value={form.country} onChange={(e) => set('country', e.target.value)} />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="postalCode">Postal code</Label>
          <Input id="postalCode" value={form.postalCode} onChange={(e) => set('postalCode', e.target.value)} />
        </div>
      </div>

      <div>
        <Button type="submit" disabled={isPending}>
          {isPending ? <Loader2 className="size-4 animate-spin" /> : 'Save changes'}
        </Button>
      </div>
    </form>
  )
}
