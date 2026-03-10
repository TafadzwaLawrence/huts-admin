import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { requireAdmin, logAdminActivity } from '@/lib/admin'

// PATCH /api/properties/[id] - Update property fields or toggle status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user: adminUser } = await requireAdmin()
    const { id: propertyId } = await params
    const body = await request.json()

    const allowed: Record<string, unknown> = {}

    if ('status' in body && ['active', 'inactive', 'pending'].includes(body.status)) {
      allowed.status = body.status
    }
    if ('verification_status' in body && ['pending', 'approved', 'rejected'].includes(body.verification_status)) {
      allowed.verification_status = body.verification_status
      if (body.verification_status === 'approved') {
        allowed.verified_at = new Date().toISOString()
        if (!('status' in allowed)) allowed.status = 'active'
      } else if (body.verification_status === 'rejected') {
        if (!('status' in allowed)) allowed.status = 'inactive'
      }
    }
    if ('title' in body && typeof body.title === 'string' && body.title.trim()) {
      allowed.title = body.title.trim()
    }
    if ('price' in body && (typeof body.price === 'number' || body.price === null)) {
      allowed.price = body.price
    }
    if ('sale_price' in body && (typeof body.sale_price === 'number' || body.sale_price === null)) {
      allowed.sale_price = body.sale_price
    }
    if ('rejection_reason' in body) {
      allowed.rejection_reason = body.rejection_reason || null
    }
    if ('featured' in body && typeof body.featured === 'boolean') {
      allowed.featured = body.featured
    }

    if (!Object.keys(allowed).length) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    allowed.updated_at = new Date().toISOString()

    const admin = createAdminClient()
    const { data, error } = await admin
      .from('properties')
      .update(allowed)
      .eq('id', propertyId)
      .select('id, title, status, verification_status')
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Property not found' }, { status: 404 })
      }
      throw error
    }

    await logAdminActivity({
      adminId: adminUser!.id,
      action: 'property_edited',
      resourceType: 'property',
      resourceId: propertyId,
      metadata: { changes: allowed, updatedFields: Object.keys(allowed) },
    })

    return NextResponse.json({ property: data })
  } catch (error: any) {
    console.error('[Admin] property PATCH error:', error)
    if (error.message === 'Unauthorized: Admin access required') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/properties/[id] - Hard delete a property
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user: adminUser } = await requireAdmin()
    const { id: propertyId } = await params

    const admin = createAdminClient()

    // Verify the property exists first
    const { data: existing, error: fetchError } = await admin
      .from('properties')
      .select('id, title')
      .eq('id', propertyId)
      .single()

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    }

    const { error } = await admin
      .from('properties')
      .delete()
      .eq('id', propertyId)

    if (error) throw error

    await logAdminActivity({
      adminId: adminUser!.id,
      action: 'property_deleted',
      resourceType: 'property',
      resourceId: propertyId,
      metadata: { title: existing.title, deletedAt: new Date().toISOString() },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[Admin] property DELETE error:', error)
    if (error.message === 'Unauthorized: Admin access required') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
