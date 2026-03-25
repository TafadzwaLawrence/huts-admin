import { createAdminClient } from '@/lib/supabase/server'
import Link from 'next/link'
import {
  Building2,
  Users,
  ShieldCheck,
  ShieldAlert,
  ArrowUpRight,
  TrendingUp,
  Briefcase,
  MessageSquare,
  Star,
  Activity,
  CreditCard,
  FileText,
  Eye,
  Bookmark,
  Search,
  CheckCircle2,
  XCircle,
  Flag,
  Clock,
  Home,
  DollarSign,
  AlertCircle,
  UserCheck,
} from 'lucide-react'
import { AdminStatCard, AdminBadge } from '@/components/admin'

export const metadata = { title: 'Platform Overview | Huts Admin' }

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

const ACTION_META: Record<string, { label: string; colorClass: string }> = {
  property_approved:  { label: 'Approved property',  colorClass: 'text-adm-green' },
  property_rejected:  { label: 'Rejected property',  colorClass: 'text-adm-red' },
  property_edited:    { label: 'Edited property',    colorClass: 'text-adm-accent' },
  property_deleted:   { label: 'Deleted property',   colorClass: 'text-adm-red' },
  user_edited:        { label: 'Edited user',        colorClass: 'text-adm-accent' },
  user_suspended:     { label: 'Suspended user',     colorClass: 'text-adm-amber' },
  user_unsuspended:   { label: 'Unsuspended user',   colorClass: 'text-adm-green' },
  user_deleted:       { label: 'Deleted user',       colorClass: 'text-adm-red' },
  bulk_approve:       { label: 'Bulk approved',      colorClass: 'text-adm-green' },
  bulk_reject:        { label: 'Bulk rejected',      colorClass: 'text-adm-red' },
  bulk_delete:        { label: 'Bulk deleted',       colorClass: 'text-adm-red' },
  review_deleted:     { label: 'Deleted review',     colorClass: 'text-adm-red' },
  other:              { label: 'Admin action',       colorClass: 'text-adm-muted' },
}

