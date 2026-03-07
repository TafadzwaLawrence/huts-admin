import { createClient, createAdminClient } from '@/lib/supabase/server'

import Link from 'next/link'
import { 
  Building2, 
  Users, 
  ShieldCheck, 
  ShieldAlert,
  ShieldX,
  Star,
  ArrowUpRight,
} from 'lucide-react'
import { AdminStatCard, AdminBadge } from '@/components/admin'

export default async function AdminOverviewPage() {
  const supabase = await createClient()

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
    { count: totalConversations },
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
    admin.from('conversations').select('*', { count: 'exact', head: true }),
    admin.from('reviews').select('*', { count: 'exact', head: true }),
    admin.from('properties').select(`
      id, title, slug, city, listing_type, price, sale_price, created_at,
      profiles!properties_user_id_fkey(name, email)
    `).eq('verification_status', 'pending').order('created_at', { ascending: false }).limit(5),
    admin.from('profiles').select('id, name, email, role, created_at').order('created_at', { ascending: false }).limit(5),
  ])

  const today = new Date()
  const dateString = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs text-[#ADB5BD] font-medium uppercase tracking-wider mb-2">{dateString}</p>
        <h1 className="text-2xl md:text-3xl font-bold text-[#212529] tracking-tight">
          Admin Dashboard
        </h1>
      </div>

      {/* Alert: Pending Properties */}
      {(pendingProperties || 0) > 0 && (
        <Link
          href="/verification"
          className="flex items-center gap-4 bg-[#F8F9FA] border border-[#E9ECEF] rounded-xl p-4 mb-6 group hover:border-[#212529] transition-colors"
        >
          <div className="w-10 h-10 bg-[#E9ECEF] rounded-xl flex items-center justify-center flex-shrink-0">
            <ShieldAlert size={20} className="text-[#495057]" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-[#212529]">
              {pendingProperties} {pendingProperties === 1 ? 'property' : 'properties'} awaiting verification
            </p>
            <p className="text-xs text-[#495057]">Review and approve or reject pending listings</p>
          </div>
          <ArrowUpRight size={16} className="text-[#495057] opacity-0 group-hover:opacity-100 transition-opacity" />
        </Link>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <AdminStatCard
          label="Total Properties"
          value={totalProperties || 0}
          icon={Building2}
          href="/properties"
        />
        <AdminStatCard
          label="Pending Review"
          value={pendingProperties || 0}
          icon={ShieldAlert}
          href="/verification"
          highlight={!!pendingProperties}
        />
        <AdminStatCard
          label="Total Users"
          value={totalUsers || 0}
          icon={Users}
          href="/users"
        />
        <AdminStatCard
          label="Reviews"
          value={totalReviews || 0}
          icon={Star}
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
        <MiniStat label="Active" value={activeProperties || 0} />
        <MiniStat label="Approved" value={approvedProperties || 0} />
        <MiniStat label="Rejected" value={rejectedProperties || 0} />
        <MiniStat label="Landlords" value={landlordCount || 0} />
        <MiniStat label="Renters" value={renterCount || 0} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Properties */}
        <div className="bg-white rounded-xl border border-[#E9ECEF] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#F1F3F5]">
            <h2 className="text-sm font-semibold text-[#212529] flex items-center gap-2">
              <ShieldAlert size={15} className="text-[#495057]" />
              Pending Verification
            </h2>
            <Link href="/verification" className="text-xs text-[#495057] hover:text-[#212529] font-medium transition-colors">
              View all →
            </Link>
          </div>
          {recentPending && recentPending.length > 0 ? (
            <div className="divide-y divide-[#F1F3F5]">
              {recentPending.map((property: any) => (
                <div key={property.id} className="px-5 py-3.5 flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[#212529] truncate">{property.title}</p>
                    <p className="text-xs text-[#ADB5BD] mt-0.5">
                      {(property.profiles as any)?.name || 'Unknown'} · {property.city}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <AdminBadge 
                      variant="warning" 
                      label={property.listing_type === 'sale' ? 'Sale' : 'Rent'}
                      showIcon={false}
                      size="sm"
                    />
                    <Link
                      href={`/verification`}
                      className="text-[11px] font-medium text-[#495057] hover:text-[#212529] border border-[#E9ECEF] hover:border-[#212529] px-2.5 py-1 rounded-md transition-colors"
                    >
                      Review
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center">
              <ShieldCheck size={24} className="mx-auto text-[#51CF66] mb-2" />
              <p className="text-sm text-[#ADB5BD]">All caught up!</p>
            </div>
          )}
        </div>

        {/* Recent Users */}
        <div className="bg-white rounded-xl border border-[#E9ECEF] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#F1F3F5]">
            <h2 className="text-sm font-semibold text-[#212529] flex items-center gap-2">
              <Users size={15} className="text-[#495057]" />
              Recent Users
            </h2>
            <Link href="/users" className="text-xs text-[#495057] hover:text-[#212529] font-medium transition-colors">
              View all →
            </Link>
          </div>
          {recentUsers && recentUsers.length > 0 ? (
            <div className="divide-y divide-[#F1F3F5]">
              {recentUsers.map((u: any) => (
                <div key={u.id} className="px-5 py-3.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-[#F8F9FA] flex items-center justify-center text-xs font-bold text-[#495057] flex-shrink-0">
                      {(u.name || u.email || '?')[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#212529] truncate">{u.name || 'No name'}</p>
                      <p className="text-xs text-[#ADB5BD] truncate">{u.email}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold flex-shrink-0 ${
                    u.role === 'landlord' 
                      ? 'bg-[#212529] text-white' 
                      : 'bg-[#F8F9FA] text-[#495057]'
                  }`}>
                    {u.role}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center">
              <p className="text-sm text-[#ADB5BD]">No users yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white rounded-xl border border-[#E9ECEF] px-4 py-3">
      <p className="text-lg font-bold text-[#212529] tabular-nums">{value}</p>
      <p className="text-[10px] text-[#ADB5BD] font-medium uppercase tracking-wider">{label}</p>
    </div>
  )
}
