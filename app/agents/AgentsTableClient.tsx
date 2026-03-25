'use client'

import { useState, useCallback, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Building2, Home, Briefcase, Camera, Award,
  CheckCircle, ChevronRight, CheckSquare, Square,
  Search, X, Loader2, ShieldOff, RefreshCw, Star,
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
  featured: boolean
  status: string
  created_at: string
  profiles: { full_name: string | null; email: string } | null
}

interface Props {
  agents: AgentRow[]
  statusFilter: string
}

const TYPE_OPTIONS = [
  { value: '', label: 'All types' },
  { value: 'real_estate_agent', label: 'Real Estate Agent' },
  { value: 'property_manager',  label: 'Property Manager' },
  { value: 'home_builder',      label: 'Home Builder' },
  { value: 'photographer',      label: 'Photographer' },
  { value: 'other',             label: 'Other' },
]

export default function AgentsTableClient({ agents, statusFilter }: Props) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [, startTransition] = useTransition()

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

  const filtered = agents.filter((a) => {
    const q = search.toLowerCase()
    const matchesSearch = !q || (
      (a.business_name?.toLowerCase().includes(q) ?? false) ||
      (a.profiles?.full_name?.toLowerCase().includes(q) ?? false) ||
      (a.profiles?.email?.toLowerCase().includes(q) ?? false) ||
      (a.office_city?.toLowerCase().includes(q) ?? false)
    )
    const matchesType = !typeFilter || a.agent_type === typeFilter
    return matchesSearch && matchesType
  })

  const patchAgent = useCallback(async (agentId: string, label: string, body: object, successMsg: string) => {
    setLoadingId(label)
    try {
      const res = await fetch(`/api/agents/${agentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error((await res.json()).error || 'Failed')
      toast.success(successMsg)
      startTransition(() => router.refresh())
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoadingId(null)
    }
  }, [router, startTransition])

  return (
    <>
      {/* Search + filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-adm-faint pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name, email, or city…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-sm bg-adm-surface border border-adm-border text-adm-text placeholder:text-adm-faint focus:outline-none focus:border-adm-accent transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-adm-faint hover:text-adm-muted"
            >
              <X size={12} />
            </button>
          )}
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2 text-sm bg-adm-surface border border-adm-border text-adm-text focus:outline-none focus:border-adm-accent transition-colors"
        >
          {TYPE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-adm-surface border border-adm-border py-16 text-center text-adm-faint">
          <Award size={36} className="mx-auto mb-3" />
          <p className="text-sm font-medium">No agents match your filter</p>
          {(search || typeFilter) && (
            <button
              onClick={() => { setSearch(''); setTypeFilter('') }}
              className="mt-3 text-xs text-adm-accent hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
      <div className="bg-adm-surface border border-adm-border overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-adm-border bg-adm-surface-2">
          <span className="text-xs text-adm-faint font-medium">
            {filtered.length} {filtered.length === 1 ? 'agent' : 'agents'}
            {filtered.length !== agents.length && ` of ${agents.length}`}
          </span>
        </div>
        <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-adm-border">
              <th className="px-4 py-3 w-10">
                <button
                  onClick={toggleAll}
                  className="text-adm-muted hover:text-adm-text transition-colors"
                  aria-label="Select all"
                >
                  {isAllSelected
                    ? <CheckSquare size={15} className="text-adm-accent" />
                    : <Square size={15} className={isSomeSelected ? 'text-adm-accent/60' : ''} />}
                </button>
              </th>
              <th className="text-left px-4 py-3 text-[11px] font-semibold text-adm-faint uppercase tracking-wider">Agent</th>
              <th className="text-left px-4 py-3 text-[11px] font-semibold text-adm-faint uppercase tracking-wider hidden md:table-cell">Type</th>
              <th className="text-left px-4 py-3 text-[11px] font-semibold text-adm-faint uppercase tracking-wider hidden lg:table-cell">City</th>
              <th className="text-left px-4 py-3 text-[11px] font-semibold text-adm-faint uppercase tracking-wider hidden lg:table-cell">Rating</th>
              <th className="text-left px-4 py-3 text-[11px] font-semibold text-adm-faint uppercase tracking-wider hidden sm:table-cell">Verified</th>
              <th className="text-left px-4 py-3 text-[11px] font-semibold text-adm-faint uppercase tracking-wider hidden xl:table-cell">Joined</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-adm-border">
            {filtered.map((agent) => {
              const profile = agent.profiles
              const Icon = agentTypeIcons[agent.agent_type] || Award
              const selected = isSelected(agent.id)
              const busy = loadingId !== null
              return (
                <tr
                  key={agent.id}
                  className={`transition-colors ${selected ? 'bg-adm-accent/5' : 'hover:bg-adm-surface-2'}`}
                >
                  {/* Select */}
                  <td className="px-4 py-4">
                    <button
                      onClick={() => toggleSelection(agent.id)}
                      className="text-adm-muted hover:text-adm-text transition-colors"
                      aria-label={`Select ${agent.business_name || 'agent'}`}
                    >
                      {selected
                        ? <CheckSquare size={15} className="text-adm-accent" />
                        : <Square size={15} />}
                    </button>
                  </td>

                  {/* Agent name + email + badges */}
                  <td className="px-4 py-4 min-w-[180px]">
                    <div className="flex items-start gap-2">
                      <div className={`w-8 h-8 flex-shrink-0 flex items-center justify-center text-sm font-bold ${
                        agent.status === 'active'    ? 'bg-adm-accent/15 text-adm-accent' :
                        agent.status === 'pending'   ? 'bg-adm-amber/10 text-adm-amber' :
                        agent.status === 'suspended' ? 'bg-adm-red/10 text-adm-red' :
                        'bg-adm-surface-2 text-adm-faint'
                      }`}>
                        {(agent.business_name || profile?.full_name || 'A')[0].toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="text-sm font-semibold text-adm-text leading-tight">
                            {agent.business_name || profile?.full_name || '—'}
                          </p>
                          {agent.featured && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[9px] font-bold bg-adm-amber/10 text-adm-amber">
                              <Star size={8} className="fill-adm-amber" /> FEATURED
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-adm-faint mt-0.5 truncate max-w-[200px]">{profile?.email}</p>
                      </div>
                    </div>
                  </td>

                  {/* Agent type */}
                  <td className="px-4 py-4 hidden md:table-cell">
                    <div className="flex items-center gap-1.5 text-adm-muted text-xs">
                      <Icon size={13} className="flex-shrink-0" />
                      <span>{AGENT_TYPE_LABELS[agent.agent_type as keyof typeof AGENT_TYPE_LABELS] || agent.agent_type}</span>
                    </div>
                  </td>

                  {/* City */}
                  <td className="px-4 py-4 text-xs text-adm-muted hidden lg:table-cell">
                    {agent.office_city || <span className="text-adm-faint">—</span>}
                  </td>

                  {/* Rating */}
                  <td className="px-4 py-4 hidden lg:table-cell">
                    {agent.avg_rating ? (
                      <span className="text-xs text-adm-text font-medium">
                        {Number(agent.avg_rating).toFixed(1)}{' '}
                        <span className="text-adm-faint font-normal">({agent.total_reviews})</span>
                      </span>
                    ) : (
                      <span className="text-adm-faint text-xs">—</span>
                    )}
                  </td>

                  {/* Verified */}
                  <td className="px-4 py-4 hidden sm:table-cell">
                    {agent.verified ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-adm-green">
                        <CheckCircle size={12} /> Yes
                      </span>
                    ) : (
                      <span className="text-adm-faint text-xs">No</span>
                    )}
                  </td>

                  {/* Joined */}
                  <td className="px-4 py-4 text-xs text-adm-muted hidden xl:table-cell whitespace-nowrap">
                    {new Date(agent.created_at).toLocaleDateString('en-GB', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2 justify-end">
                      {(statusFilter === 'pending' || statusFilter === 'inactive') && (
                        <button
                          onClick={() => patchAgent(agent.id, `approve-${agent.id}`, { status: 'active' }, 'Agent approved')}
                          disabled={busy}
                          title="Approve agent"
                          className="inline-flex items-center gap-1 px-2 py-1.5 text-[11px] font-semibold bg-adm-accent text-white hover:bg-adm-accent/80 disabled:opacity-40 transition-colors"
                        >
                          {loadingId === `approve-${agent.id}`
                            ? <Loader2 size={11} className="animate-spin" />
                            : <CheckCircle size={11} />}
                          Approve
                        </button>
                      )}
                      {statusFilter === 'suspended' && (
                        <button
                          onClick={() => patchAgent(agent.id, `reactivate-${agent.id}`, { status: 'active' }, 'Agent reactivated')}
                          disabled={busy}
                          title="Reactivate agent"
                          className="inline-flex items-center gap-1 px-2 py-1.5 text-[11px] font-semibold bg-adm-green/10 text-adm-green border border-adm-green/30 hover:bg-adm-green/20 disabled:opacity-40 transition-colors"
                        >
                          {loadingId === `reactivate-${agent.id}`
                            ? <Loader2 size={11} className="animate-spin" />
                            : <RefreshCw size={11} />}
                          Reactivate
                        </button>
                      )}
                      {statusFilter === 'active' && (
                        <button
                          onClick={() => patchAgent(agent.id, `suspend-${agent.id}`, { status: 'suspended' }, 'Agent suspended')}
                          disabled={busy}
                          title="Suspend agent"
                          className="inline-flex items-center gap-1 px-2 py-1.5 text-[11px] font-semibold border border-adm-amber/30 text-adm-amber hover:bg-adm-amber/10 disabled:opacity-40 transition-colors"
                        >
                          {loadingId === `suspend-${agent.id}`
                            ? <Loader2 size={11} className="animate-spin" />
                            : <ShieldOff size={11} />}
                          Suspend
                        </button>
                      )}
                      <Link
                        href={`/agents/${agent.id}`}
                        className="inline-flex items-center gap-1 px-2 py-1.5 text-[11px] font-medium text-adm-muted border border-adm-border hover:text-adm-text hover:border-adm-faint transition-colors"
                      >
                        View <ChevronRight size={11} />
                      </Link>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        </div>
      </div>
      )}

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
