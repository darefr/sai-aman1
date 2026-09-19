import { Card, CardContent } from '@/components/ui/card'
import { CustomersTable } from '@/components/admin/customers-table'
import { getCustomers } from '@/lib/admin-data'
import { requireAdmin } from '@/lib/session'

export const dynamic = 'force-dynamic'

export default async function AdminCustomersPage() {
  const admin = await requireAdmin()
  const customers = await getCustomers()

  return (
    <div>
      <h1 className="font-serif text-3xl font-semibold">Customers</h1>
      <p className="mt-1 text-muted-foreground">Manage guest accounts, roles and access.</p>

      <Card className="mt-6">
        <CardContent className="pt-6">
          <CustomersTable
            customers={customers.map((c) => ({ ...c, bookingCount: Number(c.bookingCount) }))}
            canManage={admin.role === 'admin'}
          />
        </CardContent>
      </Card>
    </div>
  )
}
