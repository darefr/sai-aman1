'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Menu, X, UserRound } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useI18n } from '@/components/site-providers'
import { ThemeToggle } from '@/components/theme-toggle'
import { LanguageSwitcher } from '@/components/language-switcher'

const links = [
  { href: '/#about', key: 'nav.about', fallback: 'About' },
  { href: '/#rooms', key: 'nav.rooms', fallback: 'Rooms' },
  { href: '/#offers', key: 'nav.offers', fallback: 'Offers' },
  { href: '/#gallery', key: 'nav.gallery', fallback: 'Gallery' },
  { href: '/#dining', key: 'nav.dining', fallback: 'Dining' },
  { href: '/#experiences', key: 'nav.experiences', fallback: 'Experiences' },
  { href: '/#reviews', key: 'nav.reviews', fallback: 'Reviews' },
  { href: '/#location', key: 'nav.location', fallback: 'Location' },
]

export function Navbar({ forceSolid = false }: { forceSolid?: boolean }) {
  const { t } = useI18n()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const solid = scrolled || open || forceSolid

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-500',
        solid ? 'bg-background/85 backdrop-blur-md shadow-[0_1px_0_0_var(--border)]' : 'bg-transparent',
      )}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">
        <Link
          href="/"
          className={cn('flex flex-col leading-none transition-colors', solid ? 'text-foreground' : 'text-white')}
        >
          <span className="font-serif text-xl font-semibold tracking-tight">Hotel Sai Aman</span>
          <span className={cn('text-[0.65rem] uppercase tracking-[0.28em]', solid ? 'text-primary' : 'text-gold')}>
            {t('nav.location.sub', 'Butwal · Nepal')}
          </span>
        </Link>

        <ul className="hidden items-center gap-6 xl:flex">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className={cn(
                  'group relative text-sm font-medium transition-colors',
                  solid ? 'text-foreground/80 hover:text-primary' : 'text-white/90 hover:text-gold',
                )}
              >
                {t(l.key, l.fallback)}
                <span className="absolute -bottom-1.5 left-0 h-px w-0 bg-current transition-all duration-300 group-hover:w-full" />
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <div className={cn('transition-colors', solid ? 'text-foreground' : 'text-white')}>
            <LanguageSwitcher variant={solid ? 'solid' : 'ghost'} />
          </div>
          <div className={cn('transition-colors', solid ? 'text-foreground' : 'text-white')}>
            <ThemeToggle variant={solid ? 'solid' : 'ghost'} />
          </div>
          <Link
            href="/account"
            aria-label={t('nav.account', 'My account')}
            className={cn(
              'hidden rounded-full p-2 transition-colors sm:inline-flex',
              solid ? 'text-foreground hover:text-primary' : 'text-white hover:text-gold',
            )}
          >
            <UserRound size={20} />
          </Link>
          <Link
            href="/booking"
            className="hidden rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.04] sm:inline-block"
          >
            {t('nav.book', 'Book Now')}
          </Link>

          <button
            type="button"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((v) => !v)}
            className={cn('xl:hidden transition-colors', solid ? 'text-foreground' : 'text-white')}
          >
            {open ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="border-t border-border bg-background/95 backdrop-blur-md xl:hidden">
          <ul className="flex flex-col px-5 py-3">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block py-3 text-base font-medium text-foreground/80 hover:text-primary"
                >
                  {t(l.key, l.fallback)}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/account"
                onClick={() => setOpen(false)}
                className="block py-3 text-base font-medium text-foreground/80 hover:text-primary"
              >
                {t('nav.account', 'My account')}
              </Link>
            </li>
            <li className="pt-2 pb-3">
              <Link
                href="/booking"
                onClick={() => setOpen(false)}
                className="block rounded-full bg-primary px-5 py-3 text-center text-sm font-semibold text-primary-foreground"
              >
                {t('nav.book', 'Book Now')}
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  )
}
