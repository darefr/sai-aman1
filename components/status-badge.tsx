import { Badge } from '@/components/ui/badge'

const BOOKING_VARIANT: Record<string, React.ComponentProps<typeof Badge>['variant']> = {
  pending: 'warning',
  confirmed: 'success',
  completed: 'secondary',
  cancelled: 'destructive',
}

const PAYMENT_VARIANT: Record<string, React.ComponentProps<typeof Badge>['variant']> = {
  unpaid: 'muted',
  pending: 'warning',
  paid: 'success',
  failed: 'destructive',
  refunded: 'secondary',
}

export function BookingStatusBadge({ status }: { status: string }) {
  return <Badge variant={BOOKING_VARIANT[status] ?? 'muted'}>{capitalize(status)}</Badge>
}

export function PaymentStatusBadge({ status }: { status: string }) {
  return <Badge variant={PAYMENT_VARIANT[status] ?? 'muted'}>{capitalize(status)}</Badge>
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}
