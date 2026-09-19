'use client'

import { MapPin, Navigation, Plane, Landmark as LandmarkIcon, Bus } from 'lucide-react'
import { Reveal } from '@/components/reveal'
import { useI18n } from '@/components/site-providers'
import { hotel, landmarks } from '@/lib/content'

const landmarkIcons: Record<string, typeof MapPin> = {
  buspark: Bus,
  airport: Plane,
  mayadevi: LandmarkIcon,
  lumbini: LandmarkIcon,
}

export function Location() {
  const { t } = useI18n()

  return (
    <section id="location" className="scroll-mt-20 bg-secondary/40 py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
            {t('location.eyebrow', 'Find Us')}
          </span>
          <h2 className="mt-4 text-balance font-serif text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
            {t('location.title', 'Perfectly placed in Butwal')}
          </h2>
          <p className="mt-5 text-pretty text-lg leading-relaxed text-muted-foreground">
            {t('location.subtitle', 'Moments from the bus park, minutes from the highway, and within easy reach of Lumbini.')}
          </p>
        </Reveal>

        <div className="mt-14 grid gap-8 lg:grid-cols-5">
          <Reveal className="lg:col-span-3">
            <div className="overflow-hidden rounded-2xl border border-border shadow-sm">
              <iframe
                title="Map showing Hotel Sai Aman at New Bus Park, Butwal"
                src={hotel.mapEmbedUrl}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-[320px] w-full sm:h-[460px]"
              />
            </div>
          </Reveal>

          <Reveal delay={120} className="lg:col-span-2">
            <div className="flex h-full flex-col rounded-2xl border border-border bg-card p-7">
              <div className="flex items-start gap-3">
                <MapPin size={22} className="mt-0.5 shrink-0 text-primary" />
                <p className="text-sm leading-relaxed text-foreground">
                  {hotel.contact.address}, {hotel.contact.city}, {hotel.contact.province}, {hotel.contact.country}
                </p>
              </div>

              <ul className="mt-7 flex flex-col gap-4">
                {landmarks.map((l) => {
                  const Icon = landmarkIcons[l.id] ?? MapPin
                  return (
                    <li key={l.id} className="flex items-center gap-3 border-b border-border pb-4 last:border-0 last:pb-0">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent text-primary">
                        <Icon size={18} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">{t(l.nameKey, l.fallbackName)}</p>
                        <p className="text-xs text-muted-foreground">
                          {l.distanceKm} km {t('location.away', 'away')} · {l.driveMinutes} {t('location.drive', 'min drive')}
                        </p>
                      </div>
                    </li>
                  )
                })}
              </ul>

              <a
                href={hotel.mapLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-7 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.03]"
              >
                <Navigation size={16} />
                {t('location.directions', 'Get Directions')}
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
