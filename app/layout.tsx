import type { Metadata, Viewport } from 'next'
import './globals.css'
import { ClerkShell } from './clerk-shell'
import { currentUser } from '@clerk/nextjs/server'
import { createAdminClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/admin/Sidebar'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: { default: 'Huts Admin', template: '%s | Huts Admin' },
  description: 'Huts platform administration',
  robots: { index: false, follow: false },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Huts Admin',
  },
}

export const viewport: Viewport = {
  themeColor: '#0D1117',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const clerkUser = await currentUser()
  const email = clerkUser?.emailAddresses[0]?.emailAddress ?? null

  const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim())
    .filter(Boolean)

  if (clerkUser && ADMIN_EMAILS.length > 0 && email && !ADMIN_EMAILS.includes(email)) {
    redirect('/unauthorized')
  }

  const user = clerkUser ? { email } : null

  let pendingCount = 0
  if (user && process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL) {
    try {
      const admin = createAdminClient()
      const { count } = await admin
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .eq('verification_status', 'pending')
      pendingCount = count ?? 0
    } catch {}
  }

  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `if ('serviceWorker' in navigator) { navigator.serviceWorker.register('/sw.js').catch(console.error) }`,
          }}
        />
      </head>
      <body className="bg-adm-bg text-adm-text antialiased" suppressHydrationWarning>
        <ClerkShell>
          {user ? (
            <>
              <Sidebar user={user} pendingCount={pendingCount} />
              <main className="lg:pl-60 pt-14 lg:pt-0 min-h-screen">
                <div className="p-4 sm:p-6 lg:p-8">
                  {children}
                </div>
              </main>
            </>
          ) : (
            children
          )}
        </ClerkShell>
      </body>
    </html>
  )
}
