'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Reveal } from '@/components/reveal'

/**
 * Homepage-only "view all" call to action that links a homepage section preview
 * to its dedicated page. Rendered only when a section receives `viewAllHref`, so
 * the same section component stays clean when reused on its dedicated page.
 */
export function SectionCta({ href, label }: { href: string; label: string }) {
  return (
    <Reveal className="mt-12 flex justify-center">
      <Link
        href={href}
        className="group inline-flex items-center gap-2 rounded-full border border-primary px-7 py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
      >
        {label}
        <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
      </Link>
    </Reveal>
  )
}
