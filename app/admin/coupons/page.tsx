import { CouponManager } from '@/components/admin/coupon-manager'
import { getAllCoupons } from '@/lib/admin-data'

export const dynamic = 'force-dynamic'

export default async function AdminCouponsPage() {
  const coupons = await getAllCoupons()
  return (
    <div>
      <h1 className="font-serif text-3xl font-semibold">Coupons</h1>
      <p className="mt-1 text-muted-foreground">Create and manage discount codes.</p>
      <div className="mt-6">
        <CouponManager coupons={coupons} />
      </div>
    </div>
  )
}
