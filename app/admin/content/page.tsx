import { SectionForm } from '@/components/admin/section-form'
import { getContent } from '@/lib/data'

export const dynamic = 'force-dynamic'

export default async function AdminContentPage() {
  const [hero, contact, policies, footer] = await Promise.all([
    getContent<Record<string, unknown>>('hero', {}),
    getContent<Record<string, unknown>>('contact', {}),
    getContent<Record<string, unknown>>('policies', {}),
    getContent<Record<string, unknown>>('footer', {}),
  ])

  return (
    <div>
      <h1 className="font-serif text-3xl font-semibold">Site content</h1>
      <p className="mt-1 text-muted-foreground">
        Edit homepage and site content. The visual design stays exactly the same.
      </p>

      <div className="mt-6 grid gap-6">
        <SectionForm
          title="Hero"
          description="The main headline shown at the top of the homepage."
          target="content"
          storeKey="hero"
          initial={hero}
          fields={[
            { name: 'title', label: 'Headline' },
            { name: 'subtitle', label: 'Subtitle', type: 'textarea' },
            { name: 'ctaLabel', label: 'Primary button label' },
          ]}
        />

        <SectionForm
          title="Contact details"
          target="content"
          storeKey="contact"
          initial={contact}
          fields={[
            { name: 'phone', label: 'Phone' },
            { name: 'email', label: 'Email' },
            { name: 'address', label: 'Address' },
            { name: 'city', label: 'City' },
            { name: 'province', label: 'Province' },
            { name: 'country', label: 'Country' },
            { name: 'postalCode', label: 'Postal code' },
          ]}
        />

        <SectionForm
          title="Hotel policies"
          target="content"
          storeKey="policies"
          initial={policies}
          fields={[
            { name: 'checkIn', label: 'Check-in time' },
            { name: 'checkOut', label: 'Check-out time' },
            { name: 'cancellation', label: 'Cancellation policy', type: 'textarea' },
            { name: 'children', label: 'Children policy', type: 'textarea' },
            { name: 'pets', label: 'Pets policy' },
            { name: 'smoking', label: 'Smoking policy' },
          ]}
        />

        <SectionForm
          title="Footer"
          target="content"
          storeKey="footer"
          initial={footer}
          fields={[{ name: 'tagline', label: 'Tagline' }]}
        />
      </div>
    </div>
  )
}
