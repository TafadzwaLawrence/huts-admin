'use client'

import { useState } from 'react'
import { CheckSquare, XSquare, Trash2, UserX, UserCheck } from 'lucide-react'
import { toast } from 'sonner'

interface BulkActionToolbarProps {
  selectedCount: number
  resourceType: 'property' | 'user'
  selectedIds: string[]
  onActionComplete: () => void
  onClearSelection: () => void
}

export function BulkActionToolbar({
  selectedCount,
  resourceType,
  selectedIds,
  onActionComplete,
  onClearSelection,
}: BulkActionToolbarProps) {
  const [loading, setLoading] = useState(false)

  const handleBulkAction = async (action: string, actionLabel: string) => {
    const confirmMessage = `Are you sure you want to ${actionLabel} ${selectedCount} ${resourceType === 'property' ? 'properties' : 'users'}?`
    
    if (!confirm(confirmMessage)) return

    setLoading(true)

    try {
      const response = await fetch('/api/admin/bulk-actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          resourceType,
          resourceIds: selectedIds,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Bulk action failed')
      }

      const result = await response.json()
      
      if (result.successCount > 0) {
        toast.success(`${actionLabel} ${result.successCount} ${resourceType === 'property' ? 'properties' : 'users'}`)
      }

      if (result.failureCount > 0) {
        toast.error(`Failed to process ${result.failureCount} items`)
      }

      onActionComplete()
      onClearSelection()
    } catch (error) {
      console.error('Bulk action error:', error)
      toast.error(error instanceof Error ? error.message : 'Bulk action failed')
    } finally {
      setLoading(false)
    }
  }

  if (selectedCount === 0) return null

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="bg-charcoal text-white rounded-lg shadow-2xl px-6 py-4 flex items-center gap-6 border border-dark-gray">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
            {selectedCount}
          </div>
          <span className="font-medium">
            {selectedCount} {resourceType === 'property' ? 'properties' : 'users'} selected
          </span>
        </div>

        <div className="h-6 w-px bg-white/20" />

        <div className="flex items-center gap-2">
          {resourceType === 'property' && (
            <>
              <button
                onClick={() => handleBulkAction('approve', 'approve')}
                disabled={loading}
                className="px-3 py-1.5 bg-[#212529] hover:bg-black rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-1.5"
              >
                <CheckSquare size={14} />
                Approve
              </button>
              <button
                onClick={() => handleBulkAction('reject', 'reject')}
                disabled={loading}
                className="px-3 py-1.5 bg-[#FF6B6B] hover:bg-[#FF6B6B]/90 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-1.5"
              >
                <XSquare size={14} />
                Reject
              </button>
            </>
          )}

          {resourceType === 'user' && (
            <>
              <button
                onClick={() => handleBulkAction('suspend', 'suspend')}
                disabled={loading}
                className="px-3 py-1.5 bg-[#495057] hover:bg-[#212529] rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-1.5"
              >
                <UserX size={14} />
                Suspend
              </button>
              <button
                onClick={() => handleBulkAction('unsuspend', 'unsuspend')}
                disabled={loading}
                className="px-3 py-1.5 bg-[#212529] hover:bg-black rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-1.5"
              >
                <UserCheck size={14} />
                Unsuspend
              </button>
            </>
          )}

          <button
            onClick={() => handleBulkAction('delete', 'delete')}
            disabled={loading}
            className="px-3 py-1.5 bg-[#FF6B6B] hover:bg-[#FF6B6B]/90 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-1.5"
          >
            <Trash2 size={14} />
            Delete
          </button>

          <div className="h-6 w-px bg-white/20" />

          <button
            onClick={onClearSelection}
            disabled={loading}
            className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  )
}
