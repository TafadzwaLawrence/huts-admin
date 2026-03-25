import { createAdminClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/admin'
import Link from 'next/link'  
import { Users } from 'lucide-react'
import AgentsTableClient from './AgentsTableClient'

export const metadata = { title: 'Agent Management | Admin' }

const TABS = [
  { key: 'pending',   label: 'Pending' },
  { key: 'active',    label: 'Active' },
  { key: 'suspended', label: 'Suspended' },
  { key: 'inactive',  label: 'Inactive' },
] as const

export default async function AdminAgentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status } = await searchParams
  await requireAdmin()
  const admin = createAdminClient()

  // Default to 'pending' if no valid status is provided
  const statusFilter = (status && TABS.some(t => t.key === status)) ? status : 'pending'

  // All queries run in parallel
  const agentsQueryBuilder = admin
    .from('agents')
    .select('id, user_id, agent_type, business_name, office_city, verified, status, featured, avg_rating, total_reviews, created_at, slug')
    .eq('status', statusFilter)
    .order('created_at', { ascending: false })

  const [
    { data: agentRows, error },
    { count: pendingCount },
    { count: activeCount },
    { count: suspendedCount },
    { count: inactiveCount },
  ] = await Promise.all([
    agentsQueryBuilder,
    admin.from('agents').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    admin.from('agents').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    admin.from('agents').select('*', { count: 'exact', head: true }).eq('status', 'suspended'),
    admin.from('agents').select('*', { count: 'exact', head: true }).eq('status', 'inactive'),
  ])

  const statusCounts: Record<string, number> = {
    pending:   pendingCount   || 0,
    active:    activeCount    || 0,
    suspended: suspendedCount || 0,
    inactive:  inactiveCount  || 0,
  }

  // Fetch profiles for visible rows only
  const userIds = (agentRows || []).map((a: any) => a.user_id).filter(Boolean)
  const { data: profileRows } = userIds.length
    ? await admin.from('profiles').select('id, full_name, email').in('id', userIds)
    : { data: [] }
  const profileMap = Object.fromEntries((profileRows || []).map((p: any) => [p.id, p]))
  const agents = (agentRows || []).map((a: any) => ({ ...a, profiles: profileMap[a.user_id] ?? null }))

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-adm-text">Agent Management</h1>
        <p className="text-sm text-adm-muted mt-1">
          Review, approve, and manage real estate professionals on Huts.
        </p>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-1 mb-6 border-b border-adm-border">
        {TABS.map(tab => (
          <Link
            key={tab.key}
            href={`/agents?status=${tab.key}`}
            className={`px-4 py-2.5 text-sm font-medium capitalize border-b-2 transition-all ${
              statusFilter === tab.key
                ? 'border-adm-accent text-adm-text'
                : 'border-transparent text-adm-muted hover:text-adm-text'
            }`}
          >
            {tab.label}
            {statusCounts[tab.key] > 0 && (
              <span className={`ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                tab.key === 'pending'
                  ? 'bg-adm-amber/15 text-adm-amber'
                  : 'bg-adm-surface-2 text-adm-muted'
              }`}>
                {statusCounts[tab.key]}
              </span>
            )}
          </Link>
        ))}
      </div>

      {error && (
        <div className="p-4 bg-adm-red/10 border border-adm-red/20 rounded-lg text-adm-red text-sm mb-6">
          Failed to load agents: {error.message}
        </div>
      )}

      {!agents.length ? (
        <div className="text-center py-16 text-adm-faint">
          <Users size={40} className="mx-auto mb-3" />
          <p className="text-sm font-medium">
            No {statusFilter} agents found
          </p>
        </div>
      ) : (
        <AgentsTableClient agents={agents} />
      )}
    </div>
  )
}
