import { Suspense } from 'react'
import { notFound, redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/admin'
import EditUserForm from '@/app/users/[id]/EditUserForm'
import { Building2, FileText, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { AdminStatCard, AdminBadge } from '@/components/admin'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

async function UserDetails({ userId }: { userId: string }) {
  // Fetch user details with stats
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'}/api/users/${userId}`,
    {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    }
  )

  if (!response.ok) {
    if (response.status === 404) {
      notFound()
    }
    throw new Error('Failed to fetch user')
  }

  const { user: userData, stats } = await response.json()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/users"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-charcoal">Edit User</h1>
          <p className="text-sm text-dark-gray mt-1">
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
      <div className="bg-white rounded-lg border border-light-gray p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-charcoal">User Information</h2>
          <p className="text-sm text-dark-gray mt-1">
            Update user details and permissions
          </p>
        </div>

        <EditUserForm user={userData} />
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-lg border border-red-200 p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-red-600">Danger Zone</h2>
          <p className="text-sm text-dark-gray mt-1">
            Irreversible and destructive actions
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-charcoal">Delete User</h3>
            <p className="text-sm text-dark-gray mt-1">
              Permanently delete this user and all their data
            </p>
          </div>
          <form action={`/api/users/${userId}`} method="DELETE">
            <button
              type="submit"
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
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
  await requireAdmin()
  const { id } = await params

  return (
    <Suspense fallback={<div className="animate-pulse">Loading user...</div>}>
      <UserDetails userId={id} />
    </Suspense>
  )
}
