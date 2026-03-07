import { createClient } from '@/lib/supabase/server'

/**
 * Admin emails whitelist.
 * This is a fallback/emergency access method.
 * Primary admin access should be via is_admin flag in the database.
 */
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || 'chitangalawrence03@gmail.com')
  .split(',')
  .map(e => e.trim())

/**
 * Check if the current user is an admin.
 * 
 * Checks both:
 * 1. is_admin flag in the profiles table (primary method)
 * 2. Email whitelist from ADMIN_EMAILS env var (fallback/emergency access)
 * 
 * @returns Object with isAdmin boolean and user data
 */
export async function checkIsAdmin() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { isAdmin: false, user: null, profile: null }
  }

  // Check if user has is_admin flag in profiles table
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin, role, name, email')
    .eq('id', user.id)
    .single()

  // User is admin if:
  // 1. They have is_admin flag set to true in profiles table, OR
  // 2. Their email is in the ADMIN_EMAILS whitelist (fallback)
  const isAdmin = profile?.is_admin === true || ADMIN_EMAILS.includes(user.email || '')

  return {
    isAdmin,
    user,
    profile,
  }
}

/**
 * Require admin access. Throws error if user is not admin.
 * Use this in API routes and server actions.
 */
export async function requireAdmin() {
  const { isAdmin, user, profile } = await checkIsAdmin()

  if (!isAdmin) {
    throw new Error('Unauthorized: Admin access required')
  }

  return { user, profile }
}
