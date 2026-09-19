'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { cancelMyBookingAction } from '@/app/actions/booking'

export function CancelBookingButton({ reference }: { reference: string }) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [isPending, start] = useTransition()

  function cancel() {
    start(async () => {
      const res = await cancelMyBookingAction(reference)
      if (!res.ok) {
        toast.error(res.error ?? 'Could not cancel booking.')
        setConfirming(false)
        return
      }
      toast.success('Booking cancelled.')
      router.refresh()
    })
  }

  if (!confirming) {
    return (
      <Button variant="destructive" onClick={() => setConfirming(true)}>
        <XCircle className="size-4" /> Cancel booking
      </Button>
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-muted-foreground">Are you sure?</span>
      <Button variant="destructive" onClick={cancel} disabled={isPending}>
        {isPending ? <Loader2 className="size-4 animate-spin" /> : 'Yes, cancel'}
      </Button>
      <Button variant="outline" onClick={() => setConfirming(false)} disabled={isPending}>
        Keep booking
      </Button>
    </div>
  )
}
