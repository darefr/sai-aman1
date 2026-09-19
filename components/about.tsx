'use client'

import Image from 'next/image'
import { Reveal } from '@/components/reveal'
import { useI18n } from '@/components/site-providers'
import { landmarks } from '@/lib/content'

export function About() {
  const { t } = useI18n()

  const stats = [
    { value: '3', label: t('about.stat.rooms', 'Room Types') },
    { value: '40', label: t('about.stat.airport', 'Min to Airport'), suffix: 'min' },
    { value: '60', label: t('about.stat.lumbini', 'Min to Lumbini'), suffix: 'min' },
    { value: '24/7', label: t('about.stat.reception', 'Reception') },
  ]

  return (
    <section id="about" className="scroll-mt-20 bg-background py-24 md:py-32">
      <div className="mx-auto grid max-w-7xl gap-14 px-5 md:px-8 lg:grid-cols-2 lg:items-center lg:gap-20">
        <Reveal>
          <div className="relative">
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl">
              <Image
                src="/images/about-lobby.png"
                alt="Warm lobby interior of Hotel Sai Aman"
                fill
                loading="lazy"
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -right-4 hidden rounded-2xl border border-border bg-card p-5 shadow-xl sm:block">
              <p className="font-serif text-3xl font-semibold text-primary">7.6</p>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Guest Rating</p>
            </div>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <span className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
            {t('about.eyebrow', 'Our Story')}
          </span>
          <h2 className="mt-4 text-balance font-serif text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
            {t('about.title', 'A warm welcome in the gateway to Lumbini')}
          </h2>
          <p className="mt-6 text-pretty text-lg leading-relaxed text-muted-foreground">
            {t('about.body', '')}
          </p>

          <dl className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label}>
                <dt className="font-serif text-3xl font-semibold text-foreground">{s.value}</dt>
                <dd className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">{s.label}</dd>
              </div>
            ))}
          </dl>

          <ul className="mt-8 flex flex-wrap gap-2">
            {landmarks.map((l) => (
              <li
                key={l.id}
                className="rounded-full border border-border bg-secondary/60 px-3 py-1.5 text-xs font-medium text-secondary-foreground"
              >
                {t(l.nameKey, l.fallbackName)}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  )
}
