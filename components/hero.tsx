'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { Star } from 'lucide-react'
import { useI18n } from '@/components/site-providers'
import { hotel } from '@/lib/content'

export function Hero() {
  const { t } = useI18n()
  const bgRef = useRef<HTMLDivElement>(null)
  const [videoReady, setVideoReady] = useState(false)

  // Lightweight parallax on the background layer (disabled for reduced motion).
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return
    let raf = 0
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const y = window.scrollY
        if (bgRef.current && y < window.innerHeight) {
          bgRef.current.style.transform = `translate3d(0, ${y * 0.4}px, 0) scale(1.05)`
        }
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <section id="top" className="relative flex min-h-[100svh] items-center justify-center overflow-hidden">
      <div ref={bgRef} className="absolute inset-0 will-change-transform">
        {/* Poster image is the guaranteed LCP element. */}
        <Image
          src="/images/hero-hotel.png"
          alt="Hotel Sai Aman exterior at golden hour in Butwal, Nepal"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        {/*
          TODO(MEDIA): Drop the real looping property/drone footage at
          /videos/hero-loop.mp4 (and .webm). It fades in over the poster once
          it can play; if the file is absent the poster simply remains.
        */}
        <video
          autoPlay
          muted
          loop
          playsInline
          poster="/images/hero-hotel.png"
          onCanPlay={() => setVideoReady(true)}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
            videoReady ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <source src="/videos/hero-loop.webm" type="video/webm" />
          <source src="/videos/hero-loop.mp4" type="video/mp4" />
        </video>
      </div>

      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/35 to-black/80" />

      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center text-white">
        <div className="reveal is-visible mb-6 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs uppercase tracking-[0.25em] backdrop-blur-sm">
          <Star size={13} className="fill-gold text-gold" />
          {t('hero.badge', 'New Bus Park · Butwal · Lumbini Province')}
        </div>

        <h1 className="text-balance font-serif text-5xl font-semibold leading-[1.03] tracking-tight sm:text-6xl md:text-8xl">
          {hotel.name}
        </h1>

        <p className="mx-auto mt-5 max-w-xl text-pretty text-lg font-light text-white/90 sm:text-2xl">
          {t('hero.tagline', hotel.fallbackTagline)}
        </p>

        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/booking"
            className="w-full rounded-full bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg transition-transform hover:scale-[1.04] sm:w-auto"
          >
            {t('hero.cta.primary', 'Check Availability')}
          </Link>
          <a
            href="#rooms"
            className="w-full rounded-full border border-white/40 px-8 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/10 sm:w-auto"
          >
            {t('hero.cta.secondary', 'Explore Rooms')}
          </a>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2">
        <div className="h-12 w-6 rounded-full border border-white/40 p-1">
          <div className="mx-auto h-2 w-1 animate-bounce rounded-full bg-white/70" />
        </div>
      </div>
    </section>
  )
}
