import { notFound, redirect } from 'next/navigation'
import { SiteShell } from '@/components/site-shell'
import { SandboxChoice } from '@/components/booking/sandbox-choice'
import { getBookingByReference } from '@/lib/bookings'
import { settleReturnAction } from '@/app/actions/payment'
import type { PaymentProviderId } from '@/lib/payments/types'
import { isDatabaseConfigured } from '@/lib/env'

export const dynamic = 'force-dynamic'

export default async function VerifyPage({
  params,
  searchParams,
}: {
  params: Promise<{ reference: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  if (!isDatabaseConfigured()) notFound()
  const { reference } = await params
  const sp = await searchParams

  const booking = await getBookingByReference(reference)
  if (!booking) notFound()

  const provider = (typeof sp.provider === 'string' ? sp.provider : 'mock') as PaymentProviderId
  const txn =
    (typeof sp.txn === 'string' && sp.txn) ||
    (typeof sp.transaction_uuid === 'string' && sp.transaction_uuid) ||
    (typeof sp.purchase_order_id === 'string' && sp.purchase_order_id) ||
    (typeof sp.PRN === 'string' && sp.PRN) ||
    ''

  if (!txn) redirect(`/booking/${reference}/pay?payment=failed`)

  // Sandbox: show the safe test screen until the guest picks an outcome.
  if (provider === 'mock' && !sp.outcome) {
    return (
      <SiteShell>
        <SandboxChoice
          reference={reference}
          txn={txn as string}
          amount={Number(booking.total)}
          currency={booking.currency}
        />
      </SiteShell>
    )
  }

  // Flatten gateway params to strings.
  const gatewayParams: Record<string, string> = {}
  for (const [k, v] of Object.entries(sp)) {
    if (typeof v === 'string') gatewayParams[k] = v
  }

  const result = await settleReturnAction({
    providerId: provider,
    transactionRef: txn as string,
    gatewayParams,
  })

  if (result.status === 'paid') {
    redirect(`/booking/${reference}/confirmation`)
  }
  redirect(`/booking/${reference}/pay?payment=failed`)
}
