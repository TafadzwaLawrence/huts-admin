'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  MessageSquare,
  Star,
  Flag,
  CheckCircle,
  Trash2,
  XCircle,
  AlertCircle,
  Building2,
  Loader2,
  Eye,
  ChevronDown,
} from 'lucide-react'
import { AdminPageHeader, AdminEmptyState, AdminPagination } from '@/components/admin'
import { Badge } from '@/components/ui'
import { toast } from 'sonner'

interface Review {
  id: string
  rating: number
  comment: string | null
  title: string | null
  status: 'pending' | 'published' | 'flagged' | 'removed'
  flagged_reason: string | null
  is_verified: boolean | null
  created_at: string
  author_id: string
  property_id: string
  profiles: { full_name: string | null; email: string; avatar_url: string | null } | null
  properties: { title: string; slug: string; city: string } | null
}

const STATUS_TABS = [
  { key: 'all',       label: 'All'       },
  { key: 'pending',   label: 'Pending'   },
  { key: 'published', label: 'Published' },
  { key: 'flagged',   label: 'Flagged'   },
  { key: 'removed',   label: 'Removed'   },
] as const

const STATUS_BADGE: Record<string, string> = {
  pending:   'bg-adm-amber/10 text-adm-amber border border-adm-amber/20',
  published: 'bg-adm-green/10 text-adm-green border border-adm-green/20',
  flagged:   'bg-adm-red/10 text-adm-red border border-adm-red/20',
  removed:   'bg-adm-surface-2 text-adm-faint border border-adm-border',
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={12}
          className={s <= rating ? 'fill-adm-amber text-adm-amber' : 'text-adm-border'}
        />
      ))}
    </span>
  )
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchReviews = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' })
      if (statusFilter !== 'all') params.set('status', statusFilter)
      const res = await fetch(`/api/reviews?${params}`)
      if (!res.ok) throw new Error(`Server error (${res.status})`)
      const data = await res.json()
      setReviews(data.reviews)
      setTotalPages(data.totalPages)
      setTotal(data.total)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reviews')
    } finally {
      setLoading(false)
    }
  }, [page, statusFilter])

  useEffect(() => { setPage(1) }, [statusFilter])
  useEffect(() => { fetchReviews() }, [fetchReviews])

  const changeStatus = async (reviewId: string, status: string) => {
    setActionLoading(reviewId + status)
    try {
      const res = await fetch(`/api/reviews/${reviewId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error((await res.json()).error || 'Failed')
      toast.success(`Review ${status}`)
      fetchReviews()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setActionLoading(null)
    }
  }

  const deleteReview = async (reviewId: string) => {
    if (!confirm('Permanently delete this review? This cannot be undone.')) return
    setActionLoading(reviewId + 'delete')
    try {
      const res = await fetch(`/api/reviews/${reviewId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error((await res.json()).error || 'Failed')
      toast.success('Review deleted')
      fetchReviews()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setActionLoading(null)
    }
  }

  const busy = (id: string, action: string) => actionLoading === id + action

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <AdminPageHeader
        title="Reviews"
        description={`${total} total reviews`}
        action={
          <div className="flex items-center gap-0.5 bg-adm-surface-2 p-0.5 border border-adm-border">
            {STATUS_TABS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setStatusFilter(key)}
                className={`px-4 py-1.5 text-xs font-semibold transition-all ${
                  statusFilter === key
                    ? 'bg-adm-accent text-white'
                    : 'text-adm-muted hover:text-adm-text'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        }
      />

      {loading ? (
        <div className="bg-adm-surface border border-adm-border overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="px-5 py-4 border-b border-adm-border space-y-2">
              <div className="h-4 bg-adm-border animate-pulse w-1/3" />
              <div className="h-3 bg-adm-border animate-pulse w-2/3" />
            </div>
          ))}
        </div>
      ) : error ? (
        <AdminEmptyState
          icon={AlertCircle}
          title="Failed to load reviews"
          description={error}
          action={
            <button onClick={fetchReviews} className="text-sm px-4 py-2 bg-adm-accent text-white hover:bg-adm-accent/80 transition-colors">
              Retry
            </button>
          }
        />
      ) : reviews.length === 0 ? (
        <AdminEmptyState
          icon={MessageSquare}
          title="No reviews found"
          description={statusFilter === 'all' ? 'No reviews have been submitted yet.' : `No ${statusFilter} reviews.`}
        />
      ) : (
        <>
          <div className="bg-adm-surface border border-adm-border overflow-hidden">
            {reviews.map((review, idx) => {
              const isExpanded = expanded === review.id
              const authorName = review.profiles?.full_name || review.profiles?.email || 'Unknown'
              const propertyTitle = review.properties?.title || 'Unknown property'
              const propertyCity = review.properties?.city || ''

              return (
                <div
                  key={review.id}
                  className={`border-b border-adm-border last:border-0 ${idx % 2 === 0 ? '' : 'bg-adm-surface-2/30'}`}
                >
                  {/* Row */}
                  <div className="flex items-start gap-4 px-5 py-4">
                    {/* Rating circle */}
                    <div className="w-9 h-9 bg-adm-surface-2 border border-adm-border flex items-center justify-center flex-shrink-0 text-sm font-bold text-adm-text">
                      {review.rating}
                    </div>

                    {/* Main content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <StarRating rating={review.rating} />
                        <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${STATUS_BADGE[review.status]}`}>
                          {review.status}
                        </span>
                        {review.is_verified && (
                          <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-adm-green/10 text-adm-green border border-adm-green/20">
                            Verified
                          </span>
                        )}
                      </div>

                      {review.title && (
                        <p className="text-sm font-semibold text-adm-text truncate">{review.title}</p>
                      )}

                      <p className={`text-xs text-adm-muted mt-0.5 ${isExpanded ? '' : 'line-clamp-2'}`}>
                        {review.comment || <span className="italic text-adm-faint">No comment</span>}
                      </p>

                      {review.flagged_reason && review.status === 'flagged' && (
                        <p className="text-xs text-adm-red mt-1">
                          <span className="font-semibold">Flag reason:</span> {review.flagged_reason}
                        </p>
                      )}

                      <div className="flex items-center gap-3 mt-2 text-[11px] text-adm-faint flex-wrap">
                        <span className="flex items-center gap-1">
                          <MessageSquare size={10} />
                          {authorName}
                        </span>
                        <span className="flex items-center gap-1">
                          <Building2 size={10} />
                          {propertyTitle}{propertyCity ? `, ${propertyCity}` : ''}
                        </span>
                        <span>
                          {new Date(review.created_at).toLocaleDateString('en-GB', {
                            day: 'numeric', month: 'short', year: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {/* Expand/collapse long comments */}
                      {(review.comment?.length ?? 0) > 120 && (
                        <button
                          onClick={() => setExpanded(isExpanded ? null : review.id)}
                          className="p-1.5 text-adm-faint hover:text-adm-text hover:bg-adm-surface-2 transition-colors"
                          title={isExpanded ? 'Collapse' : 'Expand'}
                        >
                          <ChevronDown size={14} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        </button>
                      )}

                      {review.status !== 'published' && (
                        <button
                          onClick={() => changeStatus(review.id, 'published')}
                          disabled={!!actionLoading}
                          className="p-1.5 text-adm-green hover:bg-adm-green/10 transition-colors disabled:opacity-40"
                          title="Publish"
                        >
                          {busy(review.id, 'published') ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                        </button>
                      )}

                      {review.status !== 'flagged' && review.status !== 'removed' && (
                        <button
                          onClick={() => changeStatus(review.id, 'flagged')}
                          disabled={!!actionLoading}
                          className="p-1.5 text-adm-amber hover:bg-adm-amber/10 transition-colors disabled:opacity-40"
                          title="Flag"
                        >
                          {busy(review.id, 'flagged') ? <Loader2 size={14} className="animate-spin" /> : <Flag size={14} />}
                        </button>
                      )}

                      {review.status !== 'removed' && (
                        <button
                          onClick={() => changeStatus(review.id, 'removed')}
                          disabled={!!actionLoading}
                          className="p-1.5 text-adm-muted hover:text-adm-red hover:bg-adm-red/10 transition-colors disabled:opacity-40"
                          title="Remove"
                        >
                          {busy(review.id, 'removed') ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                        </button>
                      )}

                      <button
                        onClick={() => deleteReview(review.id)}
                        disabled={!!actionLoading}
                        className="p-1.5 text-adm-muted hover:text-adm-red hover:bg-adm-red/10 transition-colors disabled:opacity-40"
                        title="Delete permanently"
                      >
                        {busy(review.id, 'delete') ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {totalPages > 1 && (
            <div className="mt-4 flex justify-center">
              <AdminPagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
        </>
      )}
    </div>
  )
}
