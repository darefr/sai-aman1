import { ReviewsManager } from '@/components/admin/reviews-manager'
import { getAllReviews } from '@/lib/admin-data'

export const dynamic = 'force-dynamic'

export default async function AdminReviewsPage() {
  const reviews = await getAllReviews()
  return (
    <div>
      <h1 className="font-serif text-3xl font-semibold">Reviews</h1>
      <p className="mt-1 text-muted-foreground">Moderate guest testimonials shown on the site.</p>
      <div className="mt-6">
        <ReviewsManager reviews={reviews} />
      </div>
    </div>
  )
}
