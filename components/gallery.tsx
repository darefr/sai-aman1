'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { useI18n } from '@/components/site-providers'
import { SectionHeading } from '@/components/section-heading'
import { SectionCta } from '@/components/section-cta'
import { Reveal } from '@/components/reveal'
import { Lightbox, type LightboxItem } from '@/components/lightbox'
import { gallery, galleryCategories, type GalleryCategory } from '@/lib/content'

export function Gallery({ viewAllHref }: { viewAllHref?: string }) {
  const { t } = useI18n()
  const [filter, setFilter] = useState<GalleryCategory | 'all'>('all')
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const filtered = useMemo(
    () => (filter === 'all' ? gallery : gallery.filter((g) => g.category === filter)),
    [filter],
  )

  const lightboxItems: LightboxItem[] = filtered.map((g) => ({
    src: g.src,
    caption: t(g.captionKey, g.fallbackCaption),
  }))

  return (
    <section id="gallery" className="bg-secondary/40 py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionHeading
          eyebrow={t('gallery.eyebrow', 'Gallery')}
          title={t('gallery.title', 'A glimpse of Hotel Sai Aman')}
          subtitle={t('gallery.subtitle', 'Explore our rooms, dining, terrace and more.')}
        />

        {/* Category filters */}
        <Reveal delay={120}>
          <div className="mt-10 flex flex-wrap justify-center gap-2.5" role="tablist" aria-label="Gallery categories">
            {galleryCategories.map((cat) => {
              const activeCat = filter === cat.id
              return (
                <button
                  key={cat.id}
                  role="tab"
                  aria-selected={activeCat}
                  type="button"
                  onClick={() => setFilter(cat.id)}
                  className={cn(
                    'rounded-full border px-4 py-2 text-sm font-medium transition-all duration-300',
                    activeCat
                      ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                      : 'border-border bg-background text-foreground/70 hover:border-primary/50 hover:text-primary',
                  )}
                >
                  {t(cat.labelKey, cat.fallbackLabel)}
                </button>
              )
            })}
          </div>
        </Reveal>

        {/* Masonry grid */}
        <div className="mt-12 columns-1 gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4">
          {filtered.map((img, i) => (
            <Reveal key={img.id} delay={(i % 3) * 90} className="break-inside-avoid">
              <button
                type="button"
                onClick={() => setLightboxIndex(i)}
                className="zoom-img group block w-full overflow-hidden rounded-xl border border-border bg-card text-left shadow-sm outline-none ring-primary/50 focus-visible:ring-2"
                aria-label={t(img.captionKey, img.fallbackCaption)}
              >
                <div
                  className={cn(
                    'relative w-full',
                    img.aspect === 'portrait' && 'aspect-[3/4]',
                    img.aspect === 'landscape' && 'aspect-[4/3]',
                    img.aspect === 'square' && 'aspect-square',
                  )}
                >
                  <Image
                    src={img.src || '/placeholder.svg'}
                    alt={t(img.captionKey, img.fallbackCaption)}
                    fill
                    loading="lazy"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover"
                  />
                  <span className="pointer-events-none absolute inset-0 flex items-end bg-gradient-to-t from-black/60 via-transparent to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <span className="text-sm font-medium text-white">{t(img.captionKey, img.fallbackCaption)}</span>
                  </span>
                </div>
              </button>
            </Reveal>
          ))}
        </div>

        {viewAllHref && <SectionCta href={viewAllHref} label={t('gallery.viewAll', 'Open full gallery')} />}
      </div>

      <Lightbox
        items={lightboxItems}
        index={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onNavigate={setLightboxIndex}
      />
    </section>
  )
}
