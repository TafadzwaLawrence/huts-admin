import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { createAdminClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

/**
 * GET /api/export?type=properties|users&format=csv
 * Export admin data as CSV
 */
export async function GET(request: NextRequest) {
  try {
    // Verify admin access
    await requireAdmin()

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'properties'
    const format = searchParams.get('format') || 'csv'

    if (!['properties', 'users'].includes(type)) {
      return NextResponse.json({ error: 'Invalid export type' }, { status: 400 })
    }

    if (format !== 'csv') {
      return NextResponse.json({ error: 'Only CSV format is supported' }, { status: 400 })
    }

    const admin = createAdminClient()

    if (type === 'properties') {
      // Export all properties
      const { data: properties, error } = await admin
        .from('properties')
        .select(`
          id,
          title,
          slug,
          listing_type,
          property_type,
          status,
          verification_status,
          price,
          sale_price,
          beds,
          baths,
          sqft,
          city,
          neighborhood,
          created_at,
          verified_at,
          profiles:user_id (name, email, role)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Generate CSV
      const csvHeader = 'ID,Title,Slug,Listing Type,Property Type,Status,Verification Status,Price,Sale Price,Beds,Baths,SqFt,City,Neighborhood,Owner Name,Owner Email,Owner Role,Created At,Verified At\n'
      
      const csvRows = properties.map((p: any) => {
        const owner = p.profiles || {}
        return [
          p.id,
          `"${p.title || ''}"`,
          p.slug || '',
          p.listing_type || 'rent',
          p.property_type || '',
          p.status || '',
          p.verification_status || '',
          p.price || '',
          p.sale_price || '',
          p.beds || '',
          p.baths || '',
          p.sqft || '',
          `"${p.city || ''}"`,
          `"${p.neighborhood || ''}"`,
          `"${owner.name || ''}"`,
          owner.email || '',
          owner.role || '',
          p.created_at || '',
          p.verified_at || ''
        ].join(',')
      }).join('\n')

      const csv = csvHeader + csvRows

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="properties_${new Date().toISOString().split('T')[0]}.csv"`,
        },
      })
    } else if (type === 'users') {
      // Export all users
      const { data: users, error } = await admin
        .from('profiles')
        .select('id, name, email, role, phone, verified, is_admin, created_at')
        .order('created_at', { ascending: false })

      if (error) throw error

      // Generate CSV
      const csvHeader = 'ID,Name,Email,Role,Phone,Verified,Admin,Created At\n'
      
      const csvRows = users.map((u: any) => {
        return [
          u.id,
          `"${u.name || ''}"`,
          u.email || '',
          u.role || '',
          `"${u.phone || ''}"`,
          u.verified ? 'Yes' : 'No',
          u.is_admin ? 'Yes' : 'No',
          u.created_at || ''
        ].join(',')
      }).join('\n')

      const csv = csvHeader + csvRows

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="users_${new Date().toISOString().split('T')[0]}.csv"`,
        },
      })
    }

    return NextResponse.json({ error: 'Invalid export type' }, { status: 400 })
  } catch (error: any) {
    console.error('[Export] Error:', error)

    if (error.message === 'Unauthorized: Admin access required') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
