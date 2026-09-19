'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/components/site-providers'
import { cn } from '@/lib/utils'

export function ThemeToggle({ variant = 'solid' }: { variant?: 'solid' | 'ghost' }) {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      className={cn(
        'flex size-9 items-center justify-center rounded-full transition-colors',
        variant === 'solid'
          ? 'border border-border bg-card text-foreground hover:bg-accent'
          : 'text-current hover:bg-background/10',
      )}
    >
      {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  )
}
