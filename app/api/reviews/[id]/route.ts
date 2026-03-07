import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { requireAdmin, logAdminActivity } from '@/lib/admin'

// DELETE /api/reviews/[id] - Hard delete a review
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user: adminUser } = await requireAdmin()
    const reviewId = params.id

    const admin = createAdminClient()

    const { data: existing, error: fetchError } = await admin
      .from('reviews')
      .select('id, comment_text, author_id, property_id')
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
    if (error.message === 'Unauthorized: Admin access required') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
