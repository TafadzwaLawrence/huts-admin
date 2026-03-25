import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { requireAdmin, UnauthorizedError } from '@/lib/admin'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')       // landlord | renter | agent | admin | all
    const search = searchParams.get('search')   // free-text search on name + email
    const verified = searchParams.get('verified') // 'true' | 'false'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    const admin = createAdminClient()

    // Build paginated users query
    let query = admin
      .from('profiles')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (role && role !== 'all') {
      query = query.eq('role', role)
    }
    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`)
    }
    if (verified === 'true') {
      query = query.eq('verified', true)
    } else if (verified === 'false') {
      query = query.eq('verified', false)
    }

    // Stats aggregates (run in parallel with main query)
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const [
      usersResult,
      statsTotal,
      statsLandlords,
      statsRenters,
      statsVerified,
      statsNew,
    ] = await Promise.all([
      query,
      admin.from('profiles').select('id', { count: 'exact', head: true }),
      admin.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'landlord'),
      admin.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'renter'),
      admin.from('profiles').select('id', { count: 'exact', head: true }).eq('verified', true),
      admin.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', startOfMonth.toISOString()),
    ])

    if (usersResult.error) throw usersResult.error

    const users = usersResult.data || []

    // Property counts for this page's users
    let propertyCounts: Record<string, number> = {}
    if (users.length > 0) {
      const userIds = users.map((u: any) => u.id)
      const { data: props } = await admin
        .from('properties')
        .select('user_id')
        .in('user_id', userIds)
      if (props) {
        propertyCounts = props.reduce((acc: Record<string, number>, p: any) => {
          acc[p.user_id] = (acc[p.user_id] || 0) + 1
          return acc
        }, {})
      }
    }

    return NextResponse.json({
      users,
      total: usersResult.count || 0,
      page,
      limit,
      totalPages: Math.ceil((usersResult.count || 0) / limit),
      propertyCounts,
      stats: {
        total: statsTotal.count || 0,
        landlords: statsLandlords.count || 0,
        renters: statsRenters.count || 0,
        verified: statsVerified.count || 0,
        newThisMonth: statsNew.count || 0,
      },
    })
  } catch (error) {
    console.error('[Admin Users] Error:', error)
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
