import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  // Clerk sign-out is handled client-side via <SignOutButton> / useClerk().signOut()
  // This route now just redirects to home; the client triggers Clerk's sign-out.
  return NextResponse.redirect(new URL('/', new URL(request.url).origin))
}
