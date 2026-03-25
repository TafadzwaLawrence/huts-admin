'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Users, 
  Building2,
  Home,
  Mail,
  Phone,
  Calendar,
} from 'lucide-react'
import { AdminPageHeader, AdminEmptyState, AdminPagination, BulkActionToolbar, useAdminSelection, AdminExportButton } from '@/components/admin'
import { Badge } from '@/components/ui'
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
  created_at: string | null
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [roleFilter, setRoleFilter] = useState('all')
  
  // Bulk selection state
  const {
    selectedIds,
    selectedCount,
    toggleSelection,
    toggleAll,
    clearSelection,
    isSelected,
    isAllSelected,
    isSomeSelected,
  } = useAdminSelection(users)

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/users?role=${roleFilter}&page=${page}&limit=20`)
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setUsers(data.users)
      setTotalPages(data.totalPages)
      setTotal(data.total)
      clearSelection() // Clear selection when data changes
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setPage(1)
  }, [roleFilter])

  useEffect(() => {
    fetchUsers()
  }, [page, roleFilter])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <AdminPageHeader
        title="Users"
        description={`${total} total users`}
        action={
          <div className="flex items-center gap-3">
            <AdminExportButton type="users" />
            <div className="flex items-center gap-0.5 bg-adm-surface-2 p-0.5 rounded-full border border-adm-border">
              {['all', 'landlord', 'renter'].map((r) => (
                <button
                  key={r}
                  onClick={() => setRoleFilter(r)}
                  className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all ${
                    roleFilter === r
                    ? 'bg-adm-accent text-white shadow-sm'
                    : 'text-adm-muted hover:text-adm-text'
                  }`}
                >
                  {r === 'all' ? 'All' : r.charAt(0).toUpperCase() + r.slice(1) + 's'}
                </button>
              ))}
            </div>
          </div>
        }
      />

      {loading ? (
        <div className="bg-adm-surface rounded-xl border border-adm-border overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-adm-border">
              <div className="w-10 h-10 bg-adm-border rounded-full animate-pulse flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-adm-border rounded animate-pulse w-1/3" />
                <div className="h-3 bg-adm-border rounded animate-pulse w-1/4" />
              </div>
            </div>
          ))}
        </div>
      ) : users.length === 0 ? (
        <AdminEmptyState
          icon={Users}
          title="No users found"
          description={roleFilter !== 'all' ? `No ${roleFilter}s found` : 'No users in the system'}
        />
      ) : (
        <>
          <div className="bg-adm-surface rounded-xl border border-adm-border overflow-hidden">
            {/* Table Header */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 bg-adm-surface-2 text-[10px] font-semibold text-adm-faint uppercase tracking-wider border-b border-adm-border">
              <div className="col-span-1 flex items-center">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={toggleAll}
                  className="w-4 h-4 border-light-gray rounded focus:ring-charcoal cursor-pointer"
                />
              </div>
              <div className="col-span-2">User</div>
              <div className="col-span-3">Contact</div>
              <div className="col-span-2">Role</div>
              <div className="col-span-2">Joined</div>
              <div className="col-span-1">Verified</div>
              <div className="col-span-1">Actions</div>
            </div>

            <div className="divide-y divide-adm-border">
              {users.map((u) => (
                <div key={u.id} className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 items-center px-5 py-3.5 hover:bg-adm-surface-2 transition-colors">
                  {/* Checkbox */}
                  <div className="md:col-span-1 flex items-center">
                    <input
                      type="checkbox"
                      checked={isSelected(u.id)}
                      onChange={() => toggleSelection(u.id)}
                      className="w-4 h-4 border-light-gray rounded focus:ring-charcoal cursor-pointer"
                    />
                  </div>
                  
                  {/* User */}
                  <div className="md:col-span-2 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-adm-surface-2 flex items-center justify-center text-sm font-bold text-adm-muted flex-shrink-0 border border-adm-border">
                      {(u.full_name || u.email || '?')[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-adm-text truncate">{u.full_name || 'No name'}</p>
                      <p className="text-xs text-adm-faint truncate md:hidden">{u.email}</p>
                    </div>
                  </div>

                  {/* Contact */}
                  <div className="md:col-span-3 hidden md:block min-w-0">
                    <p className="text-xs text-adm-muted truncate flex items-center gap-1">
                      <Mail size={ICON_SIZES.xs} className="flex-shrink-0" /> {u.email}
                    </p>
                    {u.phone && (
                      <p className="text-xs text-adm-faint truncate flex items-center gap-1 mt-0.5">
                        <Phone size={ICON_SIZES.xs} className="flex-shrink-0" /> {u.phone}
                      </p>
                    )}
                  </div>

                  {/* Role */}
                  <div className="md:col-span-2">
                    <Badge variant="default" size="sm">
                      {u.role === 'landlord' ? (
                        <><Building2 size={ICON_SIZES.xs} /> Landlord</>
                      ) : (
                        <><Home size={ICON_SIZES.xs} /> Renter</>
                      )}
                    </Badge>
                  </div>

                  {/* Joined */}
                  <div className="md:col-span-2 hidden md:block">
                    <p className="text-xs text-adm-faint flex items-center gap-1">
                      <Calendar size={ICON_SIZES.xs} />
                      {u.created_at 
                        ? new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        : '—'
                      }
                    </p>
                  </div>

                  {/* Verified */}
                  <div className="md:col-span-1 hidden md:block">
                    <span className={`w-2 h-2 rounded-full inline-block ${u.verified ? 'bg-[#51CF66]' : 'bg-[#E9ECEF]'}`} />
                  </div>

                  {/* Actions */}
                  <div className="md:col-span-1">
                    <Link
                      href={`/users/${u.id}`}
                      className="text-xs text-adm-blue hover:text-adm-text font-medium underline"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pagination */}
          <AdminPagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </>
      )}

      {/* Bulk Action Toolbar */}
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
