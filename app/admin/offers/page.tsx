import { OfferManager } from '@/components/admin/offer-manager'
import { getAllOffers } from '@/lib/admin-data'

export const dynamic = 'force-dynamic'

export default async function AdminOffersPage() {
  const offers = await getAllOffers()
  return (
    <div>
      <h1 className="font-serif text-3xl font-semibold">Offers</h1>
      <p className="mt-1 text-muted-foreground">Promote special packages on the homepage.</p>
      <div className="mt-6">
        <OfferManager offers={offers} />
      </div>
    </div>
  )
}
