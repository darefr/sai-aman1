import type { ReactNode } from 'react'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { AccountNav } from '@/components/account/account-nav'
import { SignOutButton } from '@/components/auth/sign-out-button'
import { Card } from '@/components/ui/card'
import { requireUser } from '@/lib/session'

export const dynamic = 'force-dynamic'

export default async function AccountLayout({ children }: { children: ReactNode }) {
  const user = await requireUser()

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar forceSolid />
      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-10 pt-24 md:px-8 md:pt-28">
        <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <Card className="p-4">
              <div className="mb-4 px-2">
                <p className="truncate font-serif text-lg font-semibold">{user.name}</p>
                <p className="truncate text-xs text-muted-foreground">{user.email}</p>
              </div>
              <AccountNav />
              <div className="mt-2 border-t border-border pt-2">
                <SignOutButton />
              </div>
            </Card>
          </aside>
          <div>{children}</div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
