'use client'

import { useCallback, useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Quote, Star } from 'lucide-react'
import { Reveal } from '@/components/reveal'
import { useI18n } from '@/components/site-providers'
import { hotel, reviews } from '@/lib/content'
import { cn } from '@/lib/utils'

export function Reviews() {
  const { t } = useI18n()
  const [index, setIndex] = useState(0)
  const total = reviews.length

  const go = useCallback((dir: number) => {
    setIndex((prev) => (prev + dir + total) % total)
  }, [total])

  // Auto-advance, paused when the user prefers reduced motion.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const id = setInterval(() => go(1), 6000)
    return () => clearInterval(id)
  }, [go])

  return (
    <section id="reviews" className="scroll-mt-20 bg-background py-24 md:py-32">
      <div className="mx-auto max-w-4xl px-5 md:px-8">
        <Reveal className="text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
            {t('reviews.eyebrow', 'Guest Reviews')}
          </span>
          <h2 className="mt-4 text-balance font-serif text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
            {t('reviews.title', 'Loved by travelers and pilgrims')}
          </h2>

          <div className="mt-6 inline-flex items-center gap-3 rounded-full border border-border bg-card px-4 py-2">
            <span className="flex size-10 items-center justify-center rounded-full bg-primary font-serif text-lg font-semibold text-primary-foreground">
              {hotel.ratingValue}
            </span>
            <span className="text-left">
              <span className="block text-sm font-semibold text-foreground">{hotel.ratingLabel}</span>
              <span className="block text-xs text-muted-foreground">
                {t('reviews.based', 'based on')} {hotel.reviewCount} {t('reviews.reviews', 'reviews')}
              </span>
            </span>
          </div>
        </Reveal>

        <Reveal delay={120} className="relative mt-12">
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
              style={{ transform: `translateX(-${index * 100}%)` }}
            >
              {reviews.map((r) => (
                <figure key={r.id} className="w-full shrink-0 px-1">
                  <blockquote className="rounded-2xl border border-border bg-card p-8 text-center shadow-sm sm:p-12">
                    <Quote size={36} className="mx-auto text-gold/50" />
                    <div className="mt-4 flex justify-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          className={cn(
                            i < Math.round(r.rating / 2) ? 'fill-gold text-gold' : 'text-muted-foreground/30',
                          )}
                        />
                      ))}
                    </div>
                    <p className="mt-5 text-pretty font-serif text-xl leading-relaxed text-foreground sm:text-2xl">
                      &ldquo;{t(r.quoteKey, r.fallbackQuote)}&rdquo;
                    </p>
                    <figcaption className="mt-6">
                      <span className="block font-semibold text-foreground">{r.author}</span>
                      <span className="block text-sm text-muted-foreground">
                        {r.country} · {r.stayType}
                      </span>
                    </figcaption>
                  </blockquote>
                </figure>
              ))}
            </div>
          </div>

          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              type="button"
              aria-label={t('reviews.prev', 'Previous review')}
              onClick={() => go(-1)}
              className="flex size-10 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="flex gap-2">
              {reviews.map((r, i) => (
                <button
                  key={r.id}
                  type="button"
                  aria-label={`Go to review ${i + 1}`}
                  onClick={() => setIndex(i)}
                  className={cn(
                    'h-2 rounded-full transition-all',
                    i === index ? 'w-6 bg-primary' : 'w-2 bg-border',
                  )}
                />
              ))}
            </div>
            <button
              type="button"
              aria-label={t('reviews.next', 'Next review')}
              onClick={() => go(1)}
              className="flex size-10 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
