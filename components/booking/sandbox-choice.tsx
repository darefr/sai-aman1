'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, CheckCircle2, XCircle, FlaskConical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { formatMoney } from '@/lib/pricing'

/**
 * Safe sandbox payment screen. Shown only when no live gateway is configured.
 * It clearly states no real money moves and lets the guest simulate an outcome.
 */
export function SandboxChoice({
  reference,
  txn,
  amount,
  currency,
}: {
  reference: string
  txn: string
  amount: number
  currency: string
}) {
  const router = useRouter()
  const [loading, setLoading] = useState<'success' | 'cancel' | null>(null)

  function go(outcome: 'success' | 'cancel') {
    setLoading(outcome)
    const url = `/booking/${reference}/verify?provider=mock&txn=${encodeURIComponent(txn)}&outcome=${outcome}`
    router.push(url)
  }

  return (
    <div className="mx-auto max-w-lg px-5 py-16">
      <Card className="p-8 text-center">
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-accent">
          <FlaskConical className="size-7 text-primary" />
        </div>
        <h1 className="font-serif text-2xl font-semibold">Sandbox payment</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          No real payment gateway is configured, so this is a safe test checkout. No money will be charged.
        </p>
        <p className="mt-4 text-sm">
          Booking <span className="font-medium">{reference}</span> · Amount{' '}
          <span className="font-semibold text-primary">{formatMoney(amount, currency)}</span>
        </p>

        <div className="mt-6 grid gap-3">
          <Button size="lg" onClick={() => go('success')} disabled={loading !== null}>
            {loading === 'success' ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <CheckCircle2 className="size-4" />
            )}
            Simulate successful payment
          </Button>
          <Button size="lg" variant="outline" onClick={() => go('cancel')} disabled={loading !== null}>
            {loading === 'cancel' ? <Loader2 className="size-4 animate-spin" /> : <XCircle className="size-4" />}
            Simulate cancelled payment
          </Button>
        </div>
      </Card>
    </div>
  )
}
