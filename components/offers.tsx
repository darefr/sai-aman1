'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Clock } from 'lucide-react'
import { useI18n } from '@/components/site-providers'
import { SectionHeading } from '@/components/section-heading'
import { Reveal } from '@/components/reveal'
import { offers, formatMoney } from '@/lib/content'

type Remaining = { days: number; hours: number; mins: number; secs: number; expired: boolean }

function getRemaining(iso: string): Remaining {
  const diff = new Date(iso).getTime() - Date.now()
  if (diff <= 0) return { days: 0, hours: 0, mins: 0, secs: 0, expired: true }
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff / 3600000) % 24),
    mins: Math.floor((diff / 60000) % 60),
    secs: Math.floor((diff / 1000) % 60),
    expired: false,
  }
}

function Countdown({ iso }: { iso: string }) {
  const { t } = useI18n()
  // Start null to avoid hydration mismatch, then tick client-side.
  const [rem, setRem] = useState<Remaining | null>(null)

  useEffect(() => {
    setRem(getRemaining(iso))
    const id = setInterval(() => setRem(getRemaining(iso)), 1000)
    return () => clearInterval(id)
  }, [iso])

  if (!rem) {
    return <div className="h-6 w-40 skeleton rounded-md" aria-hidden />
  }

  if (rem.expired) {
    return <span className="text-sm font-medium text-destructive">{t('offers.expired', 'Offer ended')}</span>
  }

  const unit = (n: number, label: string) => (
    <span className="inline-flex items-baseline gap-0.5">
      <span className="font-serif text-lg font-semibold tabular-nums text-foreground">{String(n).padStart(2, '0')}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </span>
  )

  return (
    <div className="flex items-center gap-2">
      <Clock size={15} className="text-primary" aria-hidden />
      <span className="text-xs uppercase tracking-wider text-muted-foreground">{t('offers.ends', 'Ends in')}</span>
      <div className="flex items-center gap-2" aria-live="off">
        {unit(rem.days, t('offers.days', 'd'))}
        {unit(rem.hours, t('offers.hours', 'h'))}
        {unit(rem.mins, t('offers.mins', 'm'))}
        {unit(rem.secs, t('offers.secs', 's'))}
      </div>
    </div>
  )
}

export function Offers() {
  const { t } = useI18n()

  return (
    <section id="offers" className="bg-background py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionHeading
          eyebrow={t('offers.eyebrow', 'Special Offers')}
          title={t('offers.title', 'Seasonal packages & deals')}
          subtitle={t('offers.subtitle', 'Limited-time rates for a memorable stay in Butwal.')}
        />

        <div className="mt-14 grid gap-7 md:grid-cols-2 lg:grid-cols-3">
          {offers.map((offer, i) => (
            <Reveal key={offer.id} delay={i * 120}>
              <article className="lift group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                <div className="zoom-img relative aspect-[16/10] w-full overflow-hidden">
                  <Image
                    src={offer.image || '/placeholder.svg'}
                    alt={t(offer.titleKey, offer.fallbackTitle)}
                    fill
                    loading="lazy"
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover"
                  />
                  <span className="absolute left-4 top-4 rounded-full bg-gold px-3 py-1 text-xs font-semibold text-gold-foreground shadow-sm">
                    {t(offer.badgeKey, offer.fallbackBadge)}
                  </span>
                  <span className="absolute right-4 top-4 rounded-full bg-primary px-3 py-1 text-sm font-bold text-primary-foreground shadow-sm">
                    {offer.discountLabel}
                  </span>
                </div>

                <div className="flex flex-1 flex-col p-6">
                  <h3 className="font-serif text-xl font-semibold text-card-foreground">
                    {t(offer.titleKey, offer.fallbackTitle)}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {t(offer.descriptionKey, offer.fallbackDescription)}
                  </p>

                  <div className="mt-4 flex items-end gap-2">
                    <span className="text-xs uppercase tracking-wider text-muted-foreground">
                      {t('offers.from', 'from')}
                    </span>
                    <span className="font-serif text-2xl font-semibold text-primary">{formatMoney(offer.price)}</span>
                    {offer.wasPrice ? (
                      <span className="mb-0.5 text-sm text-muted-foreground line-through">
                        {formatMoney(offer.wasPrice)}
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-4 border-t border-border pt-4">
                    <Countdown iso={offer.expiresAt} />
                  </div>

                  <a
                    href="#contact"
                    className="mt-5 inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.03]"
                  >
                    {t('offers.book', 'Book this offer')}
                  </a>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
