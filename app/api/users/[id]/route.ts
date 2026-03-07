import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { requireAdmin, logAdminActivity } from '@/lib/admin'

// PATCH /api/users/[id] - Update user details
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin access
    const { user: adminUser } = await requireAdmin()

    const userId = params.id
    const body = await request.json()
    const { name, role, verified, is_admin } = body

    // Build update object with only provided fields
    const updates: any = {}
    if (name !== undefined) updates.name = name
    if (role !== undefined) updates.role = role
    if (verified !== undefined) updates.verified = verified
    if (is_admin !== undefined) updates.is_admin = is_admin

    // Update user profile
    const admin = createAdminClient()
    const { data: updatedUser, error } = await admin
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      console.error('Error updating user:', error)
      return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
    }

    // Log the admin action
    if (adminUser) {
      await logAdminActivity({
        adminId: adminUser.id,
        action: 'user_edited',
        resourceType: 'user',
        resourceId: userId,
        metadata: {
          changes: updates,
          updatedFields: Object.keys(updates),
        },
      })
    }

    return NextResponse.json({ user: updatedUser })
  } catch (error: any) {
    console.error('User update error:', error)
    
    if (error.message === 'Unauthorized: Admin access required') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/users/[id] - Delete user (soft delete or hard delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin access
    const { user: adminUser } = await requireAdmin()

    const userId = params.id

    // For now, we'll do a hard delete
    // In production, you might want to soft delete by setting a deleted_at timestamp
    const admin = createAdminClient()
    const { error } = await admin
      .from('profiles')
      .delete()
      .eq('id', userId)

    if (error) {
      console.error('Error deleting user:', error)
      return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
    }

    // Log the admin action
    if (adminUser) {
      await logAdminActivity({
        adminId: adminUser.id,
        action: 'user_deleted',
        resourceType: 'user',
        resourceId: userId,
        metadata: {
          deletedAt: new Date().toISOString(),
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('User deletion error:', error)
    
    if (error.message === 'Unauthorized: Admin access required') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET /api/users/[id] - Get user details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin access
    await requireAdmin()

    const userId = params.id

    // Fetch user details
    const admin = createAdminClient()
    const { data: user, error } = await admin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error fetching user:', error)
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get user's properties count
    const { count: propertiesCount } = await admin
      .from('properties')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    // Get user's reviews count
    const { count: reviewsCount } = await admin
      .from('reviews')
      .select('*', { count: 'exact', head: true })
      .eq('author_id', userId)

    return NextResponse.json({
      user,
      stats: {
        properties: propertiesCount || 0,
        reviews: reviewsCount || 0,
      },
    })
  } catch (error: any) {
    console.error('User fetch error:', error)
    
    if (error.message === 'Unauthorized: Admin access required') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
