'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import {
  Users, Building2, Home, Mail, Phone, Calendar,
  MapPin, Eye, CheckCircle, XCircle, Trash2, Loader2,
  Search, ShieldCheck, Briefcase, ShieldAlert,
} from 'lucide-react'
import { AdminPageHeader, AdminEmptyState, AdminPagination, AdminStatCard, BulkActionToolbar, useAdminSelection, AdminExportButton } from '@/components/admin'
import { ICON_SIZES } from '@/lib/constants'

interface User {
  id: string
  full_name: string | null
  email: string
  phone: string | null
  role: string
  avatar_url: string | null
  verified: boolean | null
  bio: string | null
  city: string | null
  created_at: string | null
}

interface Stats {
  total: number
  landlords: number
  renters: number
  verified: number
  newThisMonth: number
}

const ROLE_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'landlord', label: 'Landlords' },
  { value: 'renter', label: 'Renters' },
  { value: 'agent', label: 'Agents' },
  { value: 'admin', label: 'Admins' },
]

const VERIFIED_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'true', label: 'Verified' },
  { value: 'false', label: 'Unverified' },
]

const ROLE_ICON: Record<string, React.ReactNode> = {
  landlord: <Building2 size={ICON_SIZES.xs} />,
  renter: <Home size={ICON_SIZES.xs} />,
  agent: <Briefcase size={ICON_SIZES.xs} />,
  admin: <ShieldAlert size={ICON_SIZES.xs} />,
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [stats, setStats] = useState<Stats>({ total: 0, landlords: 0, renters: 0, verified: 0, newThisMonth: 0 })
  const [propertyCounts, setPropertyCounts] = useState<Record<string, number>>({})
  const [roleFilter, setRoleFilter] = useState('all')
  const [verifiedFilter, setVerifiedFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [actionLoading, setActionLoading] = useState<Record<string, 'verify' | 'delete'>>({})
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { selectedIds, selectedCount, toggleSelection, toggleAll, clearSelection, isSelected, isAllSelected } = useAdminSelection(users)

  // Debounce search input
  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current)
    searchTimeout.current = setTimeout(() => {
      setDebouncedSearch(searchTerm)
      setPage(1)
    }, 300)
    return () => { if (searchTimeout.current) clearTimeout(searchTimeout.current) }
  }, [searchTerm])

  useEffect(() => { setPage(1) }, [roleFilter, verifiedFilter])

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ role: roleFilter, page: String(page), limit: '20' })
      if (debouncedSearch) params.set('search', debouncedSearch)
      if (verifiedFilter !== 'all') params.set('verified', verifiedFilter)
      const res = await fetch(`/api/users?${params}`)
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setUsers(data.users)
      setTotalPages(data.totalPages)
      setTotal(data.total)
      setPropertyCounts(data.propertyCounts || {})
      if (data.stats) setStats(data.stats)
      clearSelection()
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }, [page, roleFilter, verifiedFilter, debouncedSearch])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  const handleVerify = async (u: User) => {
    setActionLoading(prev => ({ ...prev, [u.id]: 'verify' }))
    const newVal = !u.verified
    setUsers(prev => prev.map(x => x.id === u.id ? { ...x, verified: newVal } : x))
    try {
      const res = await fetch(`/api/users/${u.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verified: newVal }),
      })
      if (!res.ok) throw new Error('Failed')
      setStats(prev => ({ ...prev, verified: prev.verified + (newVal ? 1 : -1) }))
    } catch {
      setUsers(prev => prev.map(x => x.id === u.id ? { ...x, verified: !newVal } : x))
    } finally {
      setActionLoading(prev => { const n = { ...prev }; delete n[u.id]; return n })
    }
  }

  const handleDelete = async (u: User) => {
    if (!window.confirm(`Delete ${u.full_name || u.email}? This cannot be undone.`)) return
    setActionLoading(prev => ({ ...prev, [u.id]: 'delete' }))
    try {
      const res = await fetch(`/api/users/${u.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed')
      setUsers(prev => prev.filter(x => x.id !== u.id))
      setTotal(prev => prev - 1)
      setStats(prev => ({ ...prev, total: prev.total - 1 }))
    } catch {
      alert('Failed to delete user. Please try again.')
    } finally {
      setActionLoading(prev => { const n = { ...prev }; delete n[u.id]; return n })
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <AdminPageHeader
        title="Users"
        description={`${total} total users`}
        action={<AdminExportButton type="users" />}
      />

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <AdminStatCard label="Total Users" value={stats.total} icon={Users} />
        <AdminStatCard label="Landlords" value={stats.landlords} icon={Building2} />
        <AdminStatCard label="Renters" value={stats.renters} icon={Home} />
        <AdminStatCard label="Verified" value={stats.verified} icon={ShieldCheck} />
      </div>

      {/* Search + Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search size={ICON_SIZES.sm} className="absolute left-3 top-1/2 -translate-y-1/2 text-adm-faint pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name or email…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-adm-surface border border-adm-border text-adm-text placeholder:text-adm-faint focus:outline-none focus:border-adm-accent"
          />
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          {/* Role filter */}
          <div className="flex items-center gap-0.5 bg-adm-surface-2 p-0.5 border border-adm-border">
            {ROLE_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setRoleFilter(f.value)}
                className={`px-3 py-1.5 text-xs font-semibold transition-all ${
                  roleFilter === f.value ? 'bg-adm-accent text-white' : 'text-adm-muted hover:text-adm-text'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Verified filter */}
          <div className="flex items-center gap-0.5 bg-adm-surface-2 p-0.5 border border-adm-border">
            {VERIFIED_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setVerifiedFilter(f.value)}
                className={`px-3 py-1.5 text-xs font-semibold transition-all ${
                  verifiedFilter === f.value ? 'bg-adm-accent text-white' : 'text-adm-muted hover:text-adm-text'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="bg-adm-surface border border-adm-border overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-adm-border">
              <div className="w-9 h-9 bg-adm-border animate-pulse flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-adm-border animate-pulse w-1/3" />
                <div className="h-3 bg-adm-border animate-pulse w-1/4" />
              </div>
              <div className="hidden md:flex gap-2">
                <div className="h-3 bg-adm-border animate-pulse w-20" />
                <div className="h-3 bg-adm-border animate-pulse w-16" />
              </div>
            </div>
          ))}
        </div>
      ) : users.length === 0 ? (
        <AdminEmptyState
          icon={Users}
          title="No users found"
          description={debouncedSearch ? `No results for "${debouncedSearch}"` : roleFilter !== 'all' ? `No ${roleFilter}s found` : 'No users in the system'}
        />
      ) : (
        <>
          <div className="bg-adm-surface border border-adm-border overflow-hidden">
            {/* Table Header */}
            <div className="hidden md:grid grid-cols-12 gap-3 px-5 py-3 bg-adm-surface-2 text-[10px] font-semibold text-adm-faint uppercase tracking-wider border-b border-adm-border">
              <div className="col-span-1 flex items-center">
                <input type="checkbox" checked={isAllSelected} onChange={toggleAll} className="w-4 h-4 cursor-pointer" />
              </div>
              <div className="col-span-2">User</div>
              <div className="col-span-3">Contact</div>
              <div className="col-span-1">Role</div>
              <div className="col-span-1">Listings</div>
              <div className="col-span-2">Joined</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-1">Actions</div>
            </div>

            <div className="divide-y divide-adm-border">
              {users.map((u) => (
                <div key={u.id} className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-3 items-center px-5 py-3.5 hover:bg-adm-surface-2 transition-colors">
                  {/* Checkbox */}
                  <div className="hidden md:flex md:col-span-1 items-center">
                    <input type="checkbox" checked={isSelected(u.id)} onChange={() => toggleSelection(u.id)} className="w-4 h-4 cursor-pointer" />
                  </div>

                  {/* User */}
                  <div className="md:col-span-2 flex items-center gap-2.5">
                    <div className="w-9 h-9 bg-adm-surface-2 flex items-center justify-center text-sm font-bold text-adm-muted flex-shrink-0 border border-adm-border">
                      {(u.full_name || u.email || '?')[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-adm-text truncate">{u.full_name || 'No name'}</p>
                      <p className="text-[11px] text-adm-faint font-mono truncate">{u.id.slice(0, 8)}…</p>
                    </div>
                  </div>

                  {/* Contact */}
                  <div className="md:col-span-3 min-w-0 space-y-0.5">
                    <p className="text-xs text-adm-muted truncate flex items-center gap-1">
                      <Mail size={ICON_SIZES.xs} className="flex-shrink-0 text-adm-faint" /> {u.email}
                    </p>
                    {u.phone && (
                      <p className="text-xs text-adm-faint truncate flex items-center gap-1">
                        <Phone size={ICON_SIZES.xs} className="flex-shrink-0" /> {u.phone}
                      </p>
                    )}
                    {u.city && (
                      <p className="text-xs text-adm-faint truncate flex items-center gap-1">
                        <MapPin size={ICON_SIZES.xs} className="flex-shrink-0" /> {u.city}
                      </p>
                    )}
                  </div>

                  {/* Role */}
                  <div className="md:col-span-1">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium border border-adm-border text-adm-muted">
                      {ROLE_ICON[u.role] ?? <Users size={ICON_SIZES.xs} />}
                      <span className="capitalize hidden lg:inline">{u.role}</span>
                    </span>
                  </div>

                  {/* Listings */}
                  <div className="hidden md:flex md:col-span-1 items-center">
                    <span className="text-sm font-semibold text-adm-muted tabular-nums">
                      {propertyCounts[u.id] || 0}
                    </span>
                  </div>

                  {/* Joined */}
                  <div className="hidden md:flex md:col-span-2 items-center">
                    <p className="text-xs text-adm-faint flex items-center gap-1">
                      <Calendar size={ICON_SIZES.xs} className="flex-shrink-0" />
                      {u.created_at
                        ? new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                        : '—'}
                    </p>
                  </div>

                  {/* Status badge */}
                  <div className="hidden md:flex md:col-span-1 items-center">
                    {u.verified ? (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-semibold bg-adm-green/10 text-adm-green border border-adm-green/20">
                        <CheckCircle size={10} /> Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-semibold bg-adm-faint/10 text-adm-faint border border-adm-faint/20">
                        <XCircle size={10} /> Pending
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="md:col-span-1 flex items-center gap-0.5">
                    <Link
                      href={`/users/${u.id}`}
                      className="p-1.5 text-adm-muted hover:text-adm-text hover:bg-adm-surface-2 transition-colors"
                      title="View profile"
                    >
                      <Eye size={ICON_SIZES.sm} />
                    </Link>

                    <button
                      onClick={() => handleVerify(u)}
                      disabled={!!actionLoading[u.id]}
                      title={u.verified ? 'Mark unverified' : 'Mark verified'}
                      className={`p-1.5 transition-colors disabled:opacity-40 ${
                        u.verified
                          ? 'text-adm-green hover:text-adm-amber hover:bg-adm-amber/10'
                          : 'text-adm-faint hover:text-adm-green hover:bg-adm-green/10'
                      }`}
                    >
                      {actionLoading[u.id] === 'verify' ? (
                        <Loader2 size={ICON_SIZES.sm} className="animate-spin" />
                      ) : u.verified ? (
                        <CheckCircle size={ICON_SIZES.sm} />
                      ) : (
                        <XCircle size={ICON_SIZES.sm} />
                      )}
                    </button>

                    <button
                      onClick={() => handleDelete(u)}
                      disabled={!!actionLoading[u.id]}
                      title="Delete user"
                      className="p-1.5 text-adm-faint hover:text-adm-red hover:bg-adm-red/10 transition-colors disabled:opacity-40"
                    >
                      {actionLoading[u.id] === 'delete' ? (
                        <Loader2 size={ICON_SIZES.sm} className="animate-spin" />
                      ) : (
                        <Trash2 size={ICON_SIZES.sm} />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <AdminPagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}

      <BulkActionToolbar
        selectedCount={selectedCount}
        resourceType="user"
        selectedIds={selectedIds}
        onActionComplete={fetchUsers}
        onClearSelection={clearSelection}
      />
    </div>
  )
}
