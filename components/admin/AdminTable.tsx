'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from 'lucide-react'

export interface AdminTableColumn<T> {
  key: string
  label: string
  render?: (item: T) => React.ReactNode
  sortable?: boolean
  className?: string
}

interface AdminTableProps<T> {
  columns: AdminTableColumn<T>[]
  data: T[]
  keyExtractor: (item: T) => string
  loading?: boolean
  emptyState?: React.ReactNode
  pagination?: {
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
  }
  sortable?: boolean
  onSort?: (key: string, direction: 'asc' | 'desc') => void
}

export function AdminTable<T extends Record<string, any>>({
  columns,
  data,
  keyExtractor,
  loading,
  emptyState,
  pagination,
  sortable = false,
  onSort,
}: AdminTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  const handleSort = (key: string) => {
    if (!sortable && !onSort) return
    
    const newDirection = sortKey === key && sortDirection === 'asc' ? 'desc' : 'asc'
    setSortKey(key)
    setSortDirection(newDirection)
    
    if (onSort) {
      onSort(key, newDirection)
    }
  }

  if (loading) {
    return (
      <div className="bg-adm-surface rounded-xl border border-adm-border overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-adm-border">
            <div className="w-12 h-12 bg-adm-surface-2 rounded-lg animate-pulse flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-adm-surface-2 rounded animate-pulse w-1/2" />
              <div className="h-3 bg-adm-surface-2 rounded animate-pulse w-1/3" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (data.length === 0 && emptyState) {
    return <>{emptyState}</>
  }

  return (
    <div className="space-y-4">
      <div className="bg-adm-surface rounded-xl border border-adm-border overflow-hidden">
        {/* Table Header */}
        <div className="hidden md:grid gap-4 px-5 py-3 bg-adm-surface-2 text-[10px] font-semibold text-adm-faint uppercase tracking-wider border-b border-adm-border"
          style={{ gridTemplateColumns: columns.map(col => col.className || 'auto').join(' ') }}
        >
          {columns.map((column) => (
            <div 
              key={column.key}
              className={`flex items-center gap-1 ${column.sortable || (sortable && onSort) ? 'cursor-pointer hover:text-adm-muted' : ''}`}
              onClick={() => (column.sortable || (sortable && onSort)) && handleSort(column.key)}
            >
              {column.label}
              {(column.sortable || (sortable && onSort)) && sortKey === column.key && (
                sortDirection === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
              )}
            </div>
          ))}
        </div>

        {/* Table Body */}
        <div className="divide-y divide-adm-border">
          {data.map((item) => (
            <div 
              key={keyExtractor(item)}
              className="grid gap-2 md:gap-4 items-center px-5 py-3.5 hover:bg-adm-surface-2 transition-colors"
              style={{ gridTemplateColumns: columns.map(col => col.className || 'auto').join(' ') }}
            >
              {columns.map((column) => (
                <div key={column.key} className={column.className}>
                  {column.render ? column.render(item) : item[column.key]}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => pagination.onPageChange(Math.max(1, pagination.currentPage - 1))}
            disabled={pagination.currentPage === 1}
            className="p-2 rounded-lg border border-adm-border text-adm-muted hover:border-adm-faint hover:text-adm-text disabled:opacity-30 transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm text-adm-muted px-3">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          <button
            onClick={() => pagination.onPageChange(Math.min(pagination.totalPages, pagination.currentPage + 1))}
            disabled={pagination.currentPage === pagination.totalPages}
            className="p-2 rounded-lg border border-adm-border text-adm-muted hover:border-adm-faint hover:text-adm-text disabled:opacity-30 transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  )
}
