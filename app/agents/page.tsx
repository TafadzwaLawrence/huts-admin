import { createAdminClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/admin'
import Link from 'next/link'
import { Users } from 'lucide-react'
import AgentsTableClient from './AgentsTableClient'

export const metadata = { title: 'Agent Management | Admin' }

export default async function AdminAgentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status } = await searchParams
  await requireAdmin()
  const admin = createAdminClient()
  const statusFilter = status || 'pending'

  const { data: agentRows, error } = await admin
    .from('agents')
    .select('id, user_id, agent_type, business_name, office_city, phone, verified, status, featured, avg_rating, total_reviews, created_at, slug')
    .eq('status', statusFilter)
    .order('created_at', { ascending: false })

  // Fetch profiles separately to avoid FK join issues
  const userIds = (agentRows || []).map((a: any) => a.user_id).filter(Boolean)
  const { data: profileRows } = userIds.length
    ? await admin.from('profiles').select('id, name, email, avatar_url').in('id', userIds)
    : { data: [] }
  const profileMap = Object.fromEntries((profileRows || []).map((p: any) => [p.id, p]))
  const agents = (agentRows || []).map((a: any) => ({ ...a, profiles: profileMap[a.user_id] ?? null }))

  // Count per status for badges
  const { data: counts } = await admin
    .from('agents')
    .select('status')

  const statusCounts = (counts || []).reduce((acc: Record<string, number>, row: any) => {
    acc[row.status] = (acc[row.status] || 0) + 1
    return acc
  }, {})

  const tabs = ['pending', 'active', 'suspended', 'inactive'] as const

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-adm-text">Agent Management</h1>
        <p className="text-sm text-adm-muted mt-1">
          Review, approve, and manage real estate professionals on Huts.
        </p>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-2 mb-6 border-b border-adm-border">
        {tabs.map(status => (
          <Link
            key={status}
            href={`/agents?status=${status}`}
            className={`px-4 py-2.5 text-sm font-medium capitalize border-b-2 transition-all ${
              statusFilter === status
                ? 'border-adm-accent text-adm-text'
                : 'border-transparent text-adm-muted hover:text-adm-text'
            }`}
          >
            {status}
            {statusCounts[status] ? (
              <span className="ml-2 px-1.5 py-0.5 bg-adm-surface-2 text-adm-muted rounded text-[10px] font-bold">
                {statusCounts[status]}
              </span>
            ) : null}
          </Link>
        ))}
      </div>

      {error && (
        <div className="p-4 bg-adm-red/10 border border-adm-red/20 rounded-lg text-adm-red text-sm mb-6">
          Failed to load agents: {error.message}
        </div>
      )}

      {!agents?.length ? (
        <div className="text-center py-16 text-adm-faint">
          <Users size={40} className="mx-auto mb-3" />
          <p className="text-sm font-medium">No {statusFilter} agents</p>
        </div>
      ) : (
        <AgentsTableClient agents={agents} />
      )}
    </div>
  )
}