export default async function AdminOverviewPage() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-adm-faint text-sm">Configure Supabase environment variables to view the dashboard.</p>
      </div>
    )
  }

  const db = createAdminClient()
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const [
    // ── Properties ──────────────────────────────────────────────────────
    { count: totalProperties },
    { count: pendingProperties },
    { count: approvedProperties },
    { count: rejectedProperties },
    { count: activeProperties },
    { count: saleProperties },
    { count: rentProperties },
    // ── Users ────────────────────────────────────────────────────────────
    { count: totalUsers },
    { count: landlordCount },
    { count: renterCount },
    { count: agentUserCount },
    { count: newUsersMonth },
    // ── Agents ───────────────────────────────────────────────────────────
    { count: totalAgents },
    { count: pendingAgents },
    { count: activeAgents },
    { count: suspendedAgents },
    // ── Reviews ──────────────────────────────────────────────────────────
    { count: totalReviews },
    { count: pendingReviews },
    { count: flaggedReviews },
    { count: publishedReviews },
    // ── Rental / Payments ────────────────────────────────────────────────
    { count: activeLeases },
    { count: completedLeases },
    { count: overduePayments },
    { count: paidThisMonth },
    // ── Transactions ──────────────────────────────────────────────────────
    { count: totalTransactions },
    { count: closedTransactions },
    // ── Engagement ───────────────────────────────────────────────────────
    { count: totalConversations },
    { count: totalViews },
    { count: savedProperties },
    { count: totalLeads },
    { count: newLeads },
    { count: newInquiries },
    // ── Recent data for feed panels ───────────────────────────────────────
    { data: recentActivity },
    { data: recentPending },
    { data: recentUsers },
    { data: modReviews },
    { data: recentLeads },
  ] = await Promise.all([
    // Properties
    db.from('properties').select('*', { count: 'exact', head: true }),
    db.from('properties').select('*', { count: 'exact', head: true }).eq('verification_status', 'pending'),
    db.from('properties').select('*', { count: 'exact', head: true }).eq('verification_status', 'approved'),
    db.from('properties').select('*', { count: 'exact', head: true }).eq('verification_status', 'rejected'),
    db.from('properties').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    db.from('properties').select('*', { count: 'exact', head: true }).eq('listing_type', 'sale'),
    db.from('properties').select('*', { count: 'exact', head: true }).eq('listing_type', 'rent'),
    // Users
    db.from('profiles').select('*', { count: 'exact', head: true }),
    db.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'landlord'),
    db.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'renter'),
    db.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'agent'),
    db.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', startOfMonth),
    // Agents
    db.from('agents').select('*', { count: 'exact', head: true }),
    db.from('agents').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    db.from('agents').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    db.from('agents').select('*', { count: 'exact', head: true }).eq('status', 'suspended'),
    // Reviews
    db.from('reviews').select('*', { count: 'exact', head: true }),
    db.from('reviews').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    db.from('reviews').select('*', { count: 'exact', head: true }).eq('status', 'flagged'),
    db.from('reviews').select('*', { count: 'exact', head: true }).eq('status', 'published'),
    // Rental / Payments
    db.from('rental_agreements').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    db.from('rental_agreements').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
    db.from('rent_payments').select('*', { count: 'exact', head: true }).eq('status', 'overdue'),
    db.from('rent_payments').select('*', { count: 'exact', head: true }).eq('status', 'paid').gte('paid_at', startOfMonth),
    // Transactions
    db.from('transactions').select('*', { count: 'exact', head: true }),
    db.from('transactions').select('*', { count: 'exact', head: true }).eq('status', 'closed'),
    // Engagement
    db.from('conversations').select('*', { count: 'exact', head: true }),
    db.from('property_views').select('*', { count: 'exact', head: true }),
    db.from('saved_properties').select('*', { count: 'exact', head: true }),
    db.from('leads').select('*', { count: 'exact', head: true }),
    db.from('leads').select('*', { count: 'exact', head: true }).eq('status', 'new'),
    db.from('agent_inquiries').select('*', { count: 'exact', head: true }).eq('status', 'new'),
    // Recent admin activity log (with admin name)
    db.from('admin_activity_logs')
      .select('id, action, resource_type, resource_id, created_at, profiles!admin_activity_logs_admin_id_fkey(full_name, email)')
      .order('created_at', { ascending: false })
      .limit(10),
    // Pending property verifications
    db.from('properties')
      .select('id, title, city, listing_type, created_at, profiles!properties_user_id_fkey(full_name, email)')
      .eq('verification_status', 'pending')
      .order('created_at', { ascending: false })
      .limit(6),
    // Recent sign-ups
    db.from('profiles')
      .select('id, full_name, email, role, created_at')
      .order('created_at', { ascending: false })
      .limit(6),
    // Reviews needing moderation
    db.from('reviews')
      .select('id, title, rating, status, created_at, profiles!reviews_author_id_fkey(full_name), properties!reviews_property_id_fkey(title, city)')
      .in('status', ['pending', 'flagged'])
      .order('created_at', { ascending: false })
      .limit(5),
    // Recent leads
    db.from('leads')
      .select('id, contact_name, lead_type, status, created_at')
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const dateString = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  const alerts = [
    (pendingProperties || 0) > 0 && {
      href: '/verification',
      icon: ShieldAlert,
      color: 'amber' as const,
      title: `${pendingProperties} ${pendingProperties === 1 ? 'property' : 'properties'} awaiting verification`,
      sub: 'Review and approve or reject pending listings',
    },
    (pendingAgents || 0) > 0 && {
      href: '/agents',
      icon: Briefcase,
      color: 'amber' as const,
      title: `${pendingAgents} ${pendingAgents === 1 ? 'agent' : 'agents'} awaiting approval`,
      sub: 'Review pending agent applications',
    },
    (flaggedReviews || 0) > 0 && {
      href: '/reviews',
      icon: Flag,
      color: 'red' as const,
      title: `${flaggedReviews} ${flaggedReviews === 1 ? 'review' : 'reviews'} flagged for moderation`,
      sub: 'Inspect and take action on flagged content',
    },
    (overduePayments || 0) > 0 && {
      href: '/users',
      icon: CreditCard,
      color: 'red' as const,
      title: `${overduePayments} overdue rent ${overduePayments === 1 ? 'payment' : 'payments'}`,
      sub: 'Tenants with outstanding rent obligations',
    },
    (newLeads || 0) > 0 && {
      href: '/agents',
      icon: Search,
      color: 'amber' as const,
      title: `${newLeads} new unassigned ${newLeads === 1 ? 'lead' : 'leads'}`,
      sub: 'Assign incoming leads to agents',
    },
  ].filter(Boolean) as Array<{ href: string; icon: any; color: 'amber' | 'red'; title: string; sub: string }>

  return (
    <div className="animate-fadeIn space-y-6 pb-10">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div>
        <p className="text-xs text-adm-faint font-medium uppercase tracking-wider mb-1">{dateString}</p>
        <h1 className="text-2xl font-bold text-adm-text">Platform Overview</h1>
        <p className="text-xs text-adm-muted mt-1">Real-time snapshot of every dimension in the system</p>
      </div>

      {/* ── Alerts ──────────────────────────────────────────────────────── */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((a) => (
            <Link
              key={a.href + a.title}
              href={a.href}
              className={`flex items-center gap-4 border p-4 group transition-colors ${
                a.color === 'amber'
                  ? 'bg-adm-amber/5 border-adm-amber/20 hover:border-adm-amber/40'
                  : 'bg-adm-red/5 border-adm-red/20 hover:border-adm-red/40'
              }`}
            >
              <div className={`w-9 h-9 flex items-center justify-center flex-shrink-0 ${
                a.color === 'amber' ? 'bg-adm-amber/10' : 'bg-adm-red/10'
              }`}>
                <a.icon size={17} className={a.color === 'amber' ? 'text-adm-amber' : 'text-adm-red'} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-adm-text">{a.title}</p>
                <p className="text-xs text-adm-muted">{a.sub}</p>
              </div>
              <ArrowUpRight size={14} className="text-adm-faint opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
            </Link>
          ))}
        </div>
      )}

      {/* ── Primary KPI row ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <AdminStatCard label="Total Properties"    value={totalProperties  || 0} icon={Building2}   href="/properties" />
        <AdminStatCard label="Pending Verification" value={pendingProperties || 0} icon={ShieldAlert}  href="/verification" highlight={(pendingProperties || 0) > 0} />
        <AdminStatCard label="Total Users"          value={totalUsers       || 0} icon={Users}        href="/users" />
        <AdminStatCard label="Total Agents"         value={totalAgents      || 0} icon={Briefcase}    href="/agents" />
      </div>

      {/* ── Secondary KPI row ───────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <AdminStatCard label="Total Reviews"        value={totalReviews     || 0} icon={Star}         href="/reviews" />
        <AdminStatCard label="Active Leases"        value={activeLeases     || 0} icon={FileText}     href="/users" />
        <AdminStatCard label="Overdue Payments"     value={overduePayments  || 0} icon={CreditCard}   href="/users" highlight={(overduePayments || 0) > 0} />
        <AdminStatCard label="Total Transactions"   value={totalTransactions|| 0} icon={DollarSign}   href="/users" />
      </div>

      {/* ── Platform breakdown ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">

        {/* Properties */}
        <div className="bg-adm-surface border border-adm-border p-5">
          <h3 className="text-xs font-semibold text-adm-muted uppercase tracking-wider mb-4 flex items-center gap-2">
            <Building2 size={12} /> Properties
          </h3>
          <div className="space-y-3">
            {[
              { label: 'Active listings',    value: activeProperties   || 0, dot: 'bg-adm-green' },
              { label: 'For rent',           value: rentProperties     || 0, dot: 'bg-adm-accent' },
              { label: 'For sale',           value: saleProperties     || 0, dot: 'bg-adm-amber' },
              { label: 'Approved',           value: approvedProperties || 0, dot: 'bg-adm-green' },
              { label: 'Rejected',           value: rejectedProperties || 0, dot: 'bg-adm-red' },
              { label: 'Awaiting review',    value: pendingProperties  || 0, dot: 'bg-adm-amber' },
            ].map((r) => (
              <div key={r.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 ${r.dot} flex-shrink-0`} />
                  <span className="text-xs text-adm-muted">{r.label}</span>
                </div>
                <span className="text-sm font-semibold text-adm-text tabular-nums">{r.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Users */}
        <div className="bg-adm-surface border border-adm-border p-5">
          <h3 className="text-xs font-semibold text-adm-muted uppercase tracking-wider mb-4 flex items-center gap-2">
            <Users size={12} /> Users
          </h3>
          <div className="space-y-3">
            {[
              { label: 'Total accounts',     value: totalUsers     || 0, dot: 'bg-adm-text' },
              { label: 'Landlords',          value: landlordCount  || 0, dot: 'bg-adm-green' },
              { label: 'Renters',            value: renterCount    || 0, dot: 'bg-adm-accent' },
              { label: 'Agent accounts',     value: agentUserCount || 0, dot: 'bg-adm-amber' },
              { label: 'New this month',     value: newUsersMonth  || 0, dot: 'bg-adm-green' },
              { label: 'Conversations',      value: totalConversations || 0, dot: 'bg-adm-faint' },
            ].map((r) => (
              <div key={r.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 ${r.dot} flex-shrink-0`} />
                  <span className="text-xs text-adm-muted">{r.label}</span>
                </div>
                <span className="text-sm font-semibold text-adm-text tabular-nums">{r.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Agents */}
        <div className="bg-adm-surface border border-adm-border p-5">
          <h3 className="text-xs font-semibold text-adm-muted uppercase tracking-wider mb-4 flex items-center gap-2">
            <Briefcase size={12} /> Agents
          </h3>
          <div className="space-y-3">
            {[
              { label: 'Total registered',  value: totalAgents    || 0, dot: 'bg-adm-text' },
              { label: 'Active',            value: activeAgents   || 0, dot: 'bg-adm-green' },
              { label: 'Pending approval',  value: pendingAgents  || 0, dot: 'bg-adm-amber' },
              { label: 'Suspended',         value: suspendedAgents|| 0, dot: 'bg-adm-red' },
              { label: 'Agent inquiries',   value: newInquiries   || 0, dot: 'bg-adm-accent' },
              { label: 'Total leads',       value: totalLeads     || 0, dot: 'bg-adm-faint' },
            ].map((r) => (
              <div key={r.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 ${r.dot} flex-shrink-0`} />
                  <span className="text-xs text-adm-muted">{r.label}</span>
                </div>
                <span className="text-sm font-semibold text-adm-text tabular-nums">{r.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Reviews & Payments */}
        <div className="bg-adm-surface border border-adm-border p-5">
          <h3 className="text-xs font-semibold text-adm-muted uppercase tracking-wider mb-4 flex items-center gap-2">
            <Star size={12} /> Reviews &amp; Payments
          </h3>
          <div className="space-y-3">
            {[
              { label: 'Published reviews',  value: publishedReviews || 0, dot: 'bg-adm-green' },
              { label: 'Pending reviews',    value: pendingReviews   || 0, dot: 'bg-adm-amber' },
              { label: 'Flagged reviews',    value: flaggedReviews   || 0, dot: 'bg-adm-red' },
              { label: 'Active leases',      value: activeLeases     || 0, dot: 'bg-adm-green' },
              { label: 'Completed leases',   value: completedLeases  || 0, dot: 'bg-adm-faint' },
              { label: 'Paid this month',    value: paidThisMonth    || 0, dot: 'bg-adm-accent' },
            ].map((r) => (
              <div key={r.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 ${r.dot} flex-shrink-0`} />
                  <span className="text-xs text-adm-muted">{r.label}</span>
                </div>
                <span className="text-sm font-semibold text-adm-text tabular-nums">{r.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Engagement metrics strip ────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Property views',    value: totalViews    || 0, icon: Eye },
          { label: 'Saved properties',  value: savedProperties || 0, icon: Bookmark },
          { label: 'Conversations',     value: totalConversations || 0, icon: MessageSquare },
          { label: 'Total leads',       value: totalLeads    || 0, icon: Search },
          { label: 'Transactions',      value: totalTransactions || 0, icon: Activity },
        ].map((s) => (
          <div key={s.label} className="bg-adm-surface border border-adm-border p-4 flex items-start gap-3">
            <div className="w-8 h-8 bg-adm-surface-2 flex items-center justify-center flex-shrink-0 mt-0.5">
              <s.icon size={14} className="text-adm-muted" />
            </div>
            <div>
              <p className="text-xl font-bold text-adm-text tabular-nums leading-none">{s.value.toLocaleString()}</p>
              <p className="text-[11px] text-adm-muted mt-1">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Three-panel feed ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Pending verifications */}
        <div className="bg-adm-surface border border-adm-border overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-adm-border">
            <h2 className="text-sm font-semibold text-adm-text flex items-center gap-2">
              <ShieldAlert size={13} className="text-adm-amber" /> Pending Verification
            </h2>
            <Link href="/verification" className="text-xs text-adm-muted hover:text-adm-text transition-colors font-medium flex items-center gap-1">
              View all <ArrowUpRight size={11} />
            </Link>
          </div>
          {recentPending && recentPending.length > 0 ? (
            <div className="divide-y divide-adm-border">
              {recentPending.map((p: any) => (
                <Link key={p.id} href="/verification" className="px-5 py-3 flex items-center gap-3 hover:bg-adm-surface-2 transition-colors">
                  <div className="w-7 h-7 bg-adm-amber/10 flex items-center justify-center flex-shrink-0">
                    <Home size={12} className="text-adm-amber" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-adm-text truncate">{p.title}</p>
                    <p className="text-[11px] text-adm-muted mt-0.5 truncate">
                      {(p.profiles as any)?.full_name || 'Unknown'} · {p.city}
                    </p>
                  </div>
                  <span className="text-[10px] text-adm-amber bg-adm-amber/10 px-2 py-0.5 flex-shrink-0 font-medium">
                    {p.listing_type === 'sale' ? 'Sale' : 'Rent'}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="px-5 py-10 text-center">
              <ShieldCheck size={24} className="mx-auto text-adm-faint mb-2" />
              <p className="text-xs text-adm-muted">All clear — nothing pending</p>
            </div>
          )}
        </div>

        {/* Recent sign-ups */}
        <div className="bg-adm-surface border border-adm-border overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-adm-border">
            <h2 className="text-sm font-semibold text-adm-text flex items-center gap-2">
              <TrendingUp size={13} className="text-adm-accent" /> Recent Sign-ups
            </h2>
            <Link href="/users" className="text-xs text-adm-muted hover:text-adm-text transition-colors font-medium flex items-center gap-1">
              View all <ArrowUpRight size={11} />
            </Link>
          </div>
          {recentUsers && recentUsers.length > 0 ? (
            <div className="divide-y divide-adm-border">
              {recentUsers.map((u: any) => (
                <Link key={u.id} href={`/users/${u.id}`} className="px-5 py-3 flex items-center gap-3 hover:bg-adm-surface-2 transition-colors">
                  <div className="w-7 h-7 bg-adm-accent/15 flex items-center justify-center flex-shrink-0 font-bold text-adm-accent text-xs">
                    {(u.full_name || u.email)?.[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-adm-text truncate">{u.full_name || 'No name'}</p>
                    <p className="text-[11px] text-adm-muted truncate">{u.email}</p>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 flex-shrink-0 font-medium ${
                    u.role === 'landlord' ? 'text-adm-green bg-adm-green/10' :
                    u.role === 'agent'    ? 'text-adm-amber bg-adm-amber/10' :
                                           'text-adm-faint bg-adm-surface-2'
                  }`}>{u.role}</span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="px-5 py-10 text-center">
              <Users size={24} className="mx-auto text-adm-faint mb-2" />
              <p className="text-xs text-adm-muted">No users yet</p>
            </div>
          )}
        </div>

        {/* Admin activity log */}
        <div className="bg-adm-surface border border-adm-border overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-adm-border">
            <h2 className="text-sm font-semibold text-adm-text flex items-center gap-2">
              <Activity size={13} className="text-adm-accent" /> Admin Activity
            </h2>
          </div>
          {recentActivity && recentActivity.length > 0 ? (
            <div className="divide-y divide-adm-border">
              {recentActivity.map((log: any) => {
                const meta = ACTION_META[log.action] ?? ACTION_META.other
                return (
                  <div key={log.id} className="px-5 py-3 flex items-start gap-3">
                    <div className="w-1.5 h-1.5 mt-1.5 flex-shrink-0 bg-adm-border" />
                    <div className="min-w-0 flex-1">
                      <p className={`text-xs font-medium ${meta.colorClass}`}>{meta.label}</p>
                      <p className="text-[11px] text-adm-muted truncate mt-0.5">
                        {(log.profiles as any)?.full_name || 'Admin'} · {log.resource_type}
                      </p>
                    </div>
                    <span className="text-[10px] text-adm-faint flex-shrink-0 mt-0.5">{timeAgo(log.created_at)}</span>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="px-5 py-10 text-center">
              <Clock size={24} className="mx-auto text-adm-faint mb-2" />
              <p className="text-xs text-adm-muted">No activity recorded yet</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Two-panel row: Reviews needing action + Recent leads ─────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Reviews needing moderation */}
        <div className="bg-adm-surface border border-adm-border overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-adm-border">
            <h2 className="text-sm font-semibold text-adm-text flex items-center gap-2">
              <Flag size={13} className="text-adm-red" /> Reviews Needing Action
              {((pendingReviews || 0) + (flaggedReviews || 0)) > 0 && (
                <span className="text-[10px] bg-adm-red/15 text-adm-red px-1.5 py-0.5 font-semibold">
                  {(pendingReviews || 0) + (flaggedReviews || 0)}
                </span>
              )}
            </h2>
            <Link href="/reviews" className="text-xs text-adm-muted hover:text-adm-text transition-colors font-medium flex items-center gap-1">
              Manage <ArrowUpRight size={11} />
            </Link>
          </div>
          {modReviews && modReviews.length > 0 ? (
            <div className="divide-y divide-adm-border">
              {modReviews.map((r: any) => (
                <Link key={r.id} href="/reviews" className="px-5 py-3 flex items-center gap-3 hover:bg-adm-surface-2 transition-colors">
                  <div className={`w-7 h-7 flex items-center justify-center flex-shrink-0 text-[10px] font-bold ${
                    r.status === 'flagged' ? 'bg-adm-red/10 text-adm-red' : 'bg-adm-amber/10 text-adm-amber'
                  }`}>
                    {'★'.repeat(Math.min(r.rating, 5))}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-adm-text truncate">{r.title}</p>
                    <p className="text-[11px] text-adm-muted truncate mt-0.5">
                      {(r.profiles as any)?.full_name || 'Unknown'} · {(r.properties as any)?.city || ''}
                    </p>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 flex-shrink-0 font-medium ${
                    r.status === 'flagged' ? 'text-adm-red bg-adm-red/10' : 'text-adm-amber bg-adm-amber/10'
                  }`}>{r.status}</span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="px-5 py-10 text-center">
              <CheckCircle2 size={24} className="mx-auto text-adm-faint mb-2" />
              <p className="text-xs text-adm-muted">No reviews need attention</p>
            </div>
          )}
        </div>

        {/* Recent leads */}
        <div className="bg-adm-surface border border-adm-border overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-adm-border">
            <h2 className="text-sm font-semibold text-adm-text flex items-center gap-2">
              <Search size={13} className="text-adm-accent" /> Recent Leads
              {(newLeads || 0) > 0 && (
                <span className="text-[10px] bg-adm-accent/15 text-adm-accent px-1.5 py-0.5 font-semibold">
                  {newLeads} new
                </span>
              )}
            </h2>
            <Link href="/agents" className="text-xs text-adm-muted hover:text-adm-text transition-colors font-medium flex items-center gap-1">
              Agents <ArrowUpRight size={11} />
            </Link>
          </div>
          {recentLeads && recentLeads.length > 0 ? (
            <div className="divide-y divide-adm-border">
              {recentLeads.map((lead: any) => (
                <div key={lead.id} className="px-5 py-3 flex items-center gap-3">
                  <div className="w-7 h-7 bg-adm-surface-2 flex items-center justify-center flex-shrink-0">
                    <UserCheck size={12} className="text-adm-muted" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-adm-text truncate">{lead.contact_name}</p>
                    <p className="text-[11px] text-adm-muted mt-0.5">{lead.lead_type?.replace('_', ' ')}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`text-[10px] px-2 py-0.5 font-medium ${
                      lead.status === 'new'        ? 'text-adm-accent bg-adm-accent/10' :
                      lead.status === 'converted'  ? 'text-adm-green bg-adm-green/10' :
                      lead.status === 'lost'       ? 'text-adm-red bg-adm-red/10' :
                                                     'text-adm-faint bg-adm-surface-2'
                    }`}>{lead.status}</span>
                    <span className="text-[10px] text-adm-faint">{timeAgo(lead.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-5 py-10 text-center">
              <Search size={24} className="mx-auto text-adm-faint mb-2" />
              <p className="text-xs text-adm-muted">No leads yet</p>
            </div>
          )}
        </div>
      </div>

    </div>
  )
}
