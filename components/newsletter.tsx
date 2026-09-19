'use client'

import { useState, type FormEvent } from 'react'
import { Mail, Check, Loader2 } from 'lucide-react'
import { useI18n } from '@/components/site-providers'
import { Reveal } from '@/components/reveal'

type Status = 'idle' | 'loading' | 'success' | 'error'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function Newsletter() {
  const { t } = useI18n()
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<Status>('idle')

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!EMAIL_RE.test(email)) {
      setStatus('error')
      return
    }
    setStatus('loading')
    try {
      // TODO(NEWSLETTER): POST the email to your ESP (Mailchimp, Brevo, Resend
      // Audiences, etc.) via an API route, e.g. `await fetch('/api/newsletter', ...)`.
      await new Promise((r) => setTimeout(r, 900))
      setStatus('success')
      setEmail('')
    } catch {
      setStatus('error')
    }
  }

  return (
    <section id="newsletter" className="bg-foreground py-20 text-background md:py-24">
      <div className="mx-auto max-w-3xl px-5 text-center md:px-8">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-gold">
            {t('newsletter.eyebrow', 'Stay in Touch')}
          </p>
        </Reveal>
        <Reveal delay={80}>
          <h2 className="mt-3 font-serif text-3xl font-semibold text-balance md:text-4xl">
            {t('newsletter.title', 'Get seasonal offers & travel tips')}
          </h2>
        </Reveal>
        <Reveal delay={140}>
          <p className="mx-auto mt-4 max-w-xl text-pretty leading-relaxed text-background/70">
            {t('newsletter.subtitle', 'Join our list for exclusive rates and Lumbini travel inspiration. No spam, ever.')}
          </p>
        </Reveal>

        <Reveal delay={200}>
          {status === 'success' ? (
            <div className="mx-auto mt-8 flex max-w-md items-center justify-center gap-2 rounded-full bg-gold px-6 py-3.5 font-medium text-gold-foreground">
              <Check size={18} aria-hidden />
              {t('newsletter.success', 'You’re subscribed! Watch your inbox for our next update.')}
            </div>
          ) : (
            <form onSubmit={onSubmit} noValidate className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Mail
                  size={18}
                  aria-hidden
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-background/50"
                />
                <label htmlFor="newsletter-email" className="sr-only">
                  {t('newsletter.placeholder', 'Enter your email address')}
                </label>
                <input
                  id="newsletter-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (status === 'error') setStatus('idle')
                  }}
                  placeholder={t('newsletter.placeholder', 'Enter your email address')}
                  aria-invalid={status === 'error'}
                  className="w-full rounded-full border border-background/20 bg-background/10 py-3.5 pl-11 pr-4 text-background placeholder:text-background/50 outline-none transition-colors focus:border-gold"
                />
              </div>
              <button
                type="submit"
                disabled={status === 'loading'}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gold px-7 py-3.5 font-semibold text-gold-foreground transition-transform hover:scale-[1.03] disabled:opacity-70"
              >
                {status === 'loading' ? <Loader2 size={18} className="animate-spin" aria-hidden /> : null}
                {t('newsletter.subscribe', 'Subscribe')}
              </button>
            </form>
          )}
          {status === 'error' ? (
            <p role="alert" className="mt-3 text-sm text-gold">
              {t('newsletter.error', 'Please enter a valid email address.')}
            </p>
          ) : null}
        </Reveal>
      </div>
    </section>
  )
}
