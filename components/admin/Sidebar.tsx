'use client'

import { usePathname } from 'next/navigation'
import { useClerk } from '@clerk/nextjs'
import Link from 'next/link'
import { useState } from 'react'
import {
  LayoutDashboard, Building2, Users, ShieldCheck, Briefcase,
  Menu, X, LogOut,
} from 'lucide-react'
import { HutsLogo } from '@/components/HutsLogo'

const NAV = [
  { href: '/',             icon: LayoutDashboard, label: 'Overview'     },
  { href: '/verification', icon: ShieldCheck,     label: 'Verification' },
  { href: '/properties',   icon: Building2,       label: 'Properties'   },
  { href: '/users',        icon: Users,           label: 'Users'        },
  { href: '/agents',       icon: Briefcase,       label: 'Agents'       },
]

interface SidebarProps {
  user: { email?: string | null } | null
  pendingCount: number
}

export function Sidebar({ user, pendingCount }: SidebarProps) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const { signOut } = useClerk()

  const navContent = (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 h-[60px] border-b border-adm-border flex-shrink-0">
        <HutsLogo size={36} />
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-2.5 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
          const hasBadge = href === '/verification' && pendingCount > 0
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={`group flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-all ${
                active
                  ? 'bg-adm-accent/15 text-adm-accent'
                  : 'text-adm-muted hover:text-adm-text hover:bg-adm-surface-2'
              }`}
            >
              <Icon
                size={16}
                className={active ? 'text-adm-accent' : 'text-adm-faint group-hover:text-adm-muted transition-colors'}
              />
              <span className="flex-1">{label}</span>
              {hasBadge && (
                <span className="px-1.5 py-0.5 bg-adm-amber/20 text-adm-amber text-[10px] font-bold">
                  {pendingCount}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* User + Sign out */}
      <div className="px-2.5 py-4 border-t border-adm-border space-y-0.5 flex-shrink-0">
        {user && (
          <div className="flex items-center gap-2.5 px-3 py-2 mb-1">
            <div className="w-7 h-7 bg-adm-accent/20 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-adm-accent">
                {(user.email ?? '?')[0].toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-adm-muted truncate">{user.email ?? ''}</p>
          </div>
        )}
        <button
            type="button"
            onClick={() => signOut({ redirectUrl: '/' })}
            className="flex w-full items-center gap-3 px-3 py-2.5 text-sm font-medium text-adm-muted hover:text-adm-red hover:bg-adm-red/5 transition-all"
          >
            <LogOut size={15} />
            Sign out
          </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 w-60 bg-adm-surface border-r border-adm-border z-30">
        {navContent}
      </aside>

      {/* Mobile top bar */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-30 h-14 bg-adm-surface border-b border-adm-border flex items-center justify-between px-4">
        <div className="flex items-center gap-2.5">
          <HutsLogo size={28} />
          {pendingCount > 0 && (
            <span className="ml-1 px-1.5 py-0.5 bg-adm-amber/20 text-adm-amber text-[10px] font-bold">
              {pendingCount}
            </span>
          )}
        </div>
        <button
          onClick={() => setOpen(!open)}
          className="p-1.5 text-adm-muted hover:text-adm-text transition-colors hover:bg-adm-surface-2"
          aria-label="Toggle menu"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* Mobile drawer backdrop */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`lg:hidden fixed left-0 top-0 bottom-0 z-50 w-60 bg-adm-surface border-r border-adm-border transition-transform duration-300 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {navContent}
      </aside>
    </>
  )
}
