'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowLeft, Building2, MapPin, Home, Bed, Bath, Maximize2,
  CheckCircle, XCircle, Trash2, Star, Eye, Bookmark, Calendar,
  User, Mail, Phone, Edit3, Save, X, Loader2, AlertCircle,
  Flag, ShieldCheck, ShieldAlert, DollarSign, Tag,
} from 'lucide-react'

interface PropertyDetail {
  id: string
  title: string
  description: string | null
  status: string
  verification_status: string
  rejection_reason: string | null
  listing_type: string
  property_type: string | null
  price: number | null
  sale_price: number | null
  deposit: number | null
  bedrooms: number
  bathrooms: number
  square_feet: number | null
  address: string
  city: string
  state: string | null
  area: string | null
  zip_code: string | null
  furnished: boolean | null
  pets_allowed: boolean | null
  utilities_included: boolean | null
  available_from: string | null
  lease_term: string | null
  year_built: number | null
  parking_spaces: number | null
  created_at: string
  updated_at: string
  verified_at: string | null
  user_id: string
  profiles: { id: string; full_name: string | null; email: string; phone: string | null; avatar_url: string | null; role: string }
  property_images: Array<{ id: string; url: string; is_primary: boolean; order: number }>
}

interface Review {
  id: string
  rating: number
  title: string
  comment: string
  status: string
  created_at: string
  profiles: { full_name: string | null }
}

interface Stats {
  views: number
  saves: number
  reviews: number
  avgRating: number | null
}

function fmt(n: number | null, suffix = '') {
  if (!n) return '—'
  return n.toLocaleString() + suffix
}

function StatusBadge({ status }: { status: string }) {
  const cls: Record<string, string> = {
    approved: 'bg-adm-green/10 text-adm-green',
    pending:  'bg-adm-amber/10 text-adm-amber',
    rejected: 'bg-adm-red/10 text-adm-red',
    active:   'bg-adm-green/10 text-adm-green',
    inactive: 'bg-adm-surface-2 text-adm-faint',
    draft:    'bg-adm-surface-2 text-adm-faint',
  }
  return (
    <span className={`text-[10px] px-2 py-1 font-semibold uppercase tracking-wide ${cls[status] ?? 'bg-adm-surface-2 text-adm-faint'}`}>
      {status}
    </span>
  )
}

