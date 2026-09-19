'use client'

/**
 * Client-side app context: theme (light/dark) + active locale.
 * Both are exposed via lightweight hooks so any section can consume them.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { defaultLocale, translate, type Locale } from '@/lib/i18n'

/* ----------------------------- Theme context ----------------------------- */

type Theme = 'light' | 'dark'
type ThemeContextValue = { theme: Theme; toggleTheme: () => void }
const ThemeContext = createContext<ThemeContextValue | null>(null)

/* ---------------------------- Locale context ----------------------------- */

type I18nContextValue = {
  locale: Locale
  setLocale: (l: Locale) => void
  /** Resolve a key with optional fallback copy. */
  t: (key: string, fallback?: string) => string
}
const I18nContext = createContext<I18nContextValue | null>(null)

export function SiteProviders({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light')
  const [locale, setLocaleState] = useState<Locale>(defaultLocale)

  // Sync theme with the class set by the pre-hydration script + storage.
  useEffect(() => {
    const stored = window.localStorage.getItem('theme') as Theme | null
    const initial: Theme = stored ?? (document.documentElement.classList.contains('dark') ? 'dark' : 'light')
    setTheme(initial)
    const storedLocale = window.localStorage.getItem('locale') as Locale | null
    if (storedLocale) setLocaleState(storedLocale)
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark'
      document.documentElement.classList.toggle('dark', next === 'dark')
      window.localStorage.setItem('theme', next)
      return next
    })
  }, [])

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l)
    window.localStorage.setItem('locale', l)
    document.documentElement.lang = l
  }, [])

  const themeValue = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme])
  const i18nValue = useMemo<I18nContextValue>(
    () => ({ locale, setLocale, t: (key, fallback) => translate(locale, key, fallback) }),
    [locale, setLocale],
  )

  return (
    <ThemeContext.Provider value={themeValue}>
      <I18nContext.Provider value={i18nValue}>{children}</I18nContext.Provider>
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within SiteProviders')
  return ctx
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within SiteProviders')
  return ctx
}
