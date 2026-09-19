'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  CalendarDays,
  BedDouble,
  Users,
  Ticket,
  Sparkles,
  Star,
  Images,
  HelpCircle,
  FileText,
  Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const groups: { label: string; items: { href: string; label: string; icon: typeof LayoutDashboard }[] }[] = [
  {
    label: 'Operations',
    items: [
      { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/admin/bookings', label: 'Bookings', icon: CalendarDays },
      { href: '/admin/rooms', label: 'Rooms', icon: BedDouble },
      { href: '/admin/customers', label: 'Customers', icon: Users },
    ],
  },
  {
    label: 'Marketing',
    items: [
      { href: '/admin/coupons', label: 'Coupons', icon: Ticket },
      { href: '/admin/offers', label: 'Offers', icon: Sparkles },
      { href: '/admin/reviews', label: 'Reviews', icon: Star },
    ],
  },
  {
    label: 'Content',
    items: [
      { href: '/admin/gallery', label: 'Gallery', icon: Images },
      { href: '/admin/faqs', label: 'FAQs', icon: HelpCircle },
      { href: '/admin/content', label: 'Site content', icon: FileText },
      { href: '/admin/settings', label: 'Settings', icon: Settings },
    ],
  },
]

export function AdminNav() {
  const pathname = usePathname()
  return (
    <nav className="grid gap-5">
      {groups.map((group) => (
        <div key={group.label}>
          <p className="mb-1.5 px-3 text-[0.7rem] font-semibold uppercase tracking-wide text-muted-foreground">
            {group.label}
          </p>
          <div className="grid gap-0.5">
            {group.items.map((item) => {
              const active = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )}
                >
                  <item.icon className="size-4" />
                  {item.label}
                </Link>
              )
            })}
          </div>
        </div>
      ))}
    </nav>
  )
}
