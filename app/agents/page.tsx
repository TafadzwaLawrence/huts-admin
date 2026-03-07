import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { 
  Building2, Home, Briefcase, Camera, Award,
  CheckCircle, Clock, ShieldCheck, ShieldX, Users, ChevronRight
} from 'lucide-react'
import { AGENT_TYPE_LABELS } from '@/lib/constants'

export const metadata = { title: 'Agent Management | Admin' }

const STATUS_STYLES = {
  pending:   'bg-amber-50 text-amber-700 border border-amber-200',
  active:    'bg-green-50 text-green-700 border border-green-200',
  suspended: 'bg-red-50 text-red-700 border border-red-200',
  inactive:  'bg-gray-100 text-gray-600 border border-gray-200',
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
  searchParams: { status?: string }
}) {
  const supabase = await createClient()
  const statusFilter = searchParams.status || 'pending'

  const { data: agents, error } = await supabase
    .from('agent_profiles')
    .select(`
      id, user_id, agent_type, business_name, office_city,
      phone, verified, status, featured, avg_rating, total_reviews,
      created_at, slug,
      profiles:user_id (name, email, avatar_url)
    `)
    .eq('status', statusFilter)
    .order('created_at', { ascending: false })

  // Count per status for badges
  const { data: counts } = await supabase
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
        <h1 className="text-2xl font-bold text-[#212529]">Agent Management</h1>
        <p className="text-sm text-[#495057] mt-1">
          Review, approve, and manage real estate professionals on Huts.
        </p>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-2 mb-6 border-b border-[#E9ECEF]">
        {tabs.map(status => (
          <Link
            key={status}
            href={`/agents?status=${status}`}
            className={`px-4 py-2.5 text-sm font-medium capitalize border-b-2 transition-all ${
              statusFilter === status
                ? 'border-[#212529] text-[#212529]'
                : 'border-transparent text-[#495057] hover:text-[#212529]'
            }`}
          >
            {status}
            {statusCounts[status] ? (
              <span className="ml-2 px-1.5 py-0.5 bg-[#F8F9FA] text-[#495057] rounded text-[10px] font-bold">
                {statusCounts[status]}
              </span>
            ) : null}
          </Link>
        ))}
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm mb-6">
          Failed to load agents: {error.message}
        </div>
      )}

      {!agents?.length ? (
        <div className="text-center py-16 text-[#ADB5BD]">
          <Users size={40} className="mx-auto mb-3" />
          <p className="text-sm font-medium">No {statusFilter} agents</p>
        </div>
      ) : (
        <div className="bg-white border border-[#E9ECEF] rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F8F9FA] border-b border-[#E9ECEF]">
                <th className="text-left px-5 py-3 font-semibold text-[#495057]">Agent</th>
                <th className="text-left px-5 py-3 font-semibold text-[#495057]">Type</th>
                <th className="text-left px-5 py-3 font-semibold text-[#495057]">City</th>
                <th className="text-left px-5 py-3 font-semibold text-[#495057]">Rating</th>
                <th className="text-left px-5 py-3 font-semibold text-[#495057]">Verified</th>
                <th className="text-left px-5 py-3 font-semibold text-[#495057]">Submitted</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F3F5]">
              {agents.map((agent: any) => {
                const profile = agent.profiles as any
                const Icon = agentTypeIcons[agent.agent_type] || Award
                return (
                  <tr key={agent.id} className="hover:bg-[#F8F9FA] transition-colors">
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-semibold text-[#212529]">
                          {agent.business_name || profile?.name || '—'}
                        </p>
                        <p className="text-xs text-[#ADB5BD] mt-0.5">{profile?.email}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 text-[#495057]">
                        <Icon size={14} />
                        {AGENT_TYPE_LABELS[agent.agent_type as keyof typeof AGENT_TYPE_LABELS] || agent.agent_type}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-[#495057]">{agent.office_city || '—'}</td>
                    <td className="px-5 py-4">
                      {agent.avg_rating ? (
                        <span className="font-medium text-[#212529]">
                          {Number(agent.avg_rating).toFixed(1)} <span className="text-[#ADB5BD] font-normal">({agent.total_reviews})</span>
                        </span>
                      ) : (
                        <span className="text-[#ADB5BD]">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      {agent.verified ? (
                        <span className="inline-flex items-center gap-1 text-green-700">
                          <CheckCircle size={14} /> Yes
                        </span>
                      ) : (
                        <span className="text-[#ADB5BD]">No</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-[#495057]">
                      {new Date(agent.created_at).toLocaleDateString('en-GB', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })}
                    </td>
                    <td className="px-5 py-4">
                      <Link
                        href={`/agents/${agent.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#212529] text-white rounded-lg text-xs font-semibold hover:bg-black transition-colors"
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
