'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, XCircle, ShieldCheck, Star, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

interface Props {
  agentId: string
  currentStatus: string
  currentVerified: boolean
  currentFeatured: boolean
  agentSlug: string | null
}

export default function AdminAgentActions({
  agentId,
  currentStatus,
  currentVerified,
  currentFeatured,
  agentSlug,
}: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  const update = async (payload: Record<string, any>, label: string) => {
    setLoading(label)
    try {
      const res = await fetch(`/api/agents/${agentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed')
      toast.success(`Agent ${label} successfully`)
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || `Failed to ${label} agent`)
    } finally {
      setLoading(null)
    }
  }

  const isLoading = (label: string) => loading === label

  return (
    <div className="bg-white border border-[#E9ECEF] rounded-xl p-5 space-y-3">
      <h2 className="font-semibold text-[#212529] mb-4">Actions</h2>

      {/* Approve */}
      {currentStatus !== 'active' && (
        <button
          onClick={() => update({ status: 'active' }, 'approved')}
          disabled={!!loading}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#212529] text-white rounded-lg text-sm font-semibold hover:bg-black transition-colors disabled:opacity-50"
        >
          <CheckCircle size={15} />
          {isLoading('approved') ? 'Approving…' : 'Approve Agent'}
        </button>
      )}

      {/* Suspend */}
      {currentStatus !== 'suspended' && (
        <button
          onClick={() => update({ status: 'suspended' }, 'suspended')}
          disabled={!!loading}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-red-600 border border-red-200 rounded-lg text-sm font-semibold hover:bg-red-50 transition-colors disabled:opacity-50"
        >
          <XCircle size={15} />
          {isLoading('suspended') ? 'Suspending…' : 'Suspend Agent'}
        </button>
      )}

      {/* Re-activate if suspended */}
      {currentStatus === 'suspended' && (
        <button
          onClick={() => update({ status: 'active' }, 'reactivated')}
          disabled={!!loading}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-[#212529] border border-[#E9ECEF] rounded-lg text-sm font-semibold hover:border-[#212529] transition-colors disabled:opacity-50"
        >
          <CheckCircle size={15} />
          {isLoading('reactivated') ? 'Reactivating…' : 'Reactivate Agent'}
        </button>
      )}

      {/* Verify / Unverify */}
      <button
        onClick={() => update({ verified: !currentVerified }, currentVerified ? 'unverified' : 'verified')}
        disabled={!!loading}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-[#212529] border border-[#E9ECEF] rounded-lg text-sm font-semibold hover:border-[#212529] transition-colors disabled:opacity-50"
      >
        <ShieldCheck size={15} />
        {isLoading(currentVerified ? 'unverified' : 'verified')
          ? 'Saving…'
          : currentVerified ? 'Remove Verification' : 'Mark as Verified'}
      </button>

      {/* Feature / Unfeature */}
      <button
        onClick={() => update({ featured: !currentFeatured }, currentFeatured ? 'unfeatured' : 'featured')}
        disabled={!!loading}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-[#212529] border border-[#E9ECEF] rounded-lg text-sm font-semibold hover:border-[#212529] transition-colors disabled:opacity-50"
      >
        <Star size={15} className={currentFeatured ? 'fill-[#212529]' : ''} />
        {isLoading(currentFeatured ? 'unfeatured' : 'featured')
          ? 'Saving…'
          : currentFeatured ? 'Remove Featured' : 'Mark as Featured'}
      </button>

      {/* View public profile */}
      {agentSlug && (
        <Link
          href={`/agent/${agentSlug}`}
          target="_blank"
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#F8F9FA] text-[#495057] rounded-lg text-sm font-medium hover:bg-[#E9ECEF] transition-colors"
        >
          <ExternalLink size={14} /> View Public Profile
        </Link>
      )}
    </div>
  )
}
