import { createAdminClient } from '@/lib/supabase/server'
import Link from 'next/link'
import {
  Building2,
  Users,
  ShieldCheck,
  ShieldAlert,
  Star,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react'
import { AdminStatCard, AdminBadge } from '@/components/admin'

export const metadata = { title: 'Dashboard | Huts Admin' }

export default async function AdminOverviewPage() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-adm-faint text-sm">Configure your Supabase environment variables to view the dashboard.</p>
      </div>
    )
  }

  const admin = createAdminClient()

  const [
    { count: totalProperties },
    { count: pendingProperties },
    { count: approvedProperties },
    { count: rejectedProperties },
    { count: activeProperties },
    { count: totalUsers },
    { count: landlordCount },
    { count: renterCount },
    { count: totalReviews },
    { data: recentPending },
    { data: recentUsers },
  ] = await Promise.all([
    admin.from('properties').select('*', { count: 'exact', head: true }),
    admin.from('properties').select('*', { count: 'exact', head: true }).eq('verification_status', 'pending'),
    admin.from('properties').select('*', { count: 'exact', head: true }).eq('verification_status', 'approved'),
    admin.from('properties').select('*', { count: 'exact', head: true }).eq('verification_status', 'rejected'),
    admin.from('properties').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    admin.from('profiles').select('*', { count: 'exact', head: true }),
    admin.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'landlord'),
    admin.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'renter'),
    admin.from('reviews').select('*', { count: 'exact', head: true }),
    admin.from('properties').select(`
      id, title, city, listing_type, created_at,
      profiles!properties_user_id_fkey(name, email)
    `).eq('verification_status', 'pending').order('created_at', { ascending: false }).limit(5),
    admin.from('profiles').select('id, name, email, role, created_at').order('created_at', { ascending: false }).limit(5),
  ])

  const dateString = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  })

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs text-adm-faint font-medium uppercase tracking-wider mb-1">{dateString}</p>
        <h1 className="text-2xl font-bold text-adm-text">Dashboard</h1>
      </div>

      {/* Pending alert */}
      {(pendingProperties || 0) > 0 && (
        <Link
          href="/verification"
          className="flex items-center gap-4 bg-adm-amber/5 border border-adm-amber/20 rounded-xl p-4 mb-6 group hover:border-adm-amber/40 transition-colors"
        >
          <div className="w-10 h-10 bg-adm-amber/10 rounded-xl flex items-center justify-center flex-shrink-0">
            <ShieldAlert size={20} className="text-adm-amber" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-adm-text">
              {pendingProperties} {pendingProperties === 1 ? 'property' : 'properties'} awaiting verification
            </p>
            <p className="text-xs text-adm-muted">Review and approve or reject pending listings</p>
          </div>
          <ArrowUpRight size={16} className="text-adm-muted opacity-0 group-hover:opacity-100 transition-opacity" />
        </Link>
      )}

      {/* Primary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <AdminStatCard label="Total Properties" value={totalProperties || 0} icon={Building2} href="/properties" />
        <AdminStatCard label="Pending Review" value={pendingProperties || 0} icon={ShieldAlert} href="/verification" highlight={(pendingProperties || 0) > 0} />
        <AdminStatCard label="Total Users" value={totalUsers || 0} icon={Users} href="/users" />
        <AdminStatCard label="Reviews" value={totalReviews || 0} icon={Star} />
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
        {[
          { label: 'Active', value: activeProperties || 0 },
          { label: 'Approved', value: approvedProperties || 0 },
          { label: 'Rejected', value: rejectedProperties || 0 },
          { label: 'Landlords', value: landlordCount || 0 },
          { label: 'Renters', value: renterCount || 0 },
        ].map((s) => (
          <div key={s.label} className="bg-adm-surface rounded-xl border border-adm-border p-4">
            <p className="text-xl font-bold text-adm-text tabular-nums">{s.value}</p>
            <p className="text-xs text-adm-muted mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Pending properties */}
        <div className="bg-adm-surface rounded-xl border border-adm-border overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-adm-border">
            <h2 className="text-sm font-semibold text-adm-text flex items-center gap-2">
              <ShieldAlert size={14} className="text-adm-amber" />
              Pending Verification
            </h2>
            <Link href="/verification" className="text-xs text-adm-muted hover:text-adm-text transition-colors font-medium">
              View all →
            </Link>
          </div>
          {recentPending && recentPending.length > 0 ? (
            <div className="divide-y divide-adm-border">
              {recentPending.map((p: any) => (
                <div key={p.id} className="px-5 py-3.5 flex items-center justify-between gap-3 hover:bg-adm-surface-2 transition-colors">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-adm-text truncate">{p.title}</p>
                    <p className="text-xs text-adm-muted mt-0.5">
                      {(p.profiles as any)?.name || 'Unknown'} · {p.city}
                    </p>
                  </div>
                  <AdminBadge
                    variant="pending"
                    label={p.listing_type === 'sale' ? 'Sale' : 'Rent'}
                    showIcon={false}
                    size="sm"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="px-5 py-10 text-center">
              <ShieldCheck size={28} className="mx-auto text-adm-faint mb-2" />
              <p className="text-sm text-adm-muted">All clear — nothing pending</p>
            </div>
          )}
        </div>

        {/* Recent users */}
        <div className="bg-adm-surface rounded-xl border border-adm-border overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-adm-border">
            <h2 className="text-sm font-semibold text-adm-text flex items-center gap-2">
              <TrendingUp size={14} className="text-adm-accent" />
              Recent Sign-ups
            </h2>
            <Link href="/users" className="text-xs text-adm-muted hover:text-adm-text transition-colors font-medium">
              View all →
            </Link>
          </div>
          {recentUsers && recentUsers.length > 0 ? (
            <div className="divide-y divide-adm-border">
              {recentUsers.map((u: any) => (
                <Link
                  key={u.id}
                  href={`/users/${u.id}`}
                  className="px-5 py-3.5 flex items-center gap-3 hover:bg-adm-surface-2 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-adm-accent/15 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-adm-accent">
                      {(u.name || u.email)?.[0]?.toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-adm-text truncate">{u.name || 'No name'}</p>
                    <p className="text-xs text-adm-muted truncate">{u.email}</p>
                  </div>
                  <AdminBadge variant={u.role === 'landlord' ? 'active' : 'inactive'} label={u.role} showIcon={false} size="sm" />
                </Link>
              ))}
            </div>
          ) : (
            <div className="px-5 py-10 text-center">
              <Users size={28} className="mx-auto text-adm-faint mb-2" />
              <p className="text-sm text-adm-muted">No users yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
