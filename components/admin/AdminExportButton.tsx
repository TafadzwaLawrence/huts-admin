'use client'

import { Download } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

interface AdminExportButtonProps {
  type: 'properties' | 'users'
  label?: string
}

export function AdminExportButton({ type, label }: AdminExportButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleExport = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/export?type=${type}&format=csv`)

      if (!response.ok) {
        throw new Error('Export failed')
      }

      // Create download link
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${type}_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} exported successfully`)
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Export failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-[#E9ECEF] rounded-lg hover:bg-[#F8F9FA] transition-colors disabled:opacity-50"
    >
      <Download size={14} />
      {loading ? 'Exporting...' : label || 'Export CSV'}
    </button>
  )
}
