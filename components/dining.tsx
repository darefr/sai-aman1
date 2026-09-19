'use client'

import Image from 'next/image'
import { Clock, UtensilsCrossed } from 'lucide-react'
import { Reveal } from '@/components/reveal'
import { SectionCta } from '@/components/section-cta'
import { useI18n } from '@/components/site-providers'
import { dining } from '@/lib/content'

export function Dining({ viewAllHref }: { viewAllHref?: string }) {
  const { t } = useI18n()

  return (
    <section id="dining" className="scroll-mt-20 bg-secondary/40 py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
            {t('dining.eyebrow', 'Dining')}
          </span>
          <h2 className="mt-4 text-balance font-serif text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
            {t('dining.title', 'Flavours from Nepal and beyond')}
          </h2>
          <p className="mt-5 text-pretty text-lg leading-relaxed text-muted-foreground">
            {t('dining.subtitle', 'From hearty local breakfasts to sunset coffee on the terrace.')}
          </p>
        </Reveal>

        <div className="mt-14 grid gap-7 md:grid-cols-2">
          {dining.map((venue, i) => (
            <Reveal key={venue.id} delay={i * 130}>
              <article className="lift group relative h-80 overflow-hidden rounded-2xl border border-border sm:h-96">
                <Image
                  src={venue.image || '/placeholder.svg'}
                  alt={t(venue.nameKey, venue.fallbackName)}
                  fill
                  loading="lazy"
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-7 text-white">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur-sm">
                    <UtensilsCrossed size={13} className="text-gold" />
                    {t(venue.cuisineKey, venue.fallbackCuisine)}
                  </span>
                  <h3 className="mt-3 font-serif text-2xl font-semibold sm:text-3xl">
                    {t(venue.nameKey, venue.fallbackName)}
                  </h3>
                  <div className="mt-2 flex items-center gap-2 text-sm text-white/85">
                    <Clock size={15} className="text-gold" />
                    <span>
                      {t('dining.hours', 'Open')} {venue.hours}
                    </span>
                  </div>
                  {/* TODO(CMS): link to a full digital menu when available. */}
                  <p className="mt-3 text-xs uppercase tracking-widest text-gold">
                    {t('dining.menuSoon', 'Full menu coming soon')}
                  </p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        {viewAllHref && <SectionCta href={viewAllHref} label={t('dining.viewAll', 'Explore dining')} />}
      </div>
    </section>
  )
}
