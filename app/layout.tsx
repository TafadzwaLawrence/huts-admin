import type { Metadata } from 'next'
import './globals.css'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { LucideIcon } from 'lucide-react'
import {
  LayoutDashboard,
  Building2,
  Users,
  ShieldCheck,
  ChevronRight,
  Briefcase,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Huts Admin',
  description: 'Huts platform administration',
  robots: { index: false, follow: false },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Auth is enforced by middleware — layout reads current user for display only
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <html lang="en">
      <body className="min-h-screen bg-[#F9FAFB] antialiased">
        {/* Top Bar */}
        <div className="bg-[#212529] text-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14">
              <div className="flex items-center gap-3">
                <span className="text-sm font-extrabold tracking-[3px] text-white/60">
                  HUTS
                </span>
                <ChevronRight size={14} className="text-white/20" />
                <span className="text-sm font-semibold">Admin</span>
                <span className="ml-2 px-2 py-0.5 bg-white/10 rounded text-[10px] font-bold uppercase tracking-wider">
                  Admin Panel
                </span>
              </div>
              <div className="flex items-center gap-4">
                {user && (
                  <span className="text-xs text-white/40">{user.email}</span>
                )}
                <form action="/api/auth/signout" method="POST">
                  <button
                    type="submit"
                    className="text-xs text-white/60 hover:text-white transition-colors"
                  >
                    Sign out
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="bg-white border-b border-[#E9ECEF]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center gap-1 -mb-px">
              <AdminNavLink href="/" icon={LayoutDashboard} label="Overview" />
              <AdminNavLink href="/verification" icon={ShieldCheck} label="Verification" />
              <AdminNavLink href="/properties" icon={Building2} label="Properties" />
              <AdminNavLink href="/users" icon={Users} label="Users" />
              <AdminNavLink href="/agents" icon={Briefcase} label="Agents" />
            </nav>
          </div>
        </div>

        {/* Content */}
        {children}
      </body>
    </html>
  )
}

function AdminNavLink({
  href,
  icon: Icon,
  label,
}: {
  href: string
  icon: LucideIcon
  label: string
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-[#495057] hover:text-[#212529] border-b-2 border-transparent hover:border-[#212529] transition-all"
    >
      <Icon size={15} />
      {label}
    </Link>
  )
}
