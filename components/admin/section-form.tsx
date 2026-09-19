'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { saveContentAction, saveSettingAction } from '@/app/actions/admin'

export type Field = {
  name: string
  label: string
  type?: 'text' | 'textarea' | 'number' | 'boolean'
  help?: string
}

/**
 * Generic editor for a single JSON-backed content or settings block.
 * `target` selects which server action to use.
 */
export function SectionForm({
  title,
  description,
  target,
  storeKey,
  fields,
  initial,
}: {
  title: string
  description?: string
  target: 'content' | 'setting'
  storeKey: string
  fields: Field[]
  initial: Record<string, unknown>
}) {
  const router = useRouter()
  const [values, setValues] = useState<Record<string, unknown>>(() => {
    const v: Record<string, unknown> = {}
    for (const f of fields) v[f.name] = initial[f.name] ?? (f.type === 'boolean' ? false : f.type === 'number' ? 0 : '')
    return v
  })
  const [isPending, start] = useTransition()

  function set(name: string, value: unknown) {
    setValues((v) => ({ ...v, [name]: value }))
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    start(async () => {
      // Preserve any keys not represented by fields (e.g. nested arrays).
      const payload = { ...initial, ...values }
      const res =
        target === 'content'
          ? await saveContentAction(storeKey, payload)
          : await saveSettingAction(storeKey, payload)
      if (!res.ok) {
        toast.error(res.error ?? 'Could not save.')
        return
      }
      toast.success('Saved.')
      router.refresh()
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="grid gap-4">
          {fields.map((f) => (
            <div key={f.name} className="grid gap-1.5">
              {f.type === 'boolean' ? (
                <label className="flex items-center gap-2 text-sm font-medium">
                  <input
                    type="checkbox"
                    checked={Boolean(values[f.name])}
                    onChange={(e) => set(f.name, e.target.checked)}
                    className="size-4"
                  />
                  {f.label}
                </label>
              ) : (
                <>
                  <Label htmlFor={`${storeKey}-${f.name}`}>{f.label}</Label>
                  {f.type === 'textarea' ? (
                    <Textarea
                      id={`${storeKey}-${f.name}`}
                      value={String(values[f.name] ?? '')}
                      onChange={(e) => set(f.name, e.target.value)}
                    />
                  ) : (
                    <Input
                      id={`${storeKey}-${f.name}`}
                      type={f.type === 'number' ? 'number' : 'text'}
                      value={String(values[f.name] ?? '')}
                      onChange={(e) => set(f.name, f.type === 'number' ? Number(e.target.value) : e.target.value)}
                    />
                  )}
                </>
              )}
              {f.help && <p className="text-xs text-muted-foreground">{f.help}</p>}
            </div>
          ))}
          <div>
            <Button type="submit" disabled={isPending}>
              {isPending ? <Loader2 className="size-4 animate-spin" /> : 'Save'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
