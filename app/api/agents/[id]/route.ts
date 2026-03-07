import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || 'chitangalawrence03@gmail.com')
  .split(',')
  .map(e => e.trim())

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    if (!ADMIN_EMAILS.includes(user.email || '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const allowed: Record<string, unknown> = {}

    // Only allow specific fields to be updated
    if ('status' in body && ['pending', 'active', 'suspended', 'inactive'].includes(body.status)) {
      allowed.status = body.status
    }
    if ('verified' in body && typeof body.verified === 'boolean') {
      allowed.verified = body.verified
      if (body.verified) allowed.verification_date = new Date().toISOString()
    }
    if ('featured' in body && typeof body.featured === 'boolean') {
      allowed.featured = body.featured
    }

    if (!Object.keys(allowed).length) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('agent_profiles')
      .update({ ...allowed, updated_at: new Date().toISOString() })
      .eq('id', params.id)
      .select('id, status, verified, featured')
      .single()

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error) {
    console.error('[Admin] agents PATCH error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    if (!ADMIN_EMAILS.includes(user.email || '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { error } = await supabase
      .from('agent_profiles')
      .delete()
      .eq('id', params.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Admin] agents DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
