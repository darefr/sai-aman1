import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RoomsTable } from '@/components/admin/rooms-table'
import { getAllRoomsAdmin } from '@/lib/data'

export const dynamic = 'force-dynamic'

export default async function AdminRoomsPage() {
  const rooms = await getAllRoomsAdmin()
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl font-semibold">Rooms</h1>
          <p className="mt-1 text-muted-foreground">Manage room types, pricing, inventory and availability.</p>
        </div>
        <Link href="/admin/rooms/new">
          <Button>
            <Plus className="size-4" /> Add room
          </Button>
        </Link>
      </div>

      <Card className="mt-6">
        <CardContent className="pt-6">
          <RoomsTable rooms={rooms} />
        </CardContent>
      </Card>
    </div>
  )
}
