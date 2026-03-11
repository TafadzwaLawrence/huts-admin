import { createAdminClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/admin'
import Link from 'next/link'
import { 
  Building2, Home, Briefcase, Camera, Award,
  CheckCircle, Clock, ShieldCheck, ShieldX, Users, ChevronRight
} from 'lucide-react'
import { AGENT_TYPE_LABELS } from '@/lib/constants'

export const metadata = { title: 'Agent Management | Admin' }

const STATUS_STYLES = {
  pending:   'bg-adm-amber/10 text-adm-amber border border-adm-amber/20',
  active:    'bg-adm-green/10 text-adm-green border border-adm-green/20',
  suspended: 'bg-adm-red/10 text-adm-red border border-adm-red/20',
  inactive:  'bg-adm-surface-2 text-adm-faint border border-adm-border',
}

const agentTypeIcons: Record<string, any> = {
  real_estate_agent: Building2,
  property_manager:  Home,
  home_builder:      Briefcase,
  photographer:      Camera,
  other:             Award,
}

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
    .from('agent_profiles')
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
    .from('agent_profiles')
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
        <div className="bg-adm-surface border border-adm-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-adm-surface-2 border-b border-adm-border">
                <th className="text-left px-5 py-3 font-semibold text-adm-muted">Agent</th>
                <th className="text-left px-5 py-3 font-semibold text-adm-muted">Type</th>
                <th className="text-left px-5 py-3 font-semibold text-adm-muted">City</th>
                <th className="text-left px-5 py-3 font-semibold text-adm-muted">Rating</th>
                <th className="text-left px-5 py-3 font-semibold text-adm-muted">Verified</th>
                <th className="text-left px-5 py-3 font-semibold text-adm-muted">Submitted</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-adm-border">
              {agents.map((agent: any) => {
                const profile = agent.profiles as any
                const Icon = agentTypeIcons[agent.agent_type] || Award
                return (
                  <tr key={agent.id} className="hover:bg-adm-surface-2 transition-colors">
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-semibold text-adm-text">
                          {agent.business_name || profile?.name || '—'}
                        </p>
                        <p className="text-xs text-adm-faint mt-0.5">{profile?.email}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 text-adm-muted">
                        <Icon size={14} />
                        {AGENT_TYPE_LABELS[agent.agent_type as keyof typeof AGENT_TYPE_LABELS] || agent.agent_type}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-adm-muted">{agent.office_city || '—'}</td>
                    <td className="px-5 py-4">
                      {agent.avg_rating ? (
                        <span className="font-medium text-adm-text">
                          {Number(agent.avg_rating).toFixed(1)} <span className="text-adm-faint font-normal">({agent.total_reviews})</span>
                        </span>
                      ) : (
                        <span className="text-adm-faint">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      {agent.verified ? (
                        <span className="inline-flex items-center gap-1 text-adm-green">
                          <CheckCircle size={14} /> Yes
                        </span>
                      ) : (
                        <span className="text-adm-faint">No</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-adm-muted">
                      {new Date(agent.created_at).toLocaleDateString('en-GB', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })}
                    </td>
                    <td className="px-5 py-4">
                      <Link
                        href={`/agents/${agent.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-adm-accent text-white rounded-lg text-xs font-semibold hover:bg-adm-accent/90 transition-colors"
                      >
                        Review <ChevronRight size={12} />
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
