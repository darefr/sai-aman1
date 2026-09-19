'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { setUserRoleAction, setUserBannedAction } from '@/app/actions/admin'

type Customer = {
  id: string
  name: string
  email: string
  role: string
  banned: boolean | null
  emailVerified: boolean
  bookingCount: number
}

export function CustomersTable({ customers, canManage }: { customers: Customer[]; canManage: boolean }) {
  const router = useRouter()
  const [isPending, start] = useTransition()

  function changeRole(id: string, role: string) {
    start(async () => {
      const res = await setUserRoleAction(id, role as 'customer' | 'staff' | 'admin')
      if (!res.ok) {
        toast.error(res.error ?? 'Update failed.')
        return
      }
      toast.success('Role updated.')
      router.refresh()
    })
  }

  function toggleBan(id: string, banned: boolean) {
    start(async () => {
      const res = await setUserBannedAction(id, banned)
      if (!res.ok) {
        toast.error(res.error ?? 'Update failed.')
        return
      }
      toast.success(banned ? 'User blocked.' : 'User unblocked.')
      router.refresh()
    })
  }

  if (customers.length === 0) {
    return <p className="py-10 text-center text-muted-foreground">No customers yet.</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
            <th className="pb-2 pr-4 font-semibold">Customer</th>
            <th className="pb-2 pr-4 font-semibold">Bookings</th>
            <th className="pb-2 pr-4 font-semibold">Verified</th>
            <th className="pb-2 pr-4 font-semibold">Role</th>
            <th className="pb-2 text-right font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((c) => (
            <tr key={c.id} className="border-b border-border/60 last:border-0">
              <td className="py-3 pr-4">
                <p className="font-medium">{c.name}</p>
                <p className="text-xs text-muted-foreground">{c.email}</p>
              </td>
              <td className="py-3 pr-4">{c.bookingCount}</td>
              <td className="py-3 pr-4">
                {c.emailVerified ? <Badge variant="success">Verified</Badge> : <Badge variant="muted">No</Badge>}
              </td>
              <td className="py-3 pr-4">
                {canManage ? (
                  <Select
                    value={c.role}
                    onChange={(e) => changeRole(c.id, e.target.value)}
                    disabled={isPending}
                    className="h-8 w-32"
                  >
                    <option value="customer">Customer</option>
                    <option value="staff">Staff</option>
                    <option value="admin">Admin</option>
                  </Select>
                ) : (
                  <Badge variant="secondary">{c.role}</Badge>
                )}
              </td>
              <td className="py-3 text-right">
                {canManage &&
                  (c.banned ? (
                    <Button size="sm" variant="outline" onClick={() => toggleBan(c.id, false)} disabled={isPending}>
                      Unblock
                    </Button>
                  ) : (
                    <Button size="sm" variant="destructive" onClick={() => toggleBan(c.id, true)} disabled={isPending}>
                      Block
                    </Button>
                  ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
