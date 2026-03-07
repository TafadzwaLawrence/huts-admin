import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { logAdminActivity } from '@/lib/admin'

export const dynamic = 'force-dynamic'

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || 'chitangalawrence03@gmail.com').split(',').map(e => e.trim())

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !ADMIN_EMAILS.includes(user.email || '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') // pending, approved, rejected, all
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    const admin = createAdminClient()

    let query = admin
      .from('properties')
      .select(`
        id, title, slug, status, verification_status, listing_type,
        price, sale_price, city, neighborhood, property_type,
        beds, baths, sqft, created_at, verified_at,
        user_id,
        profiles!properties_user_id_fkey(name, email, avatar_url),
        property_images(url, is_primary)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status && status !== 'all') {
      query = query.eq('verification_status', status)
    }

    const { data, count, error } = await query

    if (error) throw error

    return NextResponse.json({
      properties: data || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    })
  } catch (error) {
    console.error('[Admin Properties] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !ADMIN_EMAILS.includes(user.email || '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await request.json()
    const { propertyId, action, reason } = body

    if (!propertyId || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 })
    }

    const admin = createAdminClient()

    const updateData: Record<string, unknown> = {
      verification_status: action === 'approve' ? 'approved' : 'rejected',
      verified_at: new Date().toISOString(),
    }

    if (action === 'approve') {
      updateData.status = 'active'
    } else {
      updateData.status = 'inactive'
      if (reason) updateData.rejection_reason = reason
    }

    const { error } = await admin
      .from('properties')
      .update(updateData)
      .eq('id', propertyId)

    if (error) throw error

    // Log the admin action
    await logAdminActivity({
      adminId: user.id,
      action: action === 'approve' ? 'property_approved' : 'property_rejected',
      resourceType: 'property',
      resourceId: propertyId,
      metadata: {
        reason: reason || null,
        verificationStatus: updateData.verification_status,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Admin Properties PATCH] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
