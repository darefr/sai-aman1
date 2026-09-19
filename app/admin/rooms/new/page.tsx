import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { RoomForm } from '@/components/admin/room-form'

export const dynamic = 'force-dynamic'

export default function NewRoomPage() {
  return (
    <div>
      <Link href="/admin/rooms" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Back to rooms
      </Link>
      <h1 className="font-serif text-3xl font-semibold">Add room</h1>
      <Card className="mt-6">
        <CardContent className="pt-6">
          <RoomForm
            initial={{
              slug: '',
              name: '',
              description: '',
              beds: '',
              maxGuests: 2,
              sizeSqm: 20,
              pricePerNight: 3000,
              totalUnits: 1,
              amenities: [],
              featured: false,
              active: true,
              sortOrder: 0,
              gallery: [],
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}
