import Link from 'next/link'
import { ShieldX } from 'lucide-react'

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-adm-bg flex items-center justify-center px-4">
      <div className="text-center max-w-sm animate-fadeIn">
        <div className="w-16 h-16 bg-adm-red/10 border border-adm-red/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <ShieldX size={28} className="text-adm-red" />
        </div>
        <h1 className="text-2xl font-bold text-adm-text mb-2">Access Denied</h1>
        <p className="text-sm text-adm-muted mb-8">
          You are not authorised to access the Huts admin panel. If you believe
          this is a mistake, contact the platform owner.
        </p>
        <form action="/api/auth/signout" method="POST">
          <button
            type="submit"
            className="px-5 py-2.5 bg-adm-surface border border-adm-border text-adm-text text-sm font-semibold rounded-xl hover:bg-adm-surface-2 transition-colors"
          >
            Sign out
          </button>
        </form>
      </div>
    </div>
  )
}

