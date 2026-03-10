import { auth, currentUser } from '@clerk/nextjs/server'

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '')
  .split(',')
  .map(e => e.trim())
  .filter(Boolean)

export async function checkIsAdmin() {
  const { userId, sessionClaims } = await auth()

  if (!userId) {
    return { isAdmin: false, user: null }
  }

  const email: string = (sessionClaims?.email as string) ?? ''
  const isAdmin = ADMIN_EMAILS.length === 0 || ADMIN_EMAILS.includes(email)

  return {
    isAdmin,
    user: { id: userId, email },
  }
}

export async function requireAdmin() {
  const { isAdmin, user } = await checkIsAdmin()

  if (!isAdmin) {
    throw new Error('Unauthorized: Admin access required')
  }

  return { user }
}
