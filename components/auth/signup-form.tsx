'use client'

import { useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signUp } from '@/lib/auth-client'

export function SignupForm() {
  const router = useRouter()
  const params = useSearchParams()
  const redirectTo = params.get('redirect') || '/account'

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, start] = useTransition()

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    start(async () => {
      const { error } = await signUp.email({ name, email, password })
      if (error) {
        setError(error.message?.includes('exist') ? 'An account with this email already exists.' : 'Could not create your account. Please try again.')
        return
      }
      toast.success('Account created. Please check your email to verify your address.')
      router.push(redirectTo)
      router.refresh()
    })
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <div className="grid gap-1.5">
        <Label htmlFor="name">Full name</Label>
        <Input id="name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={8}
          required
        />
        <p className="text-xs text-muted-foreground">At least 8 characters.</p>
      </div>

      {error && (
        <p className="flex items-center gap-2 text-sm text-destructive" role="alert">
          <AlertCircle className="size-4" /> {error}
        </p>
      )}

      <Button type="submit" size="lg" disabled={isPending}>
        {isPending ? <Loader2 className="size-4 animate-spin" /> : 'Create account'}
      </Button>
    </form>
  )
}
