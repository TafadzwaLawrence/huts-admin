import Link from 'next/link'
import { ShieldX } from 'lucide-react'

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 bg-[#E9ECEF] rounded-2xl flex items-center justify-center mx-auto mb-6">
          <ShieldX size={28} className="text-[#495057]" />
        </div>
        <h1 className="text-2xl font-bold text-[#212529] mb-2">Access Denied</h1>
        <p className="text-sm text-[#495057] mb-8">
          You are not authorised to access the Huts admin panel. If you believe
          this is a mistake, contact the platform owner.
        </p>
        <form action="/api/auth/signout" method="POST">
          <button
            type="submit"
            className="px-5 py-2.5 bg-[#212529] text-white text-sm font-semibold rounded-lg hover:bg-black transition-colors"
          >
            Sign out
          </button>
        </form>
      </div>
    </div>
  )
}
