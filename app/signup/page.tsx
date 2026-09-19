import { Suspense } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { AuthShell } from '@/components/auth/auth-shell'
import { SignupForm } from '@/components/auth/signup-form'
import { getCurrentUser } from '@/lib/session'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Create account' }

export default async function SignupPage() {
  const user = await getCurrentUser()
  if (user) redirect('/account')

  return (
    <AuthShell
      title="Create your account"
      subtitle="Book faster and keep all your reservations in one place."
      footer={
        <>
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <Suspense>
        <SignupForm />
      </Suspense>
    </AuthShell>
  )
}
