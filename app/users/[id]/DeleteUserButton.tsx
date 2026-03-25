'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function DeleteUserButton({ userId }: { userId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!confirm('Are you absolutely sure? This cannot be undone.')) return
    setLoading(true)
    try {
      const res = await fetch(`/api/users/${userId}`, { method: 'DELETE' })
      if (res.ok) {
        router.push('/users')
        router.refresh()
      } else {
        const { error } = await res.json().catch(() => ({ error: 'Unknown error' }))
        alert(`Delete failed: ${error}`)
        setLoading(false)
      }
    } catch {
      alert('Network error — please try again.')
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      className="px-4 py-2 text-sm bg-adm-red text-white hover:bg-adm-red/80 transition-colors disabled:opacity-50"
    >
      {loading ? 'Deleting…' : 'Delete User'}
    </button>
  )
}
