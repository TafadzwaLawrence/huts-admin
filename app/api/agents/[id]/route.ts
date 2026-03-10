import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/admin'

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await requireAdmin()
    const supabase = await createAdminClient()

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
      .eq('id', id)
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await requireAdmin()
    const supabase = await createAdminClient()

    const { error } = await supabase
      .from('agent_profiles')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Admin] agents DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
