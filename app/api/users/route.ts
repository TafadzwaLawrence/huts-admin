import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

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
    const role = searchParams.get('role') // landlord, renter, all
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    const admin = createAdminClient()

    let query = admin
      .from('profiles')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (role && role !== 'all') {
      query = query.eq('role', role)
    }

    const { data, count, error } = await query

    if (error) throw error

    return NextResponse.json({
      users: data || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    })
  } catch (error) {
    console.error('[Admin Users] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
