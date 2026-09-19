import type { ReactNode } from 'react'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'

/**
 * Page shell for standalone routes (booking, account, auth). Reuses the exact
 * site navbar and footer so these pages share the hotel's visual identity.
 * Adds top padding to clear the fixed navbar.
 */
export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar forceSolid />
      <main className="flex-1 pt-24 md:pt-28">{children}</main>
      <Footer />
    </div>
  )
}
