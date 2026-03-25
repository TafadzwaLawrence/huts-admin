import { Suspense } from 'react'
import { notFound, redirect } from 'next/navigation'
import { checkIsAdmin } from '@/lib/admin'
import { createAdminClient } from '@/lib/supabase/server'
import EditUserForm from '@/app/users/[id]/EditUserForm'
import { Building2, FileText, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { AdminStatCard } from '@/components/admin'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

async function UserDetails({ userId }: { userId: string }) {
  const admin = createAdminClient()

  const { data: userData, error } = await admin
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error || !userData) notFound()

  const [{ count: propertiesCount }, { count: reviewsCount }] = await Promise.all([
    admin.from('properties').select('*', { count: 'exact', head: true }).eq('user_id', userId),
    admin.from('reviews').select('*', { count: 'exact', head: true }).eq('author_id', userId),
  ])

  const stats = {
    propertiesCount: propertiesCount ?? 0,
    reviewsWritten: reviewsCount ?? 0,
    reviewsReceived: 0,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/users"
          className="p-2 hover:bg-adm-surface-2 transition-colors"
        >
          <ArrowLeft size={20} className="text-adm-muted" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-adm-text">Edit User</h1>
          <p className="text-sm text-adm-muted mt-1">
            User ID: {userId}
          </p>
        </div>
      </div>

      {/* User Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <AdminStatCard
          label="Properties"
          value={stats.propertiesCount}
          icon={Building2}
        />
        <AdminStatCard
          label="Reviews Written"
          value={stats.reviewsWritten}
          icon={FileText}
        />
        <AdminStatCard
          label="Reviews Received"
          value={stats.reviewsReceived}
          icon={FileText}
        />
      </div>

      {/* Edit Form */}
      <div className="bg-adm-surface border border-adm-border p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-adm-text">User Information</h2>
          <p className="text-sm text-adm-muted mt-1">
            Update user details and permissions
          </p>
        </div>

        <EditUserForm user={userData} />
      </div>

      {/* Danger Zone */}
      <div className="bg-adm-surface border border-adm-red/20 p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-adm-red">Danger Zone</h2>
          <p className="text-sm text-adm-muted mt-1">
            Irreversible and destructive actions
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-adm-text">Delete User</h3>
            <p className="text-sm text-adm-muted mt-1">
              Permanently delete this user and all their data
            </p>
          </div>
          <form action={`/api/users/${userId}`} method="DELETE">
            <button
              type="submit"
              className="px-4 py-2 bg-adm-red text-white hover:bg-adm-red/80 transition-colors"
              onClick={(e) => {
                if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
                  e.preventDefault()
                }
              }}
            >
              Delete User
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default async function Page({ params }: PageProps) {
  const { isAdmin } = await checkIsAdmin()
  if (!isAdmin) redirect('/unauthorized')
  const { id } = await params

  return (
    <Suspense fallback={<div className="animate-pulse">Loading user...</div>}>
      <UserDetails userId={id} />
    </Suspense>
  )
}
