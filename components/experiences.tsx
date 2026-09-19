'use client'

import Image from 'next/image'
import { MapPin, Clock } from 'lucide-react'
import { useI18n } from '@/components/site-providers'
import { SectionHeading } from '@/components/section-heading'
import { Reveal } from '@/components/reveal'
import { experiences } from '@/lib/content'

export function Experiences() {
  const { t } = useI18n()

  return (
    <section id="experiences" className="bg-secondary/40 py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionHeading
          eyebrow={t('exp.eyebrow', 'Experiences')}
          title={t('exp.title', 'Discover Lumbini & beyond')}
          subtitle={t('exp.subtitle', 'Sacred sites, city life and easy connections — all within reach.')}
        />

        <div className="mt-14 grid gap-7 sm:grid-cols-2 lg:grid-cols-4">
          {experiences.map((exp, i) => (
            <Reveal key={exp.id} delay={i * 110}>
              <article className="lift group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                <div className="zoom-img relative aspect-[4/3] w-full overflow-hidden">
                  <Image
                    src={exp.image || '/placeholder.svg'}
                    alt={t(exp.nameKey, exp.fallbackName)}
                    fill
                    loading="lazy"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="font-serif text-lg font-semibold text-card-foreground">
                    {t(exp.nameKey, exp.fallbackName)}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {t(exp.descriptionKey, exp.fallbackDescription)}
                  </p>
                  <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <MapPin size={13} className="text-primary" aria-hidden />
                      {exp.distanceKm} km
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock size={13} className="text-primary" aria-hidden />
                      {exp.driveMinutes} {t('location.drive', 'min drive')}
                    </span>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
