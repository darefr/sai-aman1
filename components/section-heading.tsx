import { Reveal } from '@/components/reveal'
import { cn } from '@/lib/utils'

/**
 * Shared section heading for consistent eyebrow / title / subtitle typography
 * across every section of the page.
 */
export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = 'center',
  className,
}: {
  eyebrow: string
  title: string
  subtitle?: string
  align?: 'center' | 'left'
  className?: string
}) {
  return (
    <div
      className={cn(
        'max-w-2xl',
        align === 'center' ? 'mx-auto text-center' : 'text-left',
        className,
      )}
    >
      <Reveal>
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-primary">{eyebrow}</p>
      </Reveal>
      <Reveal delay={80}>
        <h2 className="mt-3 font-serif text-3xl font-semibold leading-tight text-balance md:text-4xl lg:text-[2.75rem]">
          {title}
        </h2>
      </Reveal>
      {subtitle ? (
        <Reveal delay={140}>
          <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">{subtitle}</p>
        </Reveal>
      ) : null}
    </div>
  )
}
