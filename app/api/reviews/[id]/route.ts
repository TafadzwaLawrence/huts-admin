import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { requireAdmin, logAdminActivity, UnauthorizedError } from '@/lib/admin'

// PATCH /api/reviews/[id] - Update review status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user: adminUser } = await requireAdmin()
    const { id: reviewId } = await params
    const body = await request.json()
    const { status, flagged_reason } = body

    const VALID_STATUSES = ['pending', 'published', 'flagged', 'removed']
    if (!status || !VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const admin = createAdminClient()
    const updates: any = { status }
    if (flagged_reason !== undefined) updates.flagged_reason = flagged_reason

    const { data: updated, error } = await admin
      .from('reviews')
      .update(updates)
      .eq('id', reviewId)
      .select()
      .single()

    if (error) throw error

    await logAdminActivity({
      adminId: adminUser!.id,
      action: 'other',
      resourceType: 'review',
      resourceId: reviewId,
      metadata: { newStatus: status },
    })

    return NextResponse.json({ review: updated })
  } catch (error: any) {
    console.error('[Admin Reviews] PATCH error:', error)
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/reviews/[id] - Hard delete a review
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user: adminUser } = await requireAdmin()
    const { id: reviewId } = await params

    const admin = createAdminClient()

    const { data: existing, error: fetchError } = await admin
      .from('reviews')
      .select('id, comment, author_id, property_id')
      .eq('id', reviewId)
      .single()

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    }

    const { error } = await admin.from('reviews').delete().eq('id', reviewId)
    if (error) throw error

    await logAdminActivity({
      adminId: adminUser!.id,
      action: 'review_deleted',
      resourceType: 'review',
      resourceId: reviewId,
      metadata: {
        authorId: existing.author_id,
        propertyId: existing.property_id,
        deletedAt: new Date().toISOString(),
      },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[Admin Reviews] DELETE error:', error)
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
