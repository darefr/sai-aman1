'use client'

import { Quote } from 'lucide-react'
import { useI18n } from '@/components/site-providers'
import { Reveal } from '@/components/reveal'
import { SectionHeading } from '@/components/section-heading'
import { founderNote, timeline } from '@/lib/content'

export function Story() {
  const { t } = useI18n()

  return (
    <section id="story" className="bg-background py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <SectionHeading
          eyebrow={t('story.eyebrow', 'Our Story')}
          title={t('story.title', 'Rooted in Nepali hospitality')}
        />

        {/* Founder note */}
        <Reveal delay={120}>
          <figure className="mx-auto mt-14 max-w-3xl rounded-2xl border border-border bg-card p-8 text-center shadow-sm md:p-12">
            <Quote className="mx-auto text-gold" size={36} aria-hidden />
            <blockquote className="mt-5 font-serif text-xl leading-relaxed text-pretty text-card-foreground md:text-2xl">
              {t(founderNote.quoteKey, founderNote.fallbackQuote)}
            </blockquote>
            <figcaption className="mt-6">
              <span className="block font-semibold text-primary">{founderNote.name}</span>
              <span className="mt-0.5 block text-sm text-muted-foreground">
                {t(founderNote.roleKey, founderNote.fallbackRole)}
              </span>
            </figcaption>
          </figure>
        </Reveal>

        {/* Timeline */}
        <div className="mt-20">
          <Reveal>
            <p className="text-center text-xs font-semibold uppercase tracking-[0.32em] text-primary">
              {t('story.timelineTitle', 'Our journey')}
            </p>
          </Reveal>

          <ol className="relative mt-10 grid gap-10 md:grid-cols-4">
            {/* Connecting line (desktop) */}
            <span
              className="absolute left-0 right-0 top-[13px] hidden h-px bg-border md:block"
              aria-hidden
            />
            {timeline.map((entry, i) => (
              <Reveal as="li" key={entry.id} delay={i * 120} className="relative">
                <span className="relative z-10 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-[0.7rem] font-bold text-primary-foreground">
                  {i + 1}
                </span>
                <p className="mt-4 font-serif text-2xl font-semibold text-gold">{entry.year}</p>
                <h3 className="mt-1 font-semibold text-foreground">{t(entry.titleKey, entry.fallbackTitle)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {t(entry.bodyKey, entry.fallbackBody)}
                </p>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
