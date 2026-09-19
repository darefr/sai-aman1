import { SectionForm } from '@/components/admin/section-form'
import { getPricingSettings, getBookingSettings, getSetting } from '@/lib/data'

export const dynamic = 'force-dynamic'

export default async function AdminSettingsPage() {
  const [pricing, booking, hotel] = await Promise.all([
    getPricingSettings(),
    getBookingSettings(),
    getSetting<Record<string, unknown>>('hotel'),
  ])

  return (
    <div>
      <h1 className="font-serif text-3xl font-semibold">Settings</h1>
      <p className="mt-1 text-muted-foreground">Taxes, fees, booking rules and hotel information.</p>

      <div className="mt-6 grid gap-6">
        <SectionForm
          title="Taxes & fees"
          description="Applied to every booking total."
          target="setting"
          storeKey="pricing"
          initial={pricing as unknown as Record<string, unknown>}
          fields={[
            { name: 'currency', label: 'Currency code' },
            { name: 'taxPercent', label: 'Tax %', type: 'number' },
            { name: 'serviceFeePercent', label: 'Service fee %', type: 'number' },
            { name: 'taxLabel', label: 'Tax label' },
            { name: 'serviceFeeLabel', label: 'Service fee label' },
          ]}
        />

        <SectionForm
          title="Booking rules"
          target="setting"
          storeKey="booking"
          initial={booking as unknown as Record<string, unknown>}
          fields={[
            { name: 'minNights', label: 'Minimum nights', type: 'number' },
            { name: 'maxNights', label: 'Maximum nights', type: 'number' },
            { name: 'maxGuestsPerBooking', label: 'Max guests per booking', type: 'number' },
            { name: 'checkInTime', label: 'Check-in time' },
            { name: 'checkOutTime', label: 'Check-out time' },
            { name: 'cancellationHours', label: 'Free cancellation window (hours)', type: 'number' },
            { name: 'allowGuestCheckout', label: 'Allow guest checkout (no account)', type: 'boolean' },
          ]}
        />

        <SectionForm
          title="Hotel information"
          description="Shown on invoices and receipts."
          target="setting"
          storeKey="hotel"
          initial={hotel ?? {}}
          fields={[
            { name: 'name', label: 'Hotel name' },
            { name: 'legalName', label: 'Legal name' },
            { name: 'phone', label: 'Phone' },
            { name: 'email', label: 'Email' },
            { name: 'address', label: 'Address' },
            { name: 'panVat', label: 'PAN/VAT number' },
          ]}
        />
      </div>
    </div>
  )
}
