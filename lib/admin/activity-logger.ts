import { createAdminClient } from '@/lib/supabase/server'

export type AdminAction =
  | 'property_approved'
  | 'property_rejected'
  | 'property_edited'
  | 'property_deleted'
  | 'user_edited'
  | 'user_suspended'
  | 'user_unsuspended'
  | 'user_deleted'
  | 'bulk_approve'
  | 'bulk_reject'
  | 'bulk_delete'
  | 'review_deleted'
  | 'other'

export type ResourceType = 'property' | 'user' | 'review' | 'message' | 'other'

interface LogActivityParams {
  adminId: string
  action: AdminAction
  resourceType: ResourceType
  resourceId: string
  metadata?: Record<string, any>
}

/**
 * Log an admin action to the admin_activity_logs table.
 * 
 * This creates an audit trail of all admin actions for security and compliance.
 * 
 * @param params - Activity log parameters
 * @returns The created log entry or null if failed
 */
export async function logAdminActivity({
  adminId,
  action,
  resourceType,
  resourceId,
  metadata = {},
}: LogActivityParams) {
  try {
    const admin = createAdminClient()

    const { data, error } = await admin
      .from('admin_activity_logs')
      .insert({
        admin_id: adminId,
        action,
        resource_type: resourceType,
        resource_id: resourceId,
        metadata,
      })
      .select()
      .single()

    if (error) {
      console.error('Failed to log admin activity:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error logging admin activity:', error)
    return null
  }
}

/**
 * Get recent admin activity logs.
 * 
 * @param limit - Number of logs to retrieve (default: 50)
 * @param adminId - Optional: filter by specific admin
 * @returns Array of activity logs
 */
export async function getRecentActivity(limit = 50, adminId?: string) {
  try {
    const admin = createAdminClient()

    let query = admin
      .from('admin_activity_logs')
      .select(`
        *,
        profiles!admin_activity_logs_admin_id_fkey(name, email)
      `)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (adminId) {
      query = query.eq('admin_id', adminId)
    }

    const { data, error } = await query

    if (error) {
      console.error('Failed to fetch activity logs:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error fetching activity logs:', error)
    return []
  }
}

/**
 * Get activity logs for a specific resource.
 * 
 * @param resourceType - Type of resource
 * @param resourceId - ID of the resource
 * @returns Array of activity logs for that resource
 */
export async function getResourceActivity(
  resourceType: ResourceType,
  resourceId: string
) {
  try {
    const admin = createAdminClient()

    const { data, error } = await admin
      .from('admin_activity_logs')
      .select(`
        *,
        profiles!admin_activity_logs_admin_id_fkey(name, email)
      `)
      .eq('resource_type', resourceType)
      .eq('resource_id', resourceId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Failed to fetch resource activity:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error fetching resource activity:', error)
    return []
  }
}
