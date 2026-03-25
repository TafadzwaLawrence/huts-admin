import { clerkMiddleware } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const PUBLIC_PATHS = ['/login', '/unauthorized', '/api/auth']

export default clerkMiddleware(async (auth, req) => {
  const path = req.nextUrl.pathname
  const isPublic = PUBLIC_PATHS.some((p) => path.startsWith(p))

  if (!isPublic) {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