export default function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [property, setProperty] = useState<PropertyDetail | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [stats, setStats] = useState<Stats>({ views: 0, saves: 0, reviews: 0, avgRating: null })
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Edit mode
  const [editing, setEditing] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editPrice, setEditPrice] = useState('')
  const [editSalePrice, setEditSalePrice] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      // Fetch property detail via admin API
      const res = await fetch(`/api/properties?status=all&page=1&limit=1000`)
      if (!res.ok) throw new Error('Failed to load')
      const data = await res.json()
      const found = (data.properties as PropertyDetail[]).find(p => p.id === id)
      if (!found) { setError('Property not found'); return }
      setProperty(found)
      setEditTitle(found.title)
      setEditPrice(found.price ? String(found.price) : '')
      setEditSalePrice(found.sale_price ? String(found.sale_price) : '')
      setEditDescription(found.description ?? '')
      setRejectionReason(found.rejection_reason ?? '')

      // Fetch reviews for this property
      const revRes = await fetch(`/api/reviews?propertyId=${id}&limit=50`)
      if (revRes.ok) {
        const revData = await revRes.json()
        const propReviews = (revData.reviews as Review[]).filter(r => r !== null)
        setReviews(propReviews)
        const published = propReviews.filter(r => r.status === 'published')
        const avgRating = published.length
          ? published.reduce((s, r) => s + r.rating, 0) / published.length
          : null
        setStats(prev => ({ ...prev, reviews: propReviews.length, avgRating }))
      }

      // Fetch views + saves counts (best effort)
      await fetch(`/api/properties/${id}/stats`).catch(() => null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load property')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { load() }, [load])

  const patch = async (key: string, body: object) => {
    setActionLoading(key)
    try {
      const res = await fetch(`/api/properties/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error('Action failed')
      await load()
    } catch {
      alert('Action failed. Please try again.')
    } finally {
      setActionLoading(null)
    }
  }

  const saveEdits = async () => {
    setSaving(true)
    try {
      const body: Record<string, unknown> = { title: editTitle }
      if (editDescription) body.description = editDescription
      if (property?.listing_type === 'sale') {
        if (editSalePrice) body.sale_price = Number(editSalePrice) || null
      } else {
        if (editPrice) body.price = Number(editPrice) || null
      }
      const res = await fetch(`/api/properties/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error('Save failed')
      setEditing(false)
      await load()
    } catch {
      alert('Save failed. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const deleteProperty = async () => {
    if (!confirm(`Delete "${property?.title}"? This cannot be undone.`)) return
    setActionLoading('delete')
    try {
      const res = await fetch(`/api/properties/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      router.push('/properties')
    } catch {
      alert('Delete failed. Please try again.')
      setActionLoading(null)
    }
  }

  const deleteReview = async (reviewId: string) => {
    if (!confirm('Delete this review permanently?')) return
    try {
      await fetch(`/api/reviews/${reviewId}`, { method: 'DELETE' })
      await load()
    } catch { alert('Delete failed') }
  }

  const patchReview = async (reviewId: string, status: string) => {
    try {
      await fetch(`/api/reviews/${reviewId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      await load()
    } catch { alert('Action failed') }
  }

  if (loading) return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-4 animate-pulse">
      <div className="h-6 bg-adm-surface-2 w-32" />
      <div className="h-10 bg-adm-surface-2 w-2/3" />
      <div className="h-64 bg-adm-surface-2 w-full" />
    </div>
  )

  if (error || !property) return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <Link href="/properties" className="inline-flex items-center gap-2 text-sm text-adm-muted hover:text-adm-text mb-6">
        <ArrowLeft size={14} /> Back to properties
      </Link>
      <div className="bg-adm-surface border border-adm-red/20 p-8 text-center">
        <AlertCircle size={32} className="mx-auto text-adm-red mb-3" />
        <p className="text-adm-text font-medium">{error ?? 'Property not found'}</p>
      </div>
    </div>
  )

  const isForSale = property.listing_type === 'sale'
  const primaryImage = property.property_images?.find(i => i.is_primary) ?? property.property_images?.[0]
  const otherImages = property.property_images?.filter(i => !i.is_primary).slice(0, 4) ?? []

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">

      {/* Back */}
      <Link href="/properties" className="inline-flex items-center gap-2 text-sm text-adm-muted hover:text-adm-text transition-colors">
        <ArrowLeft size={14} /> Back to properties
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0">
          {editing ? (
            <input
              value={editTitle}
              onChange={e => setEditTitle(e.target.value)}
              className="text-2xl font-bold bg-adm-surface-2 border border-adm-border text-adm-text px-3 py-1 w-full max-w-xl"
            />
          ) : (
            <h1 className="text-2xl font-bold text-adm-text">{property.title}</h1>
          )}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <StatusBadge status={property.verification_status} />
            <StatusBadge status={property.status} />
            <span className="text-[10px] bg-adm-surface-2 text-adm-muted px-2 py-1 uppercase">{isForSale ? 'For Sale' : 'For Rent'}</span>
            {property.property_type && (
              <span className="text-[10px] bg-adm-surface-2 text-adm-muted px-2 py-1 uppercase">{property.property_type}</span>
            )}
          </div>
        </div>

        {/* Action bar */}
        <div className="flex items-center gap-2 flex-wrap">
          {!editing ? (
            <>
              <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border border-adm-border text-adm-muted hover:text-adm-text hover:border-adm-faint transition-colors">
                <Edit3 size={13} /> Edit
              </button>
              {property.verification_status !== 'approved' && (
                <button
                  onClick={() => patch('approve', { verification_status: 'approved' })}
                  disabled={actionLoading === 'approve'}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-adm-green/10 border border-adm-green/20 text-adm-green hover:bg-adm-green/20 transition-colors disabled:opacity-50"
                >
                  {actionLoading === 'approve' ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle size={13} />}
                  Approve
                </button>
              )}
              {property.verification_status !== 'rejected' && (
                <button
                  onClick={() => patch('reject', { verification_status: 'rejected', rejection_reason: rejectionReason || 'Does not meet listing requirements' })}
                  disabled={actionLoading === 'reject'}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-adm-amber/10 border border-adm-amber/20 text-adm-amber hover:bg-adm-amber/20 transition-colors disabled:opacity-50"
                >
                  {actionLoading === 'reject' ? <Loader2 size={13} className="animate-spin" /> : <XCircle size={13} />}
                  Reject
                </button>
              )}
              <button
                onClick={deleteProperty}
                disabled={actionLoading === 'delete'}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-adm-red/10 border border-adm-red/20 text-adm-red hover:bg-adm-red/20 transition-colors disabled:opacity-50"
              >
                {actionLoading === 'delete' ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                Delete
              </button>
            </>
          ) : (
            <>
              <button onClick={saveEdits} disabled={saving} className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-adm-accent text-white hover:bg-adm-accent/80 transition-colors disabled:opacity-50">
                {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />} Save
              </button>
              <button onClick={() => setEditing(false)} className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border border-adm-border text-adm-muted hover:text-adm-text transition-colors">
                <X size={13} /> Cancel
              </button>
            </>
          )}
        </div>
      </div>

      {/* Images */}
      {property.property_images?.length > 0 && (
        <div className="grid grid-cols-5 gap-2 h-52">
          <div className="col-span-3 relative bg-adm-surface-2 overflow-hidden">
            {primaryImage ? (
              <Image src={primaryImage.url} alt={property.title} fill className="object-cover" sizes="60vw" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Home size={40} className="text-adm-faint" />
              </div>
            )}
          </div>
          <div className="col-span-2 grid grid-cols-2 gap-2">
            {otherImages.slice(0, 4).map((img, i) => (
              <div key={img.id} className="relative bg-adm-surface-2 overflow-hidden">
                <Image src={img.url} alt="" fill className="object-cover" sizes="20vw" />
              </div>
            ))}
            {Array.from({ length: Math.max(0, 4 - otherImages.length) }).map((_, i) => (
              <div key={`empty-${i}`} className="bg-adm-surface-2 flex items-center justify-center">
                <Home size={20} className="text-adm-faint" />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Left: details */}
        <div className="lg:col-span-2 space-y-5">

          {/* Key stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: Bed,       label: 'Bedrooms',    value: property.bedrooms ?? '—' },
              { icon: Bath,      label: 'Bathrooms',   value: property.bathrooms ?? '—' },
              { icon: Maximize2, label: 'Sq Ft',       value: fmt(property.square_feet) },
              { icon: Calendar,  label: 'Year Built',  value: property.year_built ?? '—' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="bg-adm-surface border border-adm-border p-4">
                <Icon size={14} className="text-adm-muted mb-2" />
                <p className="text-lg font-bold text-adm-text">{value}</p>
                <p className="text-[11px] text-adm-muted mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* Price / rejection reason */}
          <div className="bg-adm-surface border border-adm-border p-5 space-y-4">
            <h3 className="text-sm font-semibold text-adm-text flex items-center gap-2">
              <DollarSign size={14} className="text-adm-accent" /> Pricing
            </h3>
            {editing ? (
              <div className="grid grid-cols-2 gap-3">
                {isForSale ? (
                  <div>
                    <label className="text-[11px] text-adm-muted mb-1 block">Sale Price</label>
                    <input type="number" value={editSalePrice} onChange={e => setEditSalePrice(e.target.value)}
                      className="w-full bg-adm-surface-2 border border-adm-border text-adm-text text-sm px-3 py-2" />
                  </div>
                ) : (
                  <div>
                    <label className="text-[11px] text-adm-muted mb-1 block">Monthly Rent</label>
                    <input type="number" value={editPrice} onChange={e => setEditPrice(e.target.value)}
                      className="w-full bg-adm-surface-2 border border-adm-border text-adm-text text-sm px-3 py-2" />
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {isForSale ? (
                  <div>
                    <p className="text-[11px] text-adm-muted">Sale Price</p>
                    <p className="text-lg font-bold text-adm-text">{property.sale_price ? `$${property.sale_price.toLocaleString()}` : '—'}</p>
                  </div>
                ) : (
                  <>
                    <div>
                      <p className="text-[11px] text-adm-muted">Monthly Rent</p>
                      <p className="text-lg font-bold text-adm-text">{property.price ? `$${property.price.toLocaleString()}` : '—'}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-adm-muted">Deposit</p>
                      <p className="text-lg font-bold text-adm-text">{property.deposit ? `$${property.deposit.toLocaleString()}` : '—'}</p>
                    </div>
                  </>
                )}
              </div>
            )}

            {property.verification_status === 'rejected' && (
              <div>
                <p className="text-[11px] text-adm-muted mb-1">Rejection Reason</p>
                {editing ? (
                  <input value={rejectionReason} onChange={e => setRejectionReason(e.target.value)}
                    className="w-full bg-adm-surface-2 border border-adm-red/30 text-adm-text text-sm px-3 py-2" placeholder="Rejection reason..." />
                ) : (
                  <p className="text-sm text-adm-red">{property.rejection_reason || '—'}</p>
                )}
              </div>
            )}
          </div>

          {/* Description */}
          <div className="bg-adm-surface border border-adm-border p-5">
            <h3 className="text-sm font-semibold text-adm-text mb-3">Description</h3>
            {editing ? (
              <textarea value={editDescription} onChange={e => setEditDescription(e.target.value)} rows={5}
                className="w-full bg-adm-surface-2 border border-adm-border text-adm-text text-sm px-3 py-2 resize-none" />
            ) : (
              <p className="text-sm text-adm-muted leading-relaxed">{property.description || 'No description provided.'}</p>
            )}
          </div>

          {/* Location */}
          <div className="bg-adm-surface border border-adm-border p-5">
            <h3 className="text-sm font-semibold text-adm-text flex items-center gap-2 mb-3">
              <MapPin size={14} className="text-adm-accent" /> Location
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                ['Address', property.address],
                ['City', property.city],
                ['State', property.state ?? '—'],
                ['Area', property.area ?? '—'],
                ['Zip Code', property.zip_code ?? '—'],
              ].map(([label, val]) => (
                <div key={label}>
                  <p className="text-[11px] text-adm-muted">{label}</p>
                  <p className="text-sm text-adm-text">{val}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Features */}
          <div className="bg-adm-surface border border-adm-border p-5">
            <h3 className="text-sm font-semibold text-adm-text mb-3">Features</h3>
            <div className="flex flex-wrap gap-2">
              {[
                property.furnished         && 'Furnished',
                property.pets_allowed      && 'Pets Allowed',
                property.utilities_included && 'Utilities Included',
                property.parking_spaces    && `${property.parking_spaces} Parking`,
                property.available_from    && `Available ${new Date(property.available_from).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
                property.lease_term        && `Lease: ${property.lease_term}`,
              ].filter(Boolean).map((f) => (
                <span key={String(f)} className="text-xs bg-adm-surface-2 border border-adm-border text-adm-muted px-2.5 py-1">{f}</span>
              ))}
            </div>
          </div>

          {/* Reviews */}
          <div className="bg-adm-surface border border-adm-border overflow-hidden">
            <div className="px-5 py-4 border-b border-adm-border flex items-center justify-between">
              <h3 className="text-sm font-semibold text-adm-text flex items-center gap-2">
                <Star size={14} className="text-adm-amber" />
                Reviews ({reviews.length})
                {stats.avgRating && (
                  <span className="text-xs text-adm-amber font-normal">{stats.avgRating.toFixed(1)} avg</span>
                )}
              </h3>
            </div>
            {reviews.length === 0 ? (
              <div className="px-5 py-8 text-center text-xs text-adm-muted">No reviews for this property</div>
            ) : (
              <div className="divide-y divide-adm-border">
                {reviews.map(r => (
                  <div key={r.id} className="px-5 py-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="flex">
                            {[1,2,3,4,5].map(s => (
                              <Star key={s} size={11} className={s <= r.rating ? 'fill-adm-amber text-adm-amber' : 'text-adm-border'} />
                            ))}
                          </span>
                          <span className="text-[10px] text-adm-muted">{r.profiles?.full_name ?? 'Anonymous'}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 ${
                            r.status === 'published' ? 'bg-adm-green/10 text-adm-green' :
                            r.status === 'flagged'   ? 'bg-adm-red/10 text-adm-red' :
                            r.status === 'pending'   ? 'bg-adm-amber/10 text-adm-amber' : 'bg-adm-surface-2 text-adm-faint'
                          }`}>{r.status}</span>
                        </div>
                        <p className="text-xs font-medium text-adm-text">{r.title}</p>
                        <p className="text-xs text-adm-muted mt-0.5 line-clamp-2">{r.comment}</p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {r.status !== 'published' && (
                          <button onClick={() => patchReview(r.id, 'published')} className="p-1 text-adm-muted hover:text-adm-green hover:bg-adm-green/10" title="Publish">
                            <CheckCircle size={13} />
                          </button>
                        )}
                        {r.status !== 'flagged' && (
                          <button onClick={() => patchReview(r.id, 'flagged')} className="p-1 text-adm-muted hover:text-adm-amber hover:bg-adm-amber/10" title="Flag">
                            <Flag size={13} />
                          </button>
                        )}
                        <button onClick={() => deleteReview(r.id)} className="p-1 text-adm-muted hover:text-adm-red hover:bg-adm-red/10" title="Delete">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Owner + meta */}
        <div className="space-y-5">

          {/* Owner */}
          <div className="bg-adm-surface border border-adm-border p-5">
            <h3 className="text-sm font-semibold text-adm-text mb-4 flex items-center gap-2">
              <User size={14} className="text-adm-accent" /> Owner
            </h3>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-adm-accent/15 flex items-center justify-center font-bold text-adm-accent text-sm flex-shrink-0">
                {(property.profiles?.full_name || property.profiles?.email)?.[0]?.toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-adm-text">{property.profiles?.full_name || 'No name'}</p>
                <span className={`text-[10px] px-1.5 py-0.5 ${
                  property.profiles?.role === 'landlord' ? 'bg-adm-green/10 text-adm-green' : 'bg-adm-surface-2 text-adm-faint'
                }`}>{property.profiles?.role}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-adm-muted">
                <Mail size={12} className="flex-shrink-0" />
                <span className="truncate">{property.profiles?.email}</span>
              </div>
              {property.profiles?.phone && (
                <div className="flex items-center gap-2 text-xs text-adm-muted">
                  <Phone size={12} className="flex-shrink-0" />
                  <span>{property.profiles.phone}</span>
                </div>
              )}
            </div>
            <Link
              href={`/users/${property.user_id}`}
              className="mt-4 block w-full text-center text-xs py-2 border border-adm-border text-adm-muted hover:text-adm-text hover:border-adm-faint transition-colors"
            >
              View User Profile →
            </Link>
          </div>

          {/* Meta */}
          <div className="bg-adm-surface border border-adm-border p-5">
            <h3 className="text-sm font-semibold text-adm-text mb-4">Metadata</h3>
            <div className="space-y-3">
              {[
                { label: 'Created', value: new Date(property.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) },
                { label: 'Updated', value: new Date(property.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) },
                { label: 'Verified', value: property.verified_at ? new Date(property.verified_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—' },
                { label: 'Property ID', value: property.id.slice(0, 8) + '...' },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-center gap-2">
                  <span className="text-[11px] text-adm-muted">{label}</span>
                  <span className="text-xs text-adm-text font-medium">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-adm-surface border border-adm-red/20 p-5">
            <h3 className="text-sm font-semibold text-adm-red mb-1">Danger Zone</h3>
            <p className="text-[11px] text-adm-muted mb-4">Irreversible destructive actions</p>
            <div className="space-y-2">
              {property.verification_status === 'approved' && (
                <button
                  onClick={() => patch('deactivate', { status: 'inactive', verification_status: 'rejected' })}
                  disabled={!!actionLoading}
                  className="w-full py-2 text-xs font-semibold border border-adm-amber/30 text-adm-amber hover:bg-adm-amber/10 transition-colors disabled:opacity-50"
                >
                  Deactivate Listing
                </button>
              )}
              <button
                onClick={deleteProperty}
                disabled={actionLoading === 'delete'}
                className="w-full py-2 text-xs font-semibold border border-adm-red/30 text-adm-red hover:bg-adm-red/10 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {actionLoading === 'delete' ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                Delete Property
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
