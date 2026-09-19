import type { ReactNode } from 'react'
import Link from 'next/link'
import Image from 'next/image'

/**
 * Centered, branded shell for authentication screens. Keeps the hotel's
 * cream + terracotta identity with a warm imagery accent on large screens.
 */
export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string
  subtitle?: string
  children: ReactNode
  footer?: ReactNode
}) {
  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-2">
      <div className="relative hidden lg:block">
        <Image src="/images/exterior-night.png" alt="Hotel Sai Aman" fill sizes="50vw" className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/50" />
        <div className="absolute inset-0 flex flex-col justify-between p-10 text-white">
          <Link href="/" className="flex flex-col leading-none">
            <span className="font-serif text-2xl font-semibold">Hotel Sai Aman</span>
            <span className="text-[0.65rem] uppercase tracking-[0.28em] text-gold">Butwal · Nepal</span>
          </Link>
          <div>
            <p className="max-w-sm text-balance font-serif text-3xl font-medium leading-tight">
              Comfort at the heart of Butwal.
            </p>
            <p className="mt-3 max-w-sm text-sm text-white/80">
              Manage your bookings, receipts and preferences in one place.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col justify-center px-6 py-12 sm:px-12">
        <div className="mx-auto w-full max-w-sm">
          <Link href="/" className="mb-8 flex flex-col leading-none lg:hidden">
            <span className="font-serif text-2xl font-semibold">Hotel Sai Aman</span>
            <span className="text-[0.65rem] uppercase tracking-[0.28em] text-primary">Butwal · Nepal</span>
          </Link>

          <h1 className="font-serif text-3xl font-semibold">{title}</h1>
          {subtitle && <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>}

          <div className="mt-8">{children}</div>

          {footer && <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div>}
        </div>
      </div>
    </div>
  )
}
