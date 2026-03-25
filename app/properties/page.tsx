'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { 
  Building2, 
  MapPin, 
  Home,
  CheckCircle,
  XCircle,
  Trash2,
  Eye,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import { formatPrice, formatSalePrice } from '@/lib/utils'
import { AdminPageHeader, AdminEmptyState, AdminPagination, AdminExportButton } from '@/components/admin'
import { Badge } from '@/components/ui'
import { ICON_SIZES } from '@/lib/constants'

interface Property {
  id: string
  title: string
  slug: string
  status: string
  verification_status: string
  listing_type: string | null
  price: number | null
  sale_price: number | null
  city: string
  area: string | null
  property_type: string | null
  bedrooms: number
  bathrooms: number
  square_feet: number | null
  created_at: string
  verified_at: string | null
  user_id: string
  profiles: { full_name: string | null; email: string; avatar_url: string | null }
  property_images: Array<{ url: string; is_primary: boolean }>
}

export default function AdminPropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [statusFilter, setStatusFilter] = useState('all')
  const [error, setError] = useState<string | null>(null)

  const fetchProperties = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/properties?status=${statusFilter}&page=${page}&limit=20`)
      if (!res.ok) throw new Error(`Server error (${res.status})`)
      const data = await res.json()
      setProperties(data.properties)
      setTotalPages(data.totalPages)
      setTotal(data.total)
    } catch (err) {
      console.error('Error fetching properties:', err)
      setError(err instanceof Error ? err.message : 'Failed to load properties')
    } finally {
      setLoading(false)
    }
  }, [page, statusFilter])

  useEffect(() => { setPage(1) }, [statusFilter])
  useEffect(() => { fetchProperties() }, [fetchProperties])

  const patchProperty = async (id: string, key: string, body: object) => {
    setActionLoading(id + key)
    try {
      const res = await fetch(`/api/properties/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error('Action failed')
      await fetchProperties()
    } catch (e) {
      alert('Action failed. Please try again.')
    } finally {
      setActionLoading(null)
    }
  }

  const deleteProperty = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return
    setActionLoading(id + 'delete')
    try {
      const res = await fetch(`/api/properties/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      await fetchProperties()
    } catch {
      alert('Delete failed. Please try again.')
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <AdminPageHeader
        title="All Properties"
        description={`${total} total properties`}
        action={
          <div className="flex items-center gap-3">
            <AdminExportButton type="properties" />
            <div className="flex items-center gap-0.5 bg-adm-surface-2 p-0.5 border border-adm-border">
              {['all', 'approved', 'pending', 'rejected'].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-4 py-1.5 text-xs font-semibold transition-all ${
                    statusFilter === s
                      ? 'bg-adm-accent text-white'
                      : 'text-adm-muted hover:text-adm-text'
                  }`}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>
        }
      />

      {loading ? (
        <div className="bg-adm-surface border border-adm-border overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-adm-border">
              <div className="w-14 h-14 bg-adm-border animate-pulse flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-adm-border animate-pulse w-1/2" />
                <div className="h-3 bg-adm-border animate-pulse w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <AdminEmptyState
          icon={AlertCircle}
          title="Failed to load properties"
          description={error}
          action={
            <button onClick={fetchProperties} className="text-sm px-4 py-2 bg-adm-accent text-white hover:bg-adm-accent/90 transition-colors">
              Try again
            </button>
          }
        />
      ) : properties.length === 0 ? (
        <AdminEmptyState
          icon={Building2}
          title="No properties found"
          description={statusFilter !== 'all' ? `No ${statusFilter} properties` : 'No properties in the system'}
        />
      ) : (
        <>
          <div className="bg-adm-surface border border-adm-border overflow-hidden">
            {/* Table Header */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 bg-adm-surface-2 text-[10px] font-semibold text-adm-faint uppercase tracking-wider border-b border-adm-border">
              <div className="col-span-4">Property</div>
              <div className="col-span-2">Owner</div>
              <div className="col-span-1">Type</div>
              <div className="col-span-1">Price</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-1">Date</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>

            <div className="divide-y divide-adm-border">
              {properties.map((property) => {
                const primaryImage = property.property_images?.find(img => img.is_primary) || property.property_images?.[0]
                const listingType = property.listing_type || 'rent'
                const isForSale = listingType === 'sale'
                const displayPrice = isForSale && property.sale_price
                  ? formatSalePrice(property.sale_price)
                  : property.price ? formatPrice(property.price) : '—'
                const owner = property.profiles
                const busy = (key: string) => actionLoading === property.id + key

                return (
                  <div key={property.id} className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 items-center px-5 py-3 hover:bg-adm-surface-2 transition-colors">
                    {/* Property */}
                    <div className="md:col-span-4 flex items-center gap-3">
                      <div className="relative w-11 h-11 bg-adm-surface-2 flex-shrink-0 overflow-hidden">
                        {primaryImage?.url ? (
                          <Image src={primaryImage.url} alt="" fill className="object-cover" sizes="44px" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Home size={ICON_SIZES.md} className="text-adm-faint" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-adm-text truncate">{property.title}</p>
                        <p className="text-xs text-adm-faint flex items-center gap-1 truncate">
                          <MapPin size={ICON_SIZES.xs} />
                          {property.area ? `${property.area}, ` : ''}{property.city}
                        </p>
                      </div>
                    </div>

                    {/* Owner */}
                    <div className="md:col-span-2 min-w-0 hidden md:block">
                      <p className="text-xs text-adm-muted truncate">{owner?.full_name || 'Unknown'}</p>
                      <p className="text-[10px] text-adm-faint truncate">{owner?.email}</p>
                    </div>

                    {/* Type */}
                    <div className="md:col-span-1 hidden md:block">
                      <Badge variant="default" size="sm">{isForSale ? 'Sale' : 'Rent'}</Badge>
                    </div>

                    {/* Price */}
                    <div className="md:col-span-1 hidden md:block">
                      <p className="text-sm font-semibold text-adm-text">{displayPrice}</p>
                    </div>

                    {/* Status */}
                    <div className="md:col-span-1">
                      <span className={`text-[10px] px-2 py-1 font-semibold ${
                        property.verification_status === 'approved' ? 'bg-adm-green/10 text-adm-green' :
                        property.verification_status === 'pending'  ? 'bg-adm-amber/10 text-adm-amber' :
                        'bg-adm-red/10 text-adm-red'
                      }`}>
                        {property.verification_status}
                      </span>
                    </div>

                    {/* Date */}
                    <div className="md:col-span-1 hidden md:block">
                      <p className="text-xs text-adm-faint">
                        {new Date(property.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="md:col-span-2 flex items-center justify-end gap-1">
                      {/* View detail */}
                      <Link
                        href={`/properties/${property.id}`}
                        className="p-1.5 text-adm-muted hover:text-adm-text hover:bg-adm-surface-2 transition-colors"
                        title="View details"
                      >
                        <Eye size={14} />
                      </Link>
                      {/* Approve */}
                      {property.verification_status !== 'approved' && (
                        <button
                          onClick={() => patchProperty(property.id, 'approve', { verification_status: 'approved' })}
                          disabled={busy('approve')}
                          className="p-1.5 text-adm-muted hover:text-adm-green hover:bg-adm-green/10 transition-colors disabled:opacity-40"
                          title="Approve"
                        >
                          {busy('approve') ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                        </button>
                      )}
                      {/* Reject */}
                      {property.verification_status !== 'rejected' && (
                        <button
                          onClick={() => patchProperty(property.id, 'reject', { verification_status: 'rejected' })}
                          disabled={busy('reject')}
                          className="p-1.5 text-adm-muted hover:text-adm-amber hover:bg-adm-amber/10 transition-colors disabled:opacity-40"
                          title="Reject"
                        >
                          {busy('reject') ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                        </button>
                      )}
                      {/* Delete */}
                      <button
                        onClick={() => deleteProperty(property.id, property.title)}
                        disabled={busy('delete')}
                        className="p-1.5 text-adm-muted hover:text-adm-red hover:bg-adm-red/10 transition-colors disabled:opacity-40"
                        title="Delete"
                      >
                        {busy('delete') ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <AdminPagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  )
}
