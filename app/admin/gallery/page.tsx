import { GalleryManager } from '@/components/admin/gallery-manager'
import { getAllGallery } from '@/lib/admin-data'

export const dynamic = 'force-dynamic'

export default async function AdminGalleryPage() {
  const items = await getAllGallery()
  return (
    <div>
      <h1 className="font-serif text-3xl font-semibold">Gallery</h1>
      <p className="mt-1 text-muted-foreground">Manage the images shown in the gallery.</p>
      <div className="mt-6">
        <GalleryManager items={items} />
      </div>
    </div>
  )
}
