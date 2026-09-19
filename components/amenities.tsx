'use client'

import {
  Wifi,
  CircleParking,
  UtensilsCrossed,
  Users,
  Sun,
  CigaretteOff,
  Sparkles,
  Clock,
  type LucideIcon,
} from 'lucide-react'
import { Reveal } from '@/components/reveal'
import { useI18n } from '@/components/site-providers'
import { amenities } from '@/lib/content'

const icons: Record<string, LucideIcon> = {
  Wifi,
  CircleParking,
  UtensilsCrossed,
  Users,
  Sun,
  CigaretteOff,
  Sparkles,
  Clock,
}

export function Amenities() {
  const { t } = useI18n()

  return (
    <section id="amenities" className="scroll-mt-20 bg-background py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
            {t('amenities.eyebrow', 'Facilities')}
          </span>
          <h2 className="mt-4 text-balance font-serif text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
            {t('amenities.title', 'Everything you need for an easy stay')}
          </h2>
        </Reveal>

        <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {amenities.map((a, i) => {
            const Icon = icons[a.icon] ?? Sparkles
            return (
              <Reveal key={a.id} delay={i * 70}>
                <div className="lift group flex h-full flex-col items-center gap-4 rounded-2xl border border-border bg-card p-7 text-center hover:border-primary/40 hover:shadow-lg">
                  <span className="flex size-14 items-center justify-center rounded-full bg-accent text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon size={24} />
                  </span>
                  <span className="text-sm font-medium text-foreground">{t(a.labelKey, a.fallbackLabel)}</span>
                </div>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
