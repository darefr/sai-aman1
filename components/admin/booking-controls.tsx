'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Select } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { updateBookingStatusAction, updatePaymentStatusAction } from '@/app/actions/admin'
import type { BookingStatus, PaymentStatus } from '@/lib/db/schema'

export function BookingControls({
  bookingId,
  status,
  paymentStatus,
}: {
  bookingId: string
  status: BookingStatus
  paymentStatus: PaymentStatus
}) {
  const router = useRouter()
  const [isPending, start] = useTransition()

  function changeStatus(value: string) {
    start(async () => {
      const res = await updateBookingStatusAction(bookingId, value as BookingStatus)
      if (!res.ok) {
        toast.error(res.error ?? 'Update failed.')
        return
      }
      toast.success('Booking status updated.')
      router.refresh()
    })
  }

  function changePayment(value: string) {
    start(async () => {
      const res = await updatePaymentStatusAction(bookingId, value as PaymentStatus)
      if (!res.ok) {
        toast.error(res.error ?? 'Update failed.')
        return
      }
      toast.success('Payment status updated.')
      router.refresh()
    })
  }

  return (
    <div className="grid gap-4">
      <div className="grid gap-1.5">
        <Label htmlFor="statusSel">Booking status {isPending && <Loader2 className="size-3 animate-spin" />}</Label>
        <Select id="statusSel" defaultValue={status} onChange={(e) => changeStatus(e.target.value)} disabled={isPending}>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </Select>
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="paySel">Payment status</Label>
        <Select id="paySel" defaultValue={paymentStatus} onChange={(e) => changePayment(e.target.value)} disabled={isPending}>
          <option value="unpaid">Unpaid</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </Select>
      </div>
    </div>
  )
}
