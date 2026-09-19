'use client'

import { useCallback, useEffect } from 'react'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { useI18n } from '@/components/site-providers'

export type LightboxItem = { src: string; caption: string }

/**
 * Accessible, keyboard-navigable image lightbox shared by the Gallery and Room
 * galleries. Handles Esc to close, arrow keys to navigate, and locks scroll.
 */
export function Lightbox({
  items,
  index,
  onClose,
  onNavigate,
}: {
  items: LightboxItem[]
  index: number | null
  onClose: () => void
  onNavigate: (next: number) => void
}) {
  const { t } = useI18n()
  const open = index !== null

  const go = useCallback(
    (dir: number) => {
      if (index === null) return
      const next = (index + dir + items.length) % items.length
      onNavigate(next)
    },
    [index, items.length, onNavigate],
  )

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft') go(-1)
    }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [open, go, onClose])

  if (!open || index === null) return null
  const current = items[index]

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={current.caption}
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label={t('gallery.close', 'Close gallery')}
        className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
      >
        <X size={22} />
      </button>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          go(-1)
        }}
        aria-label={t('gallery.prev', 'Previous image')}
        className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2.5 text-white transition-colors hover:bg-white/20 md:left-6"
      >
        <ChevronLeft size={26} />
      </button>

      <figure className="relative max-h-[85vh] w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
        <div className="relative aspect-[3/2] w-full overflow-hidden rounded-xl">
          <Image
            src={current.src || '/placeholder.svg'}
            alt={current.caption}
            fill
            sizes="(max-width: 768px) 100vw, 900px"
            className="object-cover"
            priority
          />
        </div>
        <figcaption className="mt-3 text-center text-sm text-white/80">{current.caption}</figcaption>
      </figure>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          go(1)
        }}
        aria-label={t('gallery.next', 'Next image')}
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2.5 text-white transition-colors hover:bg-white/20 md:right-6"
      >
        <ChevronRight size={26} />
      </button>
    </div>
  )
}
