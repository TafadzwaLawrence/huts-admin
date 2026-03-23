import { createAdminClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/admin'
import Link from 'next/link'
import { Users } from 'lucide-react'
import AgentsTableClient from './AgentsTableClient'

export const metadata = { title: 'Agent Management | Admin' }

export default async function AdminAgentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>
}) {
  const { status, q } = await searchParams
  await requireAdmin()
  const admin = createAdminClient()
  const statusFilter = status || 'all'
  const search = q?.trim() || ''

  // Run agents query + all status counts in parallel
  const agentsQuery = admin
    .from('agents')
    .select('id, user_id, agent_type, business_name, office_city, phone, verified, status, featured, avg_rating, total_reviews, created_at, slug')
    .order('created_at', { ascending: false })

  if (statusFilter !== 'all') agentsQuery.eq('status', statusFilter)
  if (search) agentsQuery.ilike('business_name', `%${search}%`)

  const [
    { data: agentRows, error },
    { count: pendingCount },
    { count: activeCount },
    { count: suspendedCount },
    { count: inactiveCount },
  ] = await Promise.all([
    agentsQuery,
    admin.from('agents').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    admin.from('agents').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    admin.from('agents').select('*', { count: 'exact', head: true }).eq('status', 'suspended'),
    admin.from('agents').select('*', { count: 'exact', head: true }).eq('status', 'inactive'),
  ])

  const statusCounts: Record<string, number> = {
    pending:   pendingCount  || 0,
    active:    activeCount   || 0,
    suspended: suspendedCount || 0,
    inactive:  inactiveCount || 0,
  }
  const totalCount = Object.values(statusCounts).reduce((a, b) => a + b, 0)

  // Fetch profiles only for visible rows
  const userIds = (agentRows || []).map((a: any) => a.user_id).filter(Boolean)
  const { data: profileRows } = userIds.length
    ? await admin.from('profiles').select('id, name, email').in('id', userIds)
    : { data: [] }
  const profileMap = Object.fromEntries((profileRows || []).map((p: any) => [p.id, p]))
  const agents = (agentRows || []).map((a: any) => ({ ...a, profiles: profileMap[a.user_id] ?? null }))

  const tabs = [
    { key: 'all',       label: 'All',       count: totalCount },
    { key: 'pending',   label: 'Pending',   count: statusCounts.pending },
    { key: 'active',    label: 'Active',    count: statusCounts.active },
    { key: 'suspended', label: 'Suspended', count: statusCounts.suspended },
    { key: 'inactive',  label: 'Inactive',  count: statusCounts.inactive },
  ] as const

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-adm-text">Agent Management</h1>
        <p className="text-sm text-adm-muted mt-1">
          Review, approve, and manage real estate professionals on Huts.
        </p>
      </div>

      {/* Status Tabs + Search */}
      <div className="flex items-end justify-between gap-4 mb-6 border-b border-adm-border">
        <div className="flex gap-1">
          {tabs.map(tab => (
            <Link
              key={tab.key}
              href={`/agents?status=${tab.key}${search ? `&q=${encodeURIComponent(search)}` : ''}`}
              className={`px-4 py-2.5 text-sm font-medium capitalize border-b-2 transition-all ${
                statusFilter === tab.key
                  ? 'border-adm-accent text-adm-text'
                  : 'border-transparent text-adm-muted hover:text-adm-text'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                  tab.key === 'pending' && tab.count > 0
                    ? 'bg-adm-amber/15 text-adm-amber'
                    : 'bg-adm-surface-2 text-adm-muted'
                }`}>
                  {tab.count}
                </span>
              )}
            </Link>
          ))}
        </div>

        <form method="GET" action="/agents" className="pb-2">
          {statusFilter !== 'all' && (
            <input type="hidden" name="status" value={statusFilter} />
          )}
          <div className="relative">
            <input
              name="q"
              defaultValue={search}
              placeholder="Search by business name…"
              className="w-56 pl-3 pr-8 py-1.5 text-sm border border-adm-border rounded-lg bg-adm-surface text-adm-text placeholder:text-adm-faint focus:outline-none focus:border-adm-accent"
            />
            {search && (
              <Link
                href={`/agents?status=${statusFilter}`}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-adm-faint hover:text-adm-text text-xs"
              >
                ✕
              </Link>
            )}
          </div>
        </form>
      </div>

      {error && (
        <div className="p-4 bg-adm-red/10 border border-adm-red/20 rounded-lg text-adm-red text-sm mb-6">
          Failed to load agents: {error.message}
        </div>
      )}

      {!agents?.length ? (
        <div className="text-center py-16 text-adm-faint">
          <Users size={40} className="mx-auto mb-3" />
          <p className="text-sm font-medium">
            {search ? `No agents matching "${search}"` : `No ${statusFilter === 'all' ? '' : statusFilter} agents`}
          </p>
          {statusFilter !== 'all' && !search && (
            <Link href="/agents" className="mt-2 inline-block text-xs text-adm-accent hover:underline">
              View all agents
            </Link>
          )}
        </div>
      ) : (
        <AgentsTableClient agents={agents} />
      )}
    </div>
  )
}
