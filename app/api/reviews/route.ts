import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/admin'

export const dynamic = 'force-dynamic'

// GET /api/reviews - List all reviews with pagination and filters
export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit
    const status = searchParams.get('status') // 'all' | 'flagged' | 'hidden'

    const admin = createAdminClient()

    let query = admin
      .from('reviews')
      .select(
        `
        id, rating, comment_text, created_at, updated_at,
        helpful_count, not_helpful_count, is_verified_tenant,
        author_id, property_id,
        profiles!reviews_author_id_fkey(name, email, avatar_url),
        properties!reviews_property_id_fkey(title, slug, city)
      `,
        { count: 'exact' }
      )
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status === 'flagged') {
      query = query.gte('not_helpful_count', 3)
    }

    const { data, count, error } = await query
    if (error) throw error

    return NextResponse.json({
      reviews: data || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    })
  } catch (error: any) {
    console.error('[Admin Reviews] GET error:', error)
    if (error.message === 'Unauthorized: Admin access required') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
