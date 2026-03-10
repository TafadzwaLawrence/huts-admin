import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/admin'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await requireAdmin()

    const admin = createAdminClient()

    const [
      { count: totalProperties },
      { count: pendingProperties },
      { count: approvedProperties },
      { count: rejectedProperties },
      { count: totalUsers },
      { count: landlordCount },
      { count: renterCount },
      { count: totalConversations },
      { count: totalReviews },
    ] = await Promise.all([
      admin.from('properties').select('*', { count: 'exact', head: true }),
      admin.from('properties').select('*', { count: 'exact', head: true }).eq('verification_status', 'pending'),
      admin.from('properties').select('*', { count: 'exact', head: true }).eq('verification_status', 'approved'),
      admin.from('properties').select('*', { count: 'exact', head: true }).eq('verification_status', 'rejected'),
      admin.from('profiles').select('*', { count: 'exact', head: true }),
      admin.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'landlord'),
      admin.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'renter'),
      admin.from('conversations').select('*', { count: 'exact', head: true }),
      admin.from('reviews').select('*', { count: 'exact', head: true }),
    ])

    return NextResponse.json({
      properties: {
        total: totalProperties || 0,
        pending: pendingProperties || 0,
        approved: approvedProperties || 0,
        rejected: rejectedProperties || 0,
      },
      users: {
        total: totalUsers || 0,
        landlords: landlordCount || 0,
        renters: renterCount || 0,
      },
      conversations: totalConversations || 0,
      reviews: totalReviews || 0,
    })
  } catch (error) {
    console.error('[Admin Stats] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
