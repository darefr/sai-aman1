'use client'

import { useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authClient } from '@/lib/auth-client'

export function ResetPasswordForm() {
  const router = useRouter()
  const params = useSearchParams()
  const token = params.get('token') ?? ''
  const invalid = !token || params.get('error') === 'INVALID_TOKEN'

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, start] = useTransition()

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (password.length < 8) return setError('Password must be at least 8 characters.')
    if (password !== confirm) return setError('Passwords do not match.')
    start(async () => {
      const { error } = await authClient.resetPassword({ newPassword: password, token })
      if (error) {
        setError('This reset link is invalid or has expired. Please request a new one.')
        return
      }
      toast.success('Password updated. Please sign in.')
      router.push('/login')
    })
  }

  if (invalid) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 text-center">
        <AlertCircle className="mx-auto mb-3 size-8 text-destructive" />
        <p className="font-medium">Invalid or expired link</p>
        <p className="mt-1 text-sm text-muted-foreground">Please request a new password reset link.</p>
        <Button className="mt-4" onClick={() => router.push('/forgot-password')}>
          Request new link
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <div className="grid gap-1.5">
        <Label htmlFor="password">New password</Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={8}
          required
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="confirm">Confirm password</Label>
        <Input
          id="confirm"
          type="password"
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          minLength={8}
          required
        />
      </div>
      {error && (
        <p className="flex items-center gap-2 text-sm text-destructive" role="alert">
          <AlertCircle className="size-4" /> {error}
        </p>
      )}
      <Button type="submit" size="lg" disabled={isPending}>
        {isPending ? <Loader2 className="size-4 animate-spin" /> : 'Update password'}
      </Button>
    </form>
  )
}
