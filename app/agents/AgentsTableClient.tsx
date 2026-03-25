'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Building2, Home, Briefcase, Camera, Award,
  CheckCircle, ChevronRight, CheckSquare, Square,
} from 'lucide-react'
import { toast } from 'sonner'
import { useAdminSelection, BulkActionToolbar } from '@/components/admin'
import { AGENT_TYPE_LABELS } from '@/lib/constants'

const agentTypeIcons: Record<string, any> = {
  real_estate_agent: Building2,
  property_manager:  Home,
  home_builder:      Briefcase,
  photographer:      Camera,
  other:             Award,
}

export interface AgentRow {
  id: string
  user_id: string
  agent_type: string
  business_name: string | null
  office_city: string | null
  avg_rating: number | null
  total_reviews: number | null
  verified: boolean
  status: string
  created_at: string
  profiles: { full_name: string | null; email: string } | null
}

interface Props {
  agents: AgentRow[]
}

export default function AgentsTableClient({ agents }: Props) {
  const router = useRouter()

  const {
    selectedIds,
    selectedCount,
    toggleSelection,
    toggleAll,
    clearSelection,
    isSelected,
    isAllSelected,
    isSomeSelected,
  } = useAdminSelection(agents)

  return (
    <>
      <div className="bg-adm-surface border border-adm-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-adm-surface-2 border-b border-adm-border">
              <th className="px-4 py-3 w-10">
                <button
                  onClick={toggleAll}
                  className="text-adm-muted hover:text-adm-text transition-colors"
                  aria-label="Select all"
                >
                  {isAllSelected
                    ? <CheckSquare size={16} className="text-adm-accent" />
                    : <Square size={16} className={isSomeSelected ? 'text-adm-accent/60' : ''} />}
                </button>
              </th>
              <th className="text-left px-5 py-3 font-semibold text-adm-muted">Agent</th>
              <th className="text-left px-5 py-3 font-semibold text-adm-muted">Type</th>
              <th className="text-left px-5 py-3 font-semibold text-adm-muted">Status</th>
              <th className="text-left px-5 py-3 font-semibold text-adm-muted">City</th>
              <th className="text-left px-5 py-3 font-semibold text-adm-muted">Rating</th>
              <th className="text-left px-5 py-3 font-semibold text-adm-muted">Verified</th>
              <th className="text-left px-5 py-3 font-semibold text-adm-muted">Submitted</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-adm-border">
            {agents.map((agent) => {
              const profile = agent.profiles
              const Icon = agentTypeIcons[agent.agent_type] || Award
              const selected = isSelected(agent.id)
              return (
                <tr
                  key={agent.id}
                  className={`hover:bg-adm-surface-2 transition-colors ${selected ? 'bg-adm-surface-2' : ''}`}
                >
                  <td className="px-4 py-4">
                    <button
                      onClick={() => toggleSelection(agent.id)}
                      className="text-adm-muted hover:text-adm-text transition-colors"
                      aria-label={`Select ${agent.business_name || 'agent'}`}
                    >
                      {selected
                        ? <CheckSquare size={16} className="text-adm-accent" />
                        : <Square size={16} />}
                    </button>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-semibold text-adm-text">
                      {agent.business_name || profile?.full_name || '—'}
                    </p>
                    <p className="text-xs text-adm-faint mt-0.5">{profile?.email}</p>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5 text-adm-muted">
                      <Icon size={14} />
                      {AGENT_TYPE_LABELS[agent.agent_type as keyof typeof AGENT_TYPE_LABELS] || agent.agent_type}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold capitalize ${
                      agent.status === 'active'    ? 'bg-adm-green/10 text-adm-green border border-adm-green/20' :
                      agent.status === 'pending'   ? 'bg-adm-amber/10 text-adm-amber border border-adm-amber/20' :
                      agent.status === 'suspended' ? 'bg-adm-red/10 text-adm-red border border-adm-red/20' :
                      'bg-adm-surface-2 text-adm-faint border border-adm-border'
                    }`}>
                      {agent.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-adm-muted">{agent.office_city || '—'}</td>
                  <td className="px-5 py-4">
                    {agent.avg_rating ? (
                      <span className="font-medium text-adm-text">
                        {Number(agent.avg_rating).toFixed(1)}{' '}
                        <span className="text-adm-faint font-normal">({agent.total_reviews})</span>
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

      <BulkActionToolbar
        selectedCount={selectedCount}
        resourceType="agent"
        selectedIds={selectedIds}
        onActionComplete={() => { clearSelection(); router.refresh() }}
        onClearSelection={clearSelection}
      />
    </>
  )
}
