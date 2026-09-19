import { eq } from 'drizzle-orm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ProfileForm } from '@/components/account/profile-form'
import { requireUser } from '@/lib/session'
import { db } from '@/lib/db'
import * as s from '@/lib/db/schema'

export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
  const user = await requireUser()
  const [profile] = await db
    .select()
    .from(s.customerProfiles)
    .where(eq(s.customerProfiles.userId, user.id))
    .limit(1)

  return (
    <div>
      <h1 className="font-serif text-3xl font-semibold">Profile</h1>
      <p className="mt-1 text-muted-foreground">Update your personal details.</p>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Personal information</CardTitle>
        </CardHeader>
        <CardContent>
          <ProfileForm
            initial={{
              name: user.name,
              email: user.email,
              phone: profile?.phone ?? '',
              address: profile?.address ?? '',
              city: profile?.city ?? '',
              country: profile?.country ?? '',
              postalCode: profile?.postalCode ?? '',
              nationality: profile?.nationality ?? '',
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}
