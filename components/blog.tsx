'use client'

import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { useI18n } from '@/components/site-providers'
import { SectionHeading } from '@/components/section-heading'
import { Reveal } from '@/components/reveal'
import { blogPosts } from '@/lib/content'

function formatDate(iso: string, locale: string) {
  try {
    return new Date(iso).toLocaleDateString(locale === 'en' ? 'en-US' : locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return iso
  }
}

export function Blog() {
  const { t, locale } = useI18n()

  return (
    <section id="blog" className="bg-background py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionHeading
          eyebrow={t('blog.eyebrow', 'Journal')}
          title={t('blog.title', 'Stories & local guides')}
          subtitle={t('blog.subtitle', 'Tips for exploring Butwal, Lumbini and the region.')}
        />

        <div className="mt-14 grid gap-7 md:grid-cols-3">
          {blogPosts.map((post, i) => (
            <Reveal key={post.id} delay={i * 120}>
              {/* TODO(CMS/ROUTING): link to a real /blog/[slug] page. */}
              <a
                href={`#${post.slug}`}
                className="lift group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
              >
                <div className="zoom-img relative aspect-[16/10] w-full overflow-hidden">
                  <Image
                    src={post.image || '/placeholder.svg'}
                    alt={t(post.titleKey, post.fallbackTitle)}
                    fill
                    loading="lazy"
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover"
                  />
                  <span className="absolute left-4 top-4 rounded-full bg-background/90 px-3 py-1 text-xs font-semibold text-primary shadow-sm">
                    {post.category}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <time dateTime={post.date}>{formatDate(post.date, locale)}</time>
                    <span aria-hidden>·</span>
                    <span>
                      {post.readMinutes} {t('blog.read', 'min read')}
                    </span>
                  </div>
                  <h3 className="mt-3 font-serif text-xl font-semibold text-card-foreground">
                    {t(post.titleKey, post.fallbackTitle)}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {t(post.excerptKey, post.fallbackExcerpt)}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                    {t('blog.readMore', 'Read article')}
                    <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </div>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
