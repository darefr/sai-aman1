'use client'

import { useEffect, useRef, useState } from 'react'
import { useI18n } from '@/components/site-providers'
import { stats } from '@/lib/content'

const REDUCED =
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

function useCountUp(target: number, active: boolean, duration = 1600) {
  const [value, setValue] = useState(0)
  const isFloat = !Number.isInteger(target)

  useEffect(() => {
    if (!active) return
    if (REDUCED) {
      setValue(target)
      return
    }
    let raf = 0
    const start = performance.now()
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1)
      // easeOutCubic
      const eased = 1 - Math.pow(1 - p, 3)
      setValue(isFloat ? Math.round(target * eased * 10) / 10 : Math.round(target * eased))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, active, duration, isFloat])

  return isFloat ? value.toFixed(1) : value.toLocaleString('en-US')
}

function StatItem({ value, suffix, label, active }: { value: number; suffix: string; label: string; active: boolean }) {
  const display = useCountUp(value, active)
  return (
    <div className="text-center">
      <p className="font-serif text-4xl font-semibold text-gold md:text-5xl">
        {display}
        {suffix}
      </p>
      <p className="mt-2 text-sm uppercase tracking-[0.18em] text-primary-foreground/75">{label}</p>
    </div>
  )
}

export function Stats() {
  const { t } = useI18n()
  const ref = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setActive(true)
            observer.disconnect()
          }
        })
      },
      { threshold: 0.4 },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <section className="bg-primary py-16 text-primary-foreground md:py-20" aria-label="Hotel by the numbers">
      <div ref={ref} className="mx-auto grid max-w-6xl grid-cols-2 gap-10 px-5 md:grid-cols-4 md:px-8">
        {stats.map((s) => (
          <StatItem key={s.id} value={s.value} suffix={s.suffix} label={t(s.labelKey, s.fallbackLabel)} active={active} />
        ))}
      </div>
    </section>
  )
}
