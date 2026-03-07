'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AdminActionButtons, AdminBadge } from '@/components/admin'
import { Shield, Mail, User, Calendar } from 'lucide-react'
import { toast } from 'sonner'

interface User {
  id: string
  name: string | null
  email: string
  role: 'landlord' | 'renter'
  verified: boolean
  is_admin: boolean
  created_at: string
}

interface EditUserFormProps {
  user: User
}

export default function EditUserForm({ user }: EditUserFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: user.name || '',
    role: user.role,
    verified: user.verified,
    is_admin: user.is_admin,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update user')
      }

      toast.success('User updated successfully')
      router.push('/users')
      router.refresh()
    } catch (error) {
      console.error('Update error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update user')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.push('/users')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* User Metadata */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-off-white rounded-lg">
        <div className="flex items-center gap-2 text-sm">
          <Mail size={16} className="text-dark-gray" />
          <span className="text-dark-gray">Email:</span>
          <span className="font-medium text-charcoal">{user.email}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Calendar size={16} className="text-dark-gray" />
          <span className="text-dark-gray">Joined:</span>
          <span className="font-medium text-charcoal">
            {new Date(user.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Name Field */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-charcoal mb-2">
          <div className="flex items-center gap-2">
            <User size={16} />
            Name
          </div>
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-4 py-2 border border-light-gray rounded-lg focus:outline-none focus:border-charcoal"
          placeholder="User's full name"
        />
      </div>

      {/* Role Field */}
      <div>
        <label htmlFor="role" className="block text-sm font-medium text-charcoal mb-2">
          User Role
        </label>
        <select
          id="role"
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value as 'landlord' | 'renter' })}
          className="w-full px-4 py-2 border border-light-gray rounded-lg focus:outline-none focus:border-charcoal"
        >
          <option value="landlord">Landlord</option>
          <option value="renter">Renter</option>
        </select>
        <p className="text-xs text-dark-gray mt-2">
          Landlords can list properties, renters can search and inquire
        </p>
      </div>

      {/* Verified Checkbox */}
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          id="verified"
          checked={formData.verified}
          onChange={(e) => setFormData({ ...formData, verified: e.target.checked })}
          className="mt-1 h-4 w-4 border-light-gray rounded focus:ring-charcoal"
        />
        <div>
          <label htmlFor="verified" className="text-sm font-medium text-charcoal cursor-pointer">
            Verified User
          </label>
          <p className="text-xs text-dark-gray mt-1">
            Verified users have confirmed their email address
          </p>
        </div>
      </div>

      {/* Admin Checkbox */}
      <div className="flex items-start gap-3 p-4 bg-[#F8F9FA] border border-[#E9ECEF] rounded-lg">
        <input
          type="checkbox"
          id="is_admin"
          checked={formData.is_admin}
          onChange={(e) => setFormData({ ...formData, is_admin: e.target.checked })}
          className="mt-1 h-4 w-4 border-amber-300 rounded focus:ring-amber-500"
        />
        <div className="flex-1">
          <label htmlFor="is_admin" className="text-sm font-medium text-[#495057] cursor-pointer flex items-center gap-2">
            <Shield size={16} />
            Admin Access
          </label>
          <p className="text-xs text-[#495057] mt-1">
            Admin users have full access to the admin panel and can manage all users and properties
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 pt-4 border-t border-light-gray">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg bg-[#212529] text-white hover:bg-black disabled:opacity-50 transition-colors"
        >
          {loading && <span className="animate-spin">⏳</span>}
          Save Changes
        </button>
        <AdminActionButtons.Button
          onClick={handleCancel}
          disabled={loading}
          variant="secondary"
        >
          Cancel
        </AdminActionButtons.Button>
      </div>
    </form>
  )
}
