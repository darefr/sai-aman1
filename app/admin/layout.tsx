import type { ReactNode } from 'react'
import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import { AdminNav } from '@/components/admin/admin-nav'
import { SignOutButton } from '@/components/auth/sign-out-button'
import { requireAdmin } from '@/lib/session'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const admin = await requireAdmin()

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="mx-auto flex max-w-[1400px]">
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-card px-4 py-5 lg:flex">
          <Link href="/admin" className="mb-6 flex flex-col px-2 leading-none">
            <span className="font-serif text-xl font-semibold">Sai Aman</span>
            <span className="text-[0.65rem] uppercase tracking-[0.28em] text-primary">Admin</span>
          </Link>
          <div className="flex-1 overflow-y-auto">
            <AdminNav />
          </div>
          <div className="mt-4 border-t border-border pt-3">
            <div className="mb-2 px-3">
              <p className="truncate text-sm font-medium">{admin.name}</p>
              <p className="truncate text-xs text-muted-foreground">{admin.email}</p>
            </div>
            <Link
              href="/"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <ExternalLink className="size-4" /> View site
            </Link>
            <SignOutButton />
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          {/* Mobile top bar */}
          <div className="flex items-center justify-between border-b border-border bg-card px-5 py-3 lg:hidden">
            <Link href="/admin" className="font-serif text-lg font-semibold">
              Sai Aman <span className="text-xs uppercase tracking-widest text-primary">Admin</span>
            </Link>
            <SignOutButton className="w-auto" />
          </div>
          <div className="lg:hidden">
            <div className="border-b border-border bg-card px-3 py-2">
              <AdminNav />
            </div>
          </div>

          <main className="px-5 py-8 md:px-8">{children}</main>
        </div>
      </div>
    </div>
  )
}
