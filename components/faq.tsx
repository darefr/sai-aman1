'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useI18n } from '@/components/site-providers'
import { SectionHeading } from '@/components/section-heading'
import { Reveal } from '@/components/reveal'
import { faqs } from '@/lib/content'

export function Faq() {
  const { t } = useI18n()
  const [open, setOpen] = useState<string | null>(faqs[0]?.id ?? null)

  return (
    <section id="faq" className="bg-secondary/40 py-24 md:py-32">
      <div className="mx-auto max-w-3xl px-5 md:px-8">
        <SectionHeading
          eyebrow={t('faq.eyebrow', 'Good to Know')}
          title={t('faq.title', 'Frequently asked questions')}
          subtitle={t('faq.subtitle', 'Everything you need to know before you arrive.')}
        />

        <div className="mt-12 flex flex-col gap-3">
          {faqs.map((f, i) => {
            const isOpen = open === f.id
            const panelId = `faq-panel-${f.id}`
            const btnId = `faq-btn-${f.id}`
            return (
              <Reveal key={f.id} delay={i * 70}>
                <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                  <h3>
                    <button
                      id={btnId}
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() => setOpen(isOpen ? null : f.id)}
                      className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                    >
                      <span className="font-medium text-card-foreground">{t(f.questionKey, f.fallbackQuestion)}</span>
                      <Plus
                        size={20}
                        aria-hidden
                        className={cn(
                          'shrink-0 text-primary transition-transform duration-300',
                          isOpen && 'rotate-45',
                        )}
                      />
                    </button>
                  </h3>
                  <div
                    id={panelId}
                    role="region"
                    aria-labelledby={btnId}
                    className={cn('accordion-panel', isOpen && 'open')}
                  >
                    <div>
                      <p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">
                        {t(f.answerKey, f.fallbackAnswer)}
                      </p>
                    </div>
                  </div>
                </div>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
