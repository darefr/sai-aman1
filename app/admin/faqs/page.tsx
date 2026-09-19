import { FaqManager } from '@/components/admin/faq-manager'
import { getAllFaqs } from '@/lib/admin-data'

export const dynamic = 'force-dynamic'

export default async function AdminFaqsPage() {
  const faqs = await getAllFaqs()
  return (
    <div>
      <h1 className="font-serif text-3xl font-semibold">FAQs</h1>
      <p className="mt-1 text-muted-foreground">Manage frequently asked questions.</p>
      <div className="mt-6">
        <FaqManager faqs={faqs} />
      </div>
    </div>
  )
}
