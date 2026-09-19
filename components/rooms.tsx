'use client'

import Image from 'next/image'
import { useState } from 'react'
import {
  Bath,
  Wifi,
  PenLine,
  Layers,
  Snowflake,
  Tv,
  ConciergeBell,
  BedDouble,
  Users,
  Maximize,
  View,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { Reveal } from '@/components/reveal'
import { useI18n } from '@/components/site-providers'
import { Lightbox, type LightboxItem } from '@/components/lightbox'
import { rooms, formatMoney, type Room, type RoomAmenity } from '@/lib/content'
import { cn } from '@/lib/utils'

const amenityMeta: Record<RoomAmenity, { icon: typeof Bath; label: string }> = {
  'private-bathroom': { icon: Bath, label: 'Private bathroom' },
  'free-wifi': { icon: Wifi, label: 'Free WiFi' },
  desk: { icon: PenLine, label: 'Desk' },
  carpeting: { icon: Layers, label: 'Carpeting' },
  'air-conditioning': { icon: Snowflake, label: 'Air conditioning' },
  'flat-screen-tv': { icon: Tv, label: 'Flat-screen TV' },
  'room-service': { icon: ConciergeBell, label: 'Room service' },
}

export function Rooms() {
  const { t } = useI18n()

  return (
    <section id="rooms" className="scroll-mt-20 bg-secondary/40 py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
            {t('rooms.eyebrow', 'Stay With Us')}
          </span>
          <h2 className="mt-4 text-balance font-serif text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
            {t('rooms.title', 'Rooms designed for restful nights')}
          </h2>
          <p className="mt-5 text-pretty text-lg leading-relaxed text-muted-foreground">
            {t('rooms.subtitle', 'Every room is thoughtfully appointed with the essentials for a comfortable stay.')}
          </p>
        </Reveal>

        <div className="mt-14 grid gap-7 md:grid-cols-2 xl:grid-cols-3">
          {rooms.map((room, i) => (
            <Reveal key={room.id} delay={i * 130}>
              <RoomCard room={room} t={t} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function RoomCard({ room, t }: { room: Room; t: (key: string, fallback?: string) => string }) {
  const [index, setIndex] = useState(0)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const total = room.gallery.length
  const go = (dir: number) => setIndex((prev) => (prev + dir + total) % total)

  const lightboxItems: LightboxItem[] = room.gallery.map((img) => ({
    src: img.src,
    caption: t(img.altKey, img.fallbackAlt),
  }))

  return (
    <article className="lift group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm hover:shadow-2xl">
      <div className="relative aspect-[4/3] overflow-hidden">
        {room.gallery.map((img, i) => (
          <Image
            key={img.src}
            src={img.src || '/placeholder.svg'}
            alt={t(img.altKey, img.fallbackAlt)}
            fill
            loading="lazy"
            sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
            className={cn(
              'object-cover transition-opacity duration-700',
              i === index ? 'opacity-100' : 'opacity-0',
            )}
          />
        ))}

        {room.featured && (
          <span className="absolute left-4 top-4 z-10 rounded-full bg-gold px-3 py-1 text-xs font-semibold text-gold-foreground">
            {t('rooms.featured', 'Air Conditioned')}
          </span>
        )}

        {/* Open the full gallery lightbox on the current image */}
        <button
          type="button"
          onClick={() => setLightboxIndex(index)}
          aria-label={t('rooms.viewGallery', 'View gallery')}
          className="absolute right-3 top-3 z-10 flex size-8 items-center justify-center rounded-full bg-black/40 text-white opacity-0 backdrop-blur-sm transition-opacity hover:bg-black/60 group-hover:opacity-100"
        >
          <Maximize size={16} />
        </button>

        {/* Gallery controls */}
        {total > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous photo"
              onClick={() => go(-1)}
              className="absolute left-2 top-1/2 z-10 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white opacity-0 backdrop-blur-sm transition-opacity hover:bg-black/60 group-hover:opacity-100"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              aria-label="Next photo"
              onClick={() => go(1)}
              className="absolute right-2 top-1/2 z-10 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white opacity-0 backdrop-blur-sm transition-opacity hover:bg-black/60 group-hover:opacity-100"
            >
              <ChevronRight size={18} />
            </button>
            <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
              {room.gallery.map((img, i) => (
                <button
                  key={img.src}
                  type="button"
                  aria-label={`Show photo ${i + 1}`}
                  onClick={() => setIndex(i)}
                  className={cn(
                    'h-1.5 rounded-full transition-all',
                    i === index ? 'w-5 bg-white' : 'w-1.5 bg-white/50',
                  )}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-serif text-2xl font-semibold">{t(room.nameKey, room.fallbackName)}</h3>
          <div className="text-right">
            <p className="font-serif text-xl font-semibold text-primary">{formatMoney(room.pricePerNight)}</p>
            <p className="text-[0.7rem] uppercase tracking-wider text-muted-foreground">
              {t('rooms.perNight', 'per night')}
            </p>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <BedDouble size={15} className="text-primary" />
            {room.beds}
          </span>
          <span className="flex items-center gap-1.5">
            <Users size={15} className="text-primary" />
            {room.maxGuests} {t('rooms.guests', 'guests')}
          </span>
          <span className="flex items-center gap-1.5">
            <Maximize size={15} className="text-primary" />
            {room.sizeSqm} m²
          </span>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          {t(room.descriptionKey, room.fallbackDescription)}
        </p>

        <ul className="mt-5 grid grid-cols-2 gap-x-4 gap-y-2.5">
          {room.amenities.map((key) => {
            const meta = amenityMeta[key]
            const Icon = meta.icon
            return (
              <li key={key} className="flex items-center gap-2 text-sm text-foreground/80">
                <Icon size={15} className="shrink-0 text-gold" />
                {meta.label}
              </li>
            )
          })}
        </ul>

        <p className="mt-5 text-xs font-medium text-primary">
          {room.availableRooms} {t('rooms.available', 'rooms available')}
        </p>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <a
            href="#contact"
            className="flex-1 rounded-full bg-primary px-5 py-2.5 text-center text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.03]"
          >
            {t('rooms.reserve', 'Reserve this room')}
          </a>
          {/* TODO(MEDIA): link room.virtualTourUrl to a real 360°/Matterport tour. */}
          <button
            type="button"
            disabled={!room.virtualTourUrl}
            title={room.virtualTourUrl ? undefined : t('rooms.tourSoon', '360° tour coming soon')}
            className="flex items-center justify-center gap-1.5 rounded-full border border-primary px-5 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-primary"
          >
            <View size={16} />
            {t('rooms.tour', 'Virtual Tour')}
          </button>
        </div>
      </div>

      <Lightbox
        items={lightboxItems}
        index={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onNavigate={setLightboxIndex}
      />
    </article>
  )
}
