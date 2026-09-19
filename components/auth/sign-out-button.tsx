'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { signOut } from '@/lib/auth-client'

export function SignOutButton({ className }: { className?: string }) {
  const router = useRouter()
  const [isPending, start] = useTransition()

  function handle() {
    start(async () => {
      await signOut()
      router.push('/')
      router.refresh()
    })
  }

  return (
    <button
      type="button"
      onClick={handle}
      disabled={isPending}
      className={cn(
        'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50',
        className,
      )}
    >
      {isPending ? <Loader2 className="size-4 animate-spin" /> : <LogOut className="size-4" />}
      Sign out
    </button>
  )
}
