'use client'

import Link from 'next/link'
import { Award, ArrowUpRight } from 'lucide-react'
import { useI18n } from '@/components/site-providers'
import { hotel, awards, sisterProperty } from '@/lib/content'

const exploreLinks = [
  { href: '/about', key: 'nav.about', fallback: 'About' },
  { href: '/rooms', key: 'nav.rooms', fallback: 'Rooms' },
  { href: '/offers', key: 'nav.offers', fallback: 'Offers' },
  { href: '/gallery', key: 'nav.gallery', fallback: 'Gallery' },
  { href: '/dining', key: 'nav.dining', fallback: 'Dining' },
  { href: '/location', key: 'nav.location', fallback: 'Location' },
]

export function Footer() {
  const { t } = useI18n()

  return (
    <footer className="bg-foreground pt-16 pb-10 text-background">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="grid gap-10 md:grid-cols-12">
          {/* Brand + sister property */}
          <div className="md:col-span-4">
            <p className="font-serif text-2xl font-semibold">{hotel.name}</p>
            <p className="mt-1 text-sm uppercase tracking-[0.28em] text-gold">
              {t('nav.location.sub', 'Butwal · Nepal')}
            </p>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-background/70">
              {t('footer.tagline', hotel.fallbackTagline)}
            </p>

            {/* Sister property cross-link */}
            <a
              href={sisterProperty.href}
              className="group mt-6 inline-flex flex-col rounded-xl border border-background/15 bg-background/5 p-4 transition-colors hover:border-gold/60"
            >
              <span className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-gold">
                {t('footer.sisterLabel', 'Sister Property')}
              </span>
              <span className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-background">
                {t(sisterProperty.nameKey, sisterProperty.fallbackName)}
                <ArrowUpRight size={15} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
              <span className="mt-0.5 text-xs text-background/60">
                {t(sisterProperty.taglineKey, sisterProperty.fallbackTagline)}
              </span>
            </a>
          </div>

          {/* Explore */}
          <div className="md:col-span-2">
            <p className="text-sm font-semibold uppercase tracking-wider text-background/90">
              {t('footer.explore', 'Explore')}
            </p>
            <ul className="mt-4 flex flex-col gap-2.5">
              {exploreLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="link-underline text-sm text-background/70 transition-colors hover:text-gold">
                    {t(l.key, l.fallback)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="md:col-span-3">
            <p className="text-sm font-semibold uppercase tracking-wider text-background/90">
              {t('footer.contact', 'Contact')}
            </p>
            <ul className="mt-4 flex flex-col gap-2.5 text-sm text-background/70">
              <li>
                <a href={hotel.contact.phoneHref} className="transition-colors hover:text-gold">
                  {hotel.contact.phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${hotel.contact.email}`} className="transition-colors hover:text-gold">
                  {hotel.contact.email}
                </a>
              </li>
              <li>
                {hotel.contact.address}, {hotel.contact.city}
              </li>
              <li>
                {hotel.contact.province}, {hotel.contact.country}
              </li>
            </ul>
            <div className="mt-4 flex gap-4">
              {hotel.social.map((s) => (
                <a key={s.label} href={s.href} className="text-sm text-background/70 transition-colors hover:text-gold">
                  {s.label}
                </a>
              ))}
            </div>
          </div>

          {/* Awards / recognition */}
          <div className="md:col-span-3">
            <p className="text-sm font-semibold uppercase tracking-wider text-background/90">
              {t('footer.awards', 'Recognition')}
            </p>
            <ul className="mt-4 flex flex-col gap-3">
              {awards.map((a) => (
                <li key={a.id} className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold/15 text-gold">
                    <Award size={17} aria-hidden />
                  </span>
                  <span className="text-sm text-background/80">
                    {t(a.labelKey, a.fallbackLabel)}
                    <span className="ml-1 text-background/50">· {a.year}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-background/15 pt-6 text-center text-xs text-background/60">
          © {new Date().getFullYear()} {hotel.legalName}. {t('footer.rights', 'All rights reserved.')}
        </div>
      </div>
    </footer>
  )
}
