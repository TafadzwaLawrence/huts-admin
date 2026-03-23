'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  CheckCircle, RefreshCw, ShieldX, ShieldCheck, Star, Trash2, ExternalLink, Loader2,
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

  return (
    <div className="space-y-3">
      {/* Status actions */}
      <div className="bg-white border border-[#E9ECEF] rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-semibold text-[#212529]">Status</h3>

        {/* Approve: shown for pending and inactive (not suspended — use Reactivate) */}
        {(currentStatus === 'pending' || currentStatus === 'inactive') && (
          <button
            onClick={() => patch('approve', { status: 'active' }, 'Agent approved')}
            disabled={busy}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#212529] text-white text-sm font-semibold rounded-xl hover:bg-black disabled:opacity-50 transition-colors"
          >
            {isLoading('approve') ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
            Approve Agent
          </button>
        )}

        {/* Reactivate: only for suspended agents */}
        {currentStatus === 'suspended' && (
          <button
            onClick={() => patch('reactivate', { status: 'active' }, 'Agent reactivated')}
            disabled={busy}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#212529] text-white text-sm font-semibold rounded-xl hover:bg-black disabled:opacity-50 transition-colors"
          >
            {isLoading('reactivate') ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
            Reactivate Agent
          </button>
        )}

        {/* Suspend: hidden when already suspended */}
        {currentStatus !== 'suspended' && (
          <button
            onClick={() => patch('suspend', { status: 'suspended' }, 'Agent suspended')}
            disabled={busy}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-[#E9ECEF] text-[#212529] text-sm font-semibold rounded-xl hover:border-[#212529] disabled:opacity-50 transition-colors"
          >
            {isLoading('suspend') ? <Loader2 size={14} className="animate-spin" /> : <ShieldX size={14} />}
            Suspend Agent
          </button>
        )}
      </div>

      {/* Verification badge */}
      <div className="bg-white border border-[#E9ECEF] rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-semibold text-[#212529]">Verification</h3>
        {!currentVerified ? (
          <button
            onClick={() => patch('verify', { verified: true }, 'Agent verified ✓')}
            disabled={busy}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-green-50 border-2 border-green-200 text-green-700 text-sm font-semibold rounded-xl hover:border-green-400 disabled:opacity-50 transition-colors"
          >
            {isLoading('verify') ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
            Mark as Verified
          </button>
        ) : (
          <button
            onClick={() => patch('unverify', { verified: false }, 'Verification removed')}
            disabled={busy}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-red-200 text-red-600 text-sm font-semibold rounded-xl hover:border-red-400 disabled:opacity-50 transition-colors"
          >
            {isLoading('unverify') ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
            Remove Verification
          </button>
        )}
      </div>

      {/* Featured */}
      <div className="bg-white border border-[#E9ECEF] rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-semibold text-[#212529]">Featured</h3>
        {!currentFeatured ? (
          <button
            onClick={() => patch('feature', { featured: true }, 'Agent featured')}
            disabled={busy}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-[#E9ECEF] text-[#212529] text-sm font-semibold rounded-xl hover:border-[#212529] disabled:opacity-50 transition-colors"
          >
            {isLoading('feature') ? <Loader2 size={14} className="animate-spin" /> : <Star size={14} />}
            Mark as Featured
          </button>
        ) : (
          <button
            onClick={() => patch('unfeature', { featured: false }, 'Removed from featured')}
            disabled={busy}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-[#E9ECEF] text-[#495057] text-sm font-semibold rounded-xl hover:border-[#212529] disabled:opacity-50 transition-colors"
          >
            {isLoading('unfeature') ? <Loader2 size={14} className="animate-spin" /> : <Star size={14} className="fill-[#212529]" />}
            Remove Featured
          </button>
        )}
      </div>

      {/* External / danger */}
      <div className="bg-white border border-[#E9ECEF] rounded-xl p-5 space-y-3">
        {agentSlug && (
          <a
            href={`/agent/${agentSlug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-[#E9ECEF] text-[#495057] text-sm font-semibold rounded-xl hover:border-[#212529] hover:text-[#212529] transition-colors"
          >
            <ExternalLink size={14} /> View Public Profile
          </a>
        )}
        <button
          onClick={handleDelete}
          disabled={!!loading}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-red-100 text-red-600 text-sm font-semibold rounded-xl hover:border-red-300 disabled:opacity-50 transition-colors"
        >
          {isLoading('delete') ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
          Delete agent
        </button>
      </div>
    </div>
  )
}

