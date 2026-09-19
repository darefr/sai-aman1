import { Suspense } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { AuthShell } from '@/components/auth/auth-shell'
import { LoginForm } from '@/components/auth/login-form'
import { getCurrentUser } from '@/lib/session'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Sign in' }

export default async function LoginPage() {
  const user = await getCurrentUser()
  if (user) redirect('/account')

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to manage your bookings and receipts."
      footer={
        <>
          New to Hotel Sai Aman?{' '}
          <Link href="/signup" className="font-medium text-primary hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthShell>
  )
}
