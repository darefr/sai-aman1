'use client'

import { useState, useTransition } from 'react'
import { CreditCard, Loader2, ShieldCheck, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { formatMoney } from '@/lib/pricing'
import { initiatePaymentAction } from '@/app/actions/payment'
import type { PaymentProviderId } from '@/lib/payments/types'

type Provider = { id: PaymentProviderId; label: string; live: boolean }

export function PaymentPanel({
  reference,
  amount,
  currency,
  providers,
  initialError,
}: {
  reference: string
  amount: number
  currency: string
  providers: Provider[]
  initialError?: string
}) {
  const [selected, setSelected] = useState<PaymentProviderId>(providers[0]?.id ?? 'mock')
  const [error, setError] = useState<string | null>(initialError ?? null)
  const [isPending, start] = useTransition()

  function pay() {
    setError(null)
    start(async () => {
      const res = await initiatePaymentAction({ reference, providerId: selected })
      if (!res.ok) {
        setError(res.error)
        return
      }
      if (res.kind === 'form' && res.fields) {
        // Auto-submit a POST form to the gateway (e.g. eSewa).
        const form = document.createElement('form')
        form.method = 'POST'
        form.action = res.url
        for (const [key, value] of Object.entries(res.fields)) {
          const input = document.createElement('input')
          input.type = 'hidden'
          input.name = key
          input.value = value
          form.appendChild(input)
        }
        document.body.appendChild(form)
        form.submit()
        return
      }
      window.location.href = res.url
    })
  }

  return (
    <Card className="p-6 md:p-8">
      <div className="flex items-center gap-2">
        <CreditCard className="size-5 text-primary" />
        <h2 className="font-serif text-2xl font-semibold">Choose a payment method</h2>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Booking <span className="font-medium text-foreground">{reference}</span> · Amount due{' '}
        <span className="font-semibold text-primary">{formatMoney(amount, currency)}</span>
      </p>

      <div className="mt-6 grid gap-3">
        {providers.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setSelected(p.id)}
            aria-pressed={selected === p.id}
            className={cn(
              'flex items-center justify-between rounded-xl border p-4 text-left transition-colors',
              selected === p.id ? 'border-primary bg-accent/40 ring-1 ring-primary' : 'border-border hover:bg-muted',
            )}
          >
            <span className="flex items-center gap-3">
              <span
                className={cn(
                  'flex size-4 items-center justify-center rounded-full border',
                  selected === p.id ? 'border-primary' : 'border-muted-foreground/40',
                )}
              >
                {selected === p.id && <span className="size-2 rounded-full bg-primary" />}
              </span>
              <span className="font-medium">{p.label}</span>
            </span>
            {p.live ? (
              <Badge variant="success">Live</Badge>
            ) : (
              <Badge variant="muted">{p.id === 'mock' ? 'Sandbox' : 'Test mode'}</Badge>
            )}
          </button>
        ))}
      </div>

      {error && (
        <p className="mt-4 flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
          <AlertCircle className="size-4 shrink-0" /> {error}
        </p>
      )}

      <Button size="lg" className="mt-6 w-full" onClick={pay} disabled={isPending}>
        {isPending ? (
          <>
            <Loader2 className="size-4 animate-spin" /> Redirecting…
          </>
        ) : (
          <>Pay {formatMoney(amount, currency)}</>
        )}
      </Button>

      <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
        <ShieldCheck className="size-3.5" /> Payments are processed securely. We never store your card details.
      </p>
    </Card>
  )
}
