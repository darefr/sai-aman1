'use client'

import { useState, type FormEvent } from 'react'
import { Phone, Mail, MapPin, Check, Loader2 } from 'lucide-react'
import { Reveal } from '@/components/reveal'
import { useI18n } from '@/components/site-providers'
import { hotel, rooms } from '@/lib/content'
import { submitBookingRequest, type BookingRequest } from '@/lib/booking'

export function Contact() {
  const { t } = useI18n()
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle')
  const [error, setError] = useState<string | null>(null)

  const details = [
    { icon: Phone, label: t('contact.detail.phone', 'Phone'), value: hotel.contact.phone, href: hotel.contact.phoneHref },
    { icon: Mail, label: t('contact.detail.email', 'Email'), value: hotel.contact.email, href: `mailto:${hotel.contact.email}` },
    {
      icon: MapPin,
      label: t('contact.detail.address', 'Address'),
      value: `${hotel.contact.address}, ${hotel.contact.city}, ${hotel.contact.province}, ${hotel.contact.country}`,
    },
  ]

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setStatus('loading')

    const form = new FormData(e.currentTarget)
    const request: BookingRequest = {
      name: String(form.get('name') ?? ''),
      email: String(form.get('email') ?? ''),
      phone: String(form.get('phone') ?? ''),
      checkIn: String(form.get('checkin') ?? ''),
      checkOut: String(form.get('checkout') ?? ''),
      guests: Number(form.get('guests') ?? 1),
      roomId: String(form.get('room') ?? rooms[0].id),
      message: String(form.get('message') ?? ''),
    }

    // TODO(BACKEND): submitBookingRequest currently simulates the request.
    // Wire it to /api/bookings + payment (eSewa/Khalti/Stripe) — see lib/booking.ts.
    const result = await submitBookingRequest(request)
    if (result.ok) {
      setStatus('success')
    } else {
      setError(result.error)
      setStatus('idle')
    }
  }

  return (
    <section id="contact" className="scroll-mt-20 bg-primary py-24 text-primary-foreground md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <span className="text-xs font-semibold uppercase tracking-[0.28em] text-gold">
              {t('contact.eyebrow', 'Book Your Stay')}
            </span>
            <h2 className="mt-4 text-balance font-serif text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
              {t('contact.title', 'Reserve your room at Hotel Sai Aman')}
            </h2>
            <p className="mt-5 max-w-md text-pretty leading-relaxed text-primary-foreground/85">
              {t('contact.body', '')}
            </p>

            <ul className="mt-10 flex flex-col gap-5">
              {details.map((d) => (
                <li key={d.label} className="flex items-start gap-4">
                  <span className="mt-0.5 flex size-11 shrink-0 items-center justify-center rounded-full bg-primary-foreground/10">
                    <d.icon size={20} className="text-gold" />
                  </span>
                  <div>
                    <span className="block text-sm text-primary-foreground/70">{d.label}</span>
                    {d.href ? (
                      <a href={d.href} className="font-medium hover:text-gold">
                        {d.value}
                      </a>
                    ) : (
                      <span className="font-medium">{d.value}</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={120}>
            <div className="rounded-2xl bg-card p-7 text-card-foreground shadow-2xl sm:p-9">
              {status === 'success' ? (
                <div className="flex min-h-[460px] flex-col items-center justify-center text-center">
                  <span className="flex size-16 items-center justify-center rounded-full bg-accent">
                    <Check size={30} className="text-primary" />
                  </span>
                  <h3 className="mt-5 font-serif text-2xl font-semibold">{t('contact.success.title', 'Thank you!')}</h3>
                  <p className="mt-2 max-w-xs text-muted-foreground">{t('contact.success.body', '')}</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field id="name" label={t('contact.form.name', 'Full name')} type="text" placeholder="Your name" required />
                    <Field id="phone" label={t('contact.form.phone', 'Phone')} type="tel" placeholder="+977 ..." required />
                  </div>
                  <Field id="email" label={t('contact.form.email', 'Email')} type="email" placeholder="you@example.com" required />
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field id="checkin" label={t('contact.form.checkin', 'Check-in')} type="date" required />
                    <Field id="checkout" label={t('contact.form.checkout', 'Check-out')} type="date" required />
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="flex flex-col gap-2">
                      <label htmlFor="guests" className="text-sm font-medium">
                        {t('contact.form.guests', 'Guests')}
                      </label>
                      <select
                        id="guests"
                        name="guests"
                        defaultValue="2"
                        className="rounded-lg border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                      >
                        {[1, 2, 3, 4].map((n) => (
                          <option key={n} value={n}>
                            {n} {n === 1 ? 'guest' : 'guests'}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label htmlFor="room" className="text-sm font-medium">
                        {t('contact.form.room', 'Room type')}
                      </label>
                      <select
                        id="room"
                        name="room"
                        defaultValue={rooms[0].id}
                        className="rounded-lg border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                      >
                        {rooms.map((r) => (
                          <option key={r.id} value={r.id}>
                            {t(r.nameKey, r.fallbackName)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label htmlFor="message" className="text-sm font-medium">
                      {t('contact.form.message', 'Message')}{' '}
                      <span className="text-muted-foreground">{t('contact.form.optional', '(optional)')}</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={3}
                      placeholder={t('contact.form.placeholder', 'Any special requests?')}
                      className="resize-none rounded-lg border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  {error && <p className="text-sm font-medium text-destructive">{error}</p>}

                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="mt-1 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {status === 'loading' && <Loader2 size={16} className="animate-spin" />}
                    {t('contact.form.submit', 'Request Booking')}
                  </button>
                </form>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

function Field({
  id,
  label,
  type,
  placeholder,
  required,
}: {
  id: string
  label: string
  type: string
  placeholder?: string
  required?: boolean
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        placeholder={placeholder}
        required={required}
        className="rounded-lg border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
    </div>
  )
}
