'use client'

import { useEffect, useRef, useState } from 'react'
import { Check, Globe } from 'lucide-react'
import { useI18n } from '@/components/site-providers'
import { localeNames, locales, type Locale } from '@/lib/i18n'
import { cn } from '@/lib/utils'

export function LanguageSwitcher({ variant = 'solid' }: { variant?: 'solid' | 'ghost' }) {
  const { locale, setLocale } = useI18n()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Select language"
        className={cn(
          'flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition-colors',
          variant === 'solid'
            ? 'border border-border bg-card text-foreground hover:bg-accent'
            : 'text-current hover:bg-background/10',
        )}
      >
        <Globe size={16} />
        <span className="hidden sm:inline">{localeNames[locale]}</span>
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute right-0 z-50 mt-2 w-40 overflow-hidden rounded-xl border border-border bg-popover p-1 text-popover-foreground shadow-xl"
        >
          {locales.map((l: Locale) => (
            <li key={l}>
              <button
                type="button"
                role="option"
                aria-selected={l === locale}
                onClick={() => {
                  setLocale(l)
                  setOpen(false)
                }}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-accent"
              >
                {localeNames[l]}
                {l === locale && <Check size={15} className="text-primary" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
