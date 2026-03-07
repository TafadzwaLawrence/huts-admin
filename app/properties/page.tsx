'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { 
  Building2, 
  MapPin, 
  Home,
  ExternalLink,
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

export default function AdminPropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [statusFilter, setStatusFilter] = useState('all')

  const fetchProperties = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/properties?status=${statusFilter}&page=${page}&limit=20`)
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setProperties(data.properties)
      setTotalPages(data.totalPages)
      setTotal(data.total)
    } catch (error) {
      console.error('Error fetching properties:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setPage(1)
  }, [statusFilter])

  useEffect(() => {
    fetchProperties()
  }, [page, statusFilter])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <AdminPageHeader
        title="All Properties"
        description={`${total} total properties`}
        action={
          <div className="flex items-center gap-3">
            <AdminExportButton type="properties" />
            <div className="flex items-center gap-0.5 bg-[#F8F9FA] p-0.5 rounded-full border border-[#E9ECEF]">
              {['all', 'approved', 'pending', 'rejected'].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all ${
                  statusFilter === s
                    ? 'bg-[#212529] text-white shadow-sm'
                    : 'text-[#495057] hover:text-[#212529]'
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
        <div className="bg-white rounded-xl border border-[#E9ECEF] overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-[#E9ECEF]">
              <div className="w-14 h-14 bg-[#E9ECEF] rounded-lg animate-pulse flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-[#E9ECEF] rounded animate-pulse w-1/2" />
                <div className="h-3 bg-[#E9ECEF] rounded animate-pulse w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : properties.length === 0 ? (
        <AdminEmptyState
          icon={Building2}
          title="No properties found"
          description={statusFilter !== 'all' ? `No ${statusFilter} properties` : 'No properties in the system'}
        />
      ) : (
        <>
          <div className="bg-white rounded-xl border border-[#E9ECEF] overflow-hidden">
            {/* Table Header */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 bg-[#F8F9FA] text-[10px] font-semibold text-[#ADB5BD] uppercase tracking-wider border-b border-[#E9ECEF]">
              <div className="col-span-5">Property</div>
              <div className="col-span-2">Owner</div>
              <div className="col-span-1">Type</div>
              <div className="col-span-1">Price</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-1">Date</div>
              <div className="col-span-1"></div>
            </div>

            <div className="divide-y divide-[#E9ECEF]">
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

                return (
                  <div key={property.id} className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 items-center px-5 py-3.5 hover:bg-[#F8F9FA] transition-colors">
                    {/* Property */}
                    <div className="md:col-span-5 flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-[#F8F9FA] flex-shrink-0">
                        {primaryImage?.url ? (
                          <Image src={primaryImage.url} alt="" fill className="object-cover" sizes="48px" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Home size={ICON_SIZES.md} className="text-[#ADB5BD]" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[#212529] truncate">{property.title}</p>
                        <p className="text-xs text-[#ADB5BD] flex items-center gap-1 truncate">
                          <MapPin size={ICON_SIZES.xs} />
                          {property.neighborhood ? `${property.neighborhood}, ` : ''}{property.city}
                        </p>
                      </div>
                    </div>

                    {/* Owner */}
                    <div className="md:col-span-2 min-w-0 hidden md:block">
                      <p className="text-xs text-[#495057] truncate">{owner?.name || 'Unknown'}</p>
                      <p className="text-[10px] text-[#ADB5BD] truncate">{owner?.email}</p>
                    </div>

                    {/* Type */}
                    <div className="md:col-span-1 hidden md:block">
                      <Badge variant="default" size="sm">
                        {isForSale ? 'Sale' : 'Rent'}
                      </Badge>
                    </div>

                    {/* Price */}
                    <div className="md:col-span-1 hidden md:block">
                      <p className="text-sm font-semibold text-[#212529]">{displayPrice}</p>
                    </div>

                    {/* Status */}
                    <div className="md:col-span-1">
                      <Badge 
                        variant="default" 
                        size="sm"
                      >
                        {property.verification_status}
                      </Badge>
                    </div>

                    {/* Date */}
                    <div className="md:col-span-1 hidden md:block">
                      <p className="text-xs text-[#ADB5BD]">
                        {new Date(property.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="md:col-span-1 flex justify-end">
                      <Link
                        href={`/property/${property.slug || property.id}`}
                        target="_blank"
                        className="p-2 text-[#ADB5BD] hover:text-[#212529] transition-colors"
                      >
                        <ExternalLink size={ICON_SIZES.sm} />
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Pagination */}
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
