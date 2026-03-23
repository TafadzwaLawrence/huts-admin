import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { logAdminActivity } from '@/lib/admin'
import { createAdminClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

/**
 * POST /api/bulk-actions
 * Perform bulk operations on properties or users
 * 
 * Body:
 * {
 *   action: 'approve' | 'reject' | 'delete' | 'suspend' | 'unsuspend'
 *   resourceType: 'property' | 'user'
 *   resourceIds: string[]
 *   metadata?: { reason?: string, [key: string]: any }
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Verify admin access
    const adminUser = await requireAdmin()

    const body = await request.json()
    const { action, resourceType, resourceIds, metadata = {} } = body

    // Validation
    if (!action || !resourceType || !Array.isArray(resourceIds) || resourceIds.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: action, resourceType, resourceIds' },
        { status: 400 }
      )
    }

    if (!['approve', 'reject', 'delete', 'suspend', 'unsuspend'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    if (!['property', 'user', 'agent'].includes(resourceType)) {
      return NextResponse.json({ error: 'Invalid resourceType' }, { status: 400 })
    }

    const admin = createAdminClient()
    let successCount = 0
    let failureCount = 0
    const errors: string[] = []

    // Process bulk action based on resource type
    if (resourceType === 'property') {
      for (const propertyId of resourceIds) {
        try {
          if (action === 'approve') {
            const { error } = await admin
              .from('properties')
              .update({
                verification_status: 'approved',
                verified_at: new Date().toISOString(),
                status: 'active',
                rejection_reason: null,
              })
              .eq('id', propertyId)

            if (error) throw error
            successCount++
          } else if (action === 'reject') {
            const { error } = await admin
              .from('properties')
              .update({
                verification_status: 'rejected',
                status: 'inactive',
                rejection_reason: metadata.reason || 'Rejected by admin',
              })
              .eq('id', propertyId)

            if (error) throw error
            successCount++
          } else if (action === 'delete') {
            const { error } = await admin
              .from('properties')
              .delete()
              .eq('id', propertyId)

            if (error) throw error
            successCount++
          }
        } catch (error) {
          failureCount++
          errors.push(`Property ${propertyId}: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      }

      // Log bulk action
      if (adminUser && adminUser.user) {
        await logAdminActivity({
          adminId: adminUser.user.id,
          action: action === 'approve' ? 'bulk_approve' : action === 'reject' ? 'bulk_reject' : 'bulk_delete',
          resourceType: 'property',
          resourceId: resourceIds.join(','),
          metadata: {
            count: successCount,
            totalAttempted: resourceIds.length,
            failures: failureCount,
            reason: metadata.reason,
          },
        })
      }
    } else if (resourceType === 'user') {
      for (const userId of resourceIds) {
        try {
          if (action === 'suspend') {
            const { error } = await admin
              .from('profiles')
              .update({ verified: false })
              .eq('id', userId)

            if (error) throw error
            successCount++
          } else if (action === 'unsuspend') {
            const { error } = await admin
              .from('profiles')
              .update({ verified: true })
              .eq('id', userId)

            if (error) throw error
            successCount++
          } else if (action === 'delete') {
            const { error } = await admin
              .from('profiles')
              .delete()
              .eq('id', userId)

            if (error) throw error
            successCount++
          }
        } catch (error) {
          failureCount++
          errors.push(`User ${userId}: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      }

      // Log bulk action
      if (adminUser && adminUser.user) {
        await logAdminActivity({
          adminId: adminUser.user.id,
          action: action === 'suspend' ? 'user_suspended' : action === 'unsuspend' ? 'user_unsuspended' : 'bulk_delete',
          resourceType: 'user',
          resourceId: resourceIds.join(','),
          metadata: {
            count: successCount,
            totalAttempted: resourceIds.length,
            failures: failureCount,
          },
        })
      }
    }

    } else if (resourceType === 'agent') {
      for (const agentId of resourceIds) {
        try {
          if (action === 'approve') {
            const { error } = await admin
              .from('agents')
              .update({ status: 'active' })
              .eq('id', agentId)
            if (error) throw error
            successCount++
          } else if (action === 'suspend') {
            const { error } = await admin
              .from('agents')
              .update({ status: 'suspended' })
              .eq('id', agentId)
            if (error) throw error
            successCount++
          } else if (action === 'delete') {
            const { error } = await admin
              .from('agents')
              .delete()
              .eq('id', agentId)
            if (error) throw error
            successCount++
          }
        } catch (error) {
          failureCount++
          errors.push(`Agent ${agentId}: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      }
    }

    return NextResponse.json({
      success: true,
      successCount,
      failureCount,
      totalProcessed: resourceIds.length,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error: any) {
    console.error('[Bulk Actions] Error:', error)

    if (error.message === 'Unauthorized: Admin access required') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
