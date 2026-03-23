'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, ShieldX, ShieldCheck, Star, Trash2, ExternalLink, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface Props {
  agentId: string
  currentStatus: string
  currentVerified: boolean
  currentFeatured: boolean
  agentSlug: string | null
}

export default function AdminAgentActions({
  agentId, currentStatus, currentVerified, currentFeatured, agentSlug,
}: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  const patch = async (body: object, successMsg: string) => {
    const key = JSON.stringify(body)
    setLoading(key)
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
      setLoading(null)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Permanently delete this agent profile? This cannot be undone.')) return
    setLoading('delete')
    try {
      const res = await fetch(`/api/agents/${agentId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error((await res.json()).error || 'Failed')
      toast.success('Agent deleted')
      router.push('/agents')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(null)
    }
  }

  const isLoading = (key: string) => loading === key

  return (
    <div className="space-y-3">
      {/* Status actions */}
      <div className="bg-white border border-[#E9ECEF] rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-semibold text-[#212529]">Status</h3>

        {currentStatus !== 'active' && (
          <button
            onClick={() => patch({ status: 'active' }, 'Agent approved')}
            disabled={!!loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#212529] text-white text-sm font-semibold rounded-xl hover:bg-black disabled:opacity-50 transition-colors"
          >
            {isLoading('{"status":"active"}') ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
            Approve
          </button>
        )}

        {currentStatus !== 'suspended' && (
          <button
            onClick={() => patch({ status: 'suspended' }, 'Agent suspended')}
            disabled={!!loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-[#E9ECEF] text-[#212529] text-sm font-semibold rounded-xl hover:border-[#212529] disabled:opacity-50 transition-colors"
          >
            {isLoading('{"status":"suspended"}') ? <Loader2 size={14} className="animate-spin" /> : <ShieldX size={14} />}
            Suspend
          </button>
        )}

        {currentStatus !== 'inactive' && (
          <button
            onClick={() => patch({ status: 'inactive' }, 'Agent deactivated')}
            disabled={!!loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-[#E9ECEF] text-[#495057] text-sm font-semibold rounded-xl hover:border-[#212529] disabled:opacity-50 transition-colors"
          >
            {isLoading('{"status":"inactive"}') ? <Loader2 size={14} className="animate-spin" /> : null}
            Deactivate
          </button>
        )}
      </div>

      {/* Verification badge */}
      <div className="bg-white border border-[#E9ECEF] rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-semibold text-[#212529]">Verification</h3>
        <button
          onClick={() => patch(
            { verified: !currentVerified },
            currentVerified ? 'Verification removed' : 'Agent verified ✓',
          )}
          disabled={!!loading}
          className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl transition-colors disabled:opacity-50 ${
            currentVerified
              ? 'border-2 border-red-200 text-red-600 hover:border-red-400'
              : 'bg-green-50 border-2 border-green-200 text-green-700 hover:border-green-400'
          }`}
        >
          {isLoading(JSON.stringify({ verified: !currentVerified }))
            ? <Loader2 size={14} className="animate-spin" />
            : <ShieldCheck size={14} />}
          {currentVerified ? 'Remove badge' : 'Grant verified badge'}
        </button>
      </div>

      {/* Featured */}
      <div className="bg-white border border-[#E9ECEF] rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-semibold text-[#212529]">Featured</h3>
        <button
          onClick={() => patch(
            { featured: !currentFeatured },
            currentFeatured ? 'Removed from featured' : 'Agent featured',
          )}
          disabled={!!loading}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-[#E9ECEF] text-[#212529] text-sm font-semibold rounded-xl hover:border-[#212529] disabled:opacity-50 transition-colors"
        >
          {isLoading(JSON.stringify({ featured: !currentFeatured }))
            ? <Loader2 size={14} className="animate-spin" />
            : <Star size={14} className={currentFeatured ? 'fill-[#212529]' : ''} />}
          {currentFeatured ? 'Unfeature' : 'Feature agent'}
        </button>
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
            <ExternalLink size={14} /> View public profile
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

