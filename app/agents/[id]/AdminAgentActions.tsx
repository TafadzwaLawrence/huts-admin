'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  CheckCircle, RefreshCw, ShieldOff, ShieldCheck,
  Star, Trash2, ExternalLink, Loader2, AlertTriangle,
} from 'lucide-react'
import { toast } from 'sonner'

interface Props {
  agentId: string
  currentStatus: 'pending' | 'active' | 'suspended' | 'inactive'
  currentVerified: boolean
  currentFeatured: boolean
  agentSlug: string | null
}

export default function AdminAgentActions({
  agentId, currentStatus, currentVerified, currentFeatured, agentSlug,
}: Props) {
  const router = useRouter()
  const [loadingAction, setLoadingAction] = useState<string | null>(null)

  const patch = async (action: string, body: object, successMsg: string) => {
    setLoadingAction(action)
    try {
      const res = await fetch(`/api/agents/${agentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error((await res.json()).error || 'Failed')
      toast.success(successMsg)
      router.refresh()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoadingAction(null)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Permanently delete this agent profile? This cannot be undone.')) return
    setLoadingAction('delete')
    try {
      const res = await fetch(`/api/agents/${agentId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error((await res.json()).error || 'Failed')
      toast.success('Agent deleted')
      router.push('/agents')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoadingAction(null)
    }
  }

  const busy = !!loadingAction
  const isLoading = (action: string) => loadingAction === action

  const STATUS_CONFIG = {
    pending:   { label: 'Pending Review', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
    active:    { label: 'Active',         cls: 'bg-green-50 text-green-700 border-green-200' },
    suspended: { label: 'Suspended',      cls: 'bg-red-50 text-red-700 border-red-200' },
    inactive:  { label: 'Inactive',       cls: 'bg-gray-100 text-gray-500 border-gray-200' },
  } as const
  const sc = STATUS_CONFIG[currentStatus]

  return (
    <div className="space-y-3">
      {/* ── Main control card ── */}
      <div className="bg-white border border-[#E9ECEF] rounded-xl overflow-hidden">

        {/* Status header */}
        <div className="px-5 pt-5 pb-4">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#ADB5BD]">Agent Status</p>
            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${sc.cls}`}>
              {sc.label}
            </span>
          </div>

          <div className="space-y-2">
            {(currentStatus === 'pending' || currentStatus === 'inactive') && (
              <button
                onClick={() => patch('approve', { status: 'active' }, 'Agent approved')}
                disabled={busy}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#212529] text-white text-sm font-semibold rounded-lg hover:bg-black disabled:opacity-50 transition-colors"
              >
                {isLoading('approve') ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                Approve Agent
              </button>
            )}

            {currentStatus === 'suspended' && (
              <button
                onClick={() => patch('reactivate', { status: 'active' }, 'Agent reactivated')}
                disabled={busy}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#212529] text-white text-sm font-semibold rounded-lg hover:bg-black disabled:opacity-50 transition-colors"
              >
                {isLoading('reactivate') ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                Reactivate Agent
              </button>
            )}

            {currentStatus !== 'suspended' && (
              <button
                onClick={() => patch('suspend', { status: 'suspended' }, 'Agent suspended')}
                disabled={busy}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-orange-50 border border-orange-200 text-orange-700 text-sm font-medium rounded-lg hover:bg-orange-100 disabled:opacity-50 transition-colors"
              >
                {isLoading('suspend') ? <Loader2 size={14} className="animate-spin" /> : <ShieldOff size={14} />}
                Suspend Agent
              </button>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[#F1F3F5]" />

        {/* Verified toggle row */}
        <div className="px-5 py-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
              currentVerified ? 'bg-green-50' : 'bg-[#F8F9FA]'
            }`}>
              <ShieldCheck size={15} className={currentVerified ? 'text-green-600' : 'text-[#ADB5BD]'} />
            </div>
            <div>
              <p className="text-sm font-medium text-[#212529]">Verified badge</p>
              <p className="text-[11px] text-[#ADB5BD] mt-px">
                {currentVerified ? 'Credentials verified' : 'Not yet verified'}
              </p>
            </div>
          </div>
          <button
            onClick={() => patch(
              currentVerified ? 'unverify' : 'verify',
              { verified: !currentVerified },
              currentVerified ? 'Verification removed' : 'Agent verified ✓',
            )}
            disabled={busy}
            aria-label={currentVerified ? 'Remove verification' : 'Mark as verified'}
            className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 disabled:opacity-50 ${
              currentVerified ? 'bg-green-500' : 'bg-[#CED4DA]'
            }`}
          >
            {isLoading('verify') || isLoading('unverify')
              ? <Loader2 size={10} className="absolute inset-0 m-auto animate-spin text-white" />
              : <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200 ${
                  currentVerified ? 'translate-x-4' : 'translate-x-0'
                }`} />
            }
          </button>
        </div>

        {/* Featured toggle row */}
        <div className="px-5 py-3.5 flex items-center justify-between gap-3 border-t border-[#F8F9FA]">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
              currentFeatured ? 'bg-amber-50' : 'bg-[#F8F9FA]'
            }`}>
              <Star size={15} className={currentFeatured ? 'text-amber-500 fill-amber-500' : 'text-[#ADB5BD]'} />
            </div>
            <div>
              <p className="text-sm font-medium text-[#212529]">Featured</p>
              <p className="text-[11px] text-[#ADB5BD] mt-px">
                {currentFeatured ? 'Shown in featured listings' : 'Not featured'}
              </p>
            </div>
          </div>
          <button
            onClick={() => patch(
              currentFeatured ? 'unfeature' : 'feature',
              { featured: !currentFeatured },
              currentFeatured ? 'Removed from featured' : 'Agent featured',
            )}
            disabled={busy}
            aria-label={currentFeatured ? 'Remove featured' : 'Mark as featured'}
            className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 disabled:opacity-50 ${
              currentFeatured ? 'bg-amber-400' : 'bg-[#CED4DA]'
            }`}
          >
            {isLoading('feature') || isLoading('unfeature')
              ? <Loader2 size={10} className="absolute inset-0 m-auto animate-spin text-white" />
              : <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200 ${
                  currentFeatured ? 'translate-x-4' : 'translate-x-0'
                }`} />
            }
          </button>
        </div>

        {/* View public profile */}
        {agentSlug && (
          <div className="border-t border-[#F1F3F5]">
            <a
              href={`/agent/${agentSlug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-3.5 text-sm text-[#495057] hover:text-[#212529] hover:bg-[#F8F9FA] transition-colors"
            >
              <ExternalLink size={13} className="flex-shrink-0" />
              View public profile
            </a>
          </div>
        )}
      </div>

      {/* ── Danger zone ── */}
      <div className="rounded-xl border border-red-100 bg-red-50 overflow-hidden">
        <div className="px-5 pt-4 pb-1 flex items-center gap-1.5">
          <AlertTriangle size={12} className="text-red-400" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-red-400">Danger Zone</span>
        </div>
        <div className="px-5 pb-4">
          <p className="text-[11px] text-red-400 mb-3 leading-relaxed">
            Permanently deletes this profile and all linked data. Cannot be undone.
          </p>
          <button
            onClick={handleDelete}
            disabled={busy}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-red-200 text-red-600 text-sm font-semibold rounded-lg hover:bg-red-100 hover:border-red-300 disabled:opacity-50 transition-colors"
          >
            {isLoading('delete') ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
            Delete Agent Profile
          </button>
        </div>
      </div>
    </div>
  )
}

