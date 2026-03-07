'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { 
  ShieldCheck, 
  ShieldAlert, 
  ShieldX, 
  MapPin, 
  Home,
  Bed,
  Bath,
  Square,
  ExternalLink,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatPrice, formatSalePrice } from '@/lib/utils'
import { AdminEmptyState, AdminPageHeader, AdminPagination, BulkActionToolbar, useAdminSelection } from '@/components/admin'
import { Button } from '@/components/ui'
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
  neighborhood: string | null
  property_type: string | null
  beds: number
  baths: number
  sqft: number | null
  created_at: string
  verified_at: string | null
  user_id: string
  profiles: { name: string | null; email: string; avatar_url: string | null }
  property_images: Array<{ url: string; is_primary: boolean }>
}

export default function AdminVerificationPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  // Bulk selection state
  const {
    selectedIds,
    selectedCount,
    toggleSelection,
    toggleAll,
    clearSelection,
    isSelected,
    isAllSelected,
    isSomeSelected,
  } = useAdminSelection(properties)

  const fetchProperties = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/properties?status=pending&page=${page}&limit=10`)
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setProperties(data.properties)
      setTotalPages(data.totalPages)
      setTotal(data.total)
      clearSelection()
    } catch (error) {
      console.error('Error fetching properties:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProperties()
  }, [page])

  const handleAction = async (propertyId: string, action: 'approve' | 'reject', reason?: string) => {
    setActionLoading(propertyId)
    try {
      const res = await fetch('/api/properties', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId, action, reason }),
      })
      if (!res.ok) throw new Error('Failed to update')
      
      // Remove from list
      setProperties(prev => prev.filter(p => p.id !== propertyId))
      setTotal(prev => prev - 1)
      setRejectingId(null)
      setRejectReason('')
    } catch (error) {
      console.error('Error updating property:', error)
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <AdminPageHeader
        title="Verification Queue"
        description={`${total} ${total === 1 ? 'property' : 'properties'} pending review`}
        action={
          properties.length > 0 && (
            <button
              onClick={toggleAll}
              className="text-sm px-3 py-1.5 border border-[#E9ECEF] rounded-lg hover:bg-[#F8F9FA] transition-colors"
            >
              {isAllSelected ? 'Deselect All' : 'Select All'}
            </button>
          )
        }
      />

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-[#E9ECEF] p-5">
              <div className="flex gap-4">
                <div className="w-32 h-24 bg-[#E9ECEF] rounded-lg animate-pulse flex-shrink-0" />
                <div className="flex-1 space-y-3">
                  <div className="h-5 bg-[#E9ECEF] rounded animate-pulse w-2/3" />
                  <div className="h-4 bg-[#E9ECEF] rounded animate-pulse w-1/3" />
                  <div className="h-4 bg-[#E9ECEF] rounded animate-pulse w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : properties.length === 0 ? (
        <AdminEmptyState
          icon={ShieldCheck}
          title="All caught up!"
          description="No properties pending verification"
        />
      ) : (
        <div className="space-y-4">
          {properties.map((property) => {
            const primaryImage = property.property_images?.find(img => img.is_primary) || property.property_images?.[0]
            const listingType = property.listing_type || 'rent'
            const isForSale = listingType === 'sale'
            const displayPrice = isForSale && property.sale_price
              ? formatSalePrice(property.sale_price)
              : property.price
                ? formatPrice(property.price)
                : '$0'
            const owner = property.profiles
            const isRejecting = rejectingId === property.id
            const isLoading = actionLoading === property.id

            return (
              <div key={property.id} className="bg-white rounded-xl border border-[#E9ECEF] overflow-hidden hover:border-[#ADB5BD] transition-colors">
                <div className="flex flex-col sm:flex-row">
                  {/* Checkbox */}
                  <div className="flex items-start p-4 sm:items-center sm:p-3">
                    <input
                      type="checkbox"
                      checked={isSelected(property.id)}
                      onChange={() => toggleSelection(property.id)}
                      className="w-4 h-4 border-[#E9ECEF] rounded focus:ring-[#212529] cursor-pointer"
                    />
                  </div>

                  {/* Image */}
                  <div className="relative w-full sm:w-48 h-40 sm:h-auto flex-shrink-0 bg-[#F8F9FA]">
                    {primaryImage?.url ? (
                      <Image
                        src={primaryImage.url}
                        alt={property.title}
                        fill
                        className="object-cover"
                        sizes="192px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center min-h-[140px]">
                        <Home size={ICON_SIZES['2xl']} className="text-[#ADB5BD]" />
                      </div>
                    )}
                    <div className="absolute top-2 left-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${
                        isForSale ? 'bg-[#212529] text-white' : 'bg-white/90 text-[#212529] backdrop-blur-sm'
                      }`}>
                        {isForSale ? 'Sale' : 'Rent'}
                      </span>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="flex-1 p-5">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <h3 className="text-base font-semibold text-[#212529]">{property.title}</h3>
                        <p className="text-sm text-[#ADB5BD] flex items-center gap-1 mt-0.5">
                          <MapPin size={ICON_SIZES.sm} />
                          {property.neighborhood ? `${property.neighborhood}, ` : ''}{property.city}
                        </p>
                      </div>
                      <p className="text-lg font-bold text-[#212529] flex-shrink-0">
                        {displayPrice}{!isForSale && <span className="text-xs text-[#ADB5BD] font-normal">/mo</span>}
                      </p>
                    </div>

                    {/* Property specs */}
                    <div className="flex items-center gap-4 text-sm text-[#495057] mb-3">
                      {property.property_type && (
                        <span className="capitalize">{property.property_type}</span>
                      )}
                      <span className="flex items-center gap-1"><Bed size={ICON_SIZES.sm} /> {property.beds} bed</span>
                      <span className="flex items-center gap-1"><Bath size={ICON_SIZES.sm} /> {property.baths} bath</span>
                      {property.sqft && property.sqft > 0 && (
                        <span className="flex items-center gap-1"><Square size={ICON_SIZES.sm} /> {property.sqft.toLocaleString()} sqft</span>
                      )}
                    </div>

                    {/* Owner info */}
                    <div className="flex items-center gap-2 mb-4 text-xs text-[#ADB5BD]">
                      <div className="w-5 h-5 rounded-full bg-[#F8F9FA] flex items-center justify-center text-[9px] font-bold text-[#495057] flex-shrink-0">
                        {(owner?.name || owner?.email || '?')[0].toUpperCase()}
                      </div>
                      <span>{owner?.name || 'Unknown'}</span>
                      <span>·</span>
                      <span>{owner?.email}</span>
                      <span>·</span>
                      <span>{new Date(property.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>

                    {/* Rejection form */}
                    {isRejecting && (
                      <div className="mb-4 p-3 bg-[#FFF5F5] border border-red-100 rounded-lg">
                        <label className="block text-xs font-semibold text-[#495057] mb-1.5">Rejection Reason (optional)</label>
                        <textarea
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          placeholder="Explain why this property was rejected..."
                          rows={2}
                          className="w-full px-3 py-2 text-sm border border-red-200 rounded-lg focus:outline-none focus:border-[#FF6B6B] transition-colors resize-none"
                        />
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => handleAction(property.id, 'reject', rejectReason)}
                            disabled={isLoading}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FF6B6B] text-white text-xs font-semibold rounded-lg hover:bg-[#FF6B6B]/90 disabled:opacity-50 transition-colors"
                          >
                            {isLoading ? <Loader2 size={ICON_SIZES.xs} className="animate-spin" /> : <ShieldX size={ICON_SIZES.xs} />}
                            Confirm Reject
                          </button>
                          <button
                            onClick={() => { setRejectingId(null); setRejectReason('') }}
                            className="px-3 py-1.5 text-xs text-[#495057] font-medium hover:text-[#212529] transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Action buttons */}
                    {!isRejecting && (
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => handleAction(property.id, 'approve')}
                          disabled={isLoading}
                          variant="primary"
                          size="md"
                        >
                          {isLoading ? <Loader2 size={ICON_SIZES.sm} className="animate-spin" /> : <Check size={ICON_SIZES.sm} />}
                          Approve
                        </Button>
                        <button
                          onClick={() => setRejectingId(property.id)}
                          disabled={isLoading}
                          className="flex items-center gap-1.5 px-4 py-2 border-2 border-[#FF6B6B] text-[#FF6B6B] text-sm font-semibold rounded-lg hover:bg-[#FFF5F5] disabled:opacity-50 transition-colors"
                        >
                          <X size={ICON_SIZES.sm} />
                          Reject
                        </button>
                        <Link
                          href={`/property/${property.slug || property.id}`}
                          target="_blank"
                          className="flex items-center gap-1.5 px-3 py-2 text-sm text-[#495057] hover:text-[#212529] transition-colors ml-auto"
                        >
                          <ExternalLink size={ICON_SIZES.sm} />
                          View
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}

          {/* Pagination */}
          <AdminPagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      )}

      {/* Bulk Action Toolbar */}
      <BulkActionToolbar
        selectedCount={selectedCount}
        resourceType="property"
        selectedIds={selectedIds}
        onActionComplete={fetchProperties}
        onClearSelection={clearSelection}
      />
    </div>
  )
}
