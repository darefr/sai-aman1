import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RoomForm } from '@/components/admin/room-form'
import { RoomBlocks } from '@/components/admin/room-blocks'
import { getRoomById } from '@/lib/data'
import { getRoomBlocks } from '@/lib/admin-data'

export const dynamic = 'force-dynamic'

export default async function EditRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const room = await getRoomById(id)
  if (!room) notFound()
  const blocks = await getRoomBlocks(id)

  return (
    <div>
      <Link href="/admin/rooms" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Back to rooms
      </Link>
      <h1 className="font-serif text-3xl font-semibold">Edit room</h1>

      <div className="mt-6 grid gap-6">
        <Card>
          <CardContent className="pt-6">
            <RoomForm
              roomId={room.id}
              initial={{
                slug: room.slug,
                name: room.name,
                description: room.description,
                beds: room.beds,
                maxGuests: room.maxGuests,
                sizeSqm: room.sizeSqm,
                pricePerNight: Number(room.pricePerNight),
                totalUnits: room.totalUnits,
                amenities: room.amenities ?? [],
                featured: room.featured,
                active: room.active,
                sortOrder: room.sortOrder,
                gallery: room.gallery ?? [],
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Blocked dates &amp; maintenance</CardTitle>
          </CardHeader>
          <CardContent>
            <RoomBlocks roomId={room.id} blocks={blocks} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
