import { currentUser } from '@clerk/nextjs/server'

export class UnauthorizedError extends Error {
  constructor(message = 'Unauthorized: Admin access required') {
    super(message)
    this.name = 'UnauthorizedError'
  }
}

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '')
  .split(',')
  .map(e => e.trim())
  .filter(Boolean)

export async function checkIsAdmin() {
  let clerkUser
  try {
    clerkUser = await currentUser()
  } catch (err) {
    console.error('[checkIsAdmin] currentUser() threw:', err)
    return { isAdmin: false, user: null }
  }

  if (!clerkUser) {
    return { isAdmin: false, user: null }
  }

  const email = clerkUser.emailAddresses[0]?.emailAddress ?? ''
  const isAdmin = ADMIN_EMAILS.length === 0 || ADMIN_EMAILS.includes(email)

  return {
    isAdmin,
    user: { id: clerkUser.id, email },
  }
}

export async function requireAdmin() {
  const { isAdmin, user } = await checkIsAdmin()

  if (!isAdmin || !user) {
    throw new UnauthorizedError()
  }

  return { user }
}
