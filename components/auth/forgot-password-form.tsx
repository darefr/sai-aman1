'use client'

import { useState, useTransition } from 'react'
import { Loader2, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authClient } from '@/lib/auth-client'

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [isPending, start] = useTransition()

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    start(async () => {
      // Always show success to avoid revealing whether an email is registered.
      await authClient.requestPasswordReset({ email, redirectTo: '/reset-password' }).catch(() => {})
      setSent(true)
    })
  }

  if (sent) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 text-center">
        <CheckCircle2 className="mx-auto mb-3 size-8 text-emerald-600" />
        <p className="font-medium">Check your email</p>
        <p className="mt-1 text-sm text-muted-foreground">
          If an account exists for {email}, we&apos;ve sent a link to reset your password.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <div className="grid gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <Button type="submit" size="lg" disabled={isPending}>
        {isPending ? <Loader2 className="size-4 animate-spin" /> : 'Send reset link'}
      </Button>
    </form>
  )
}
