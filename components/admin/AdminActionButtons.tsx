import { Check, X, Edit, Trash2, Loader2, type LucideIcon } from 'lucide-react'

interface ActionButtonProps {
  onClick?: () => void
  loading?: boolean
  disabled?: boolean
  children: React.ReactNode
  variant?: 'primary' | 'danger' | 'secondary'
  icon?: LucideIcon
  className?: string
}

export function AdminActionButton({ 
  onClick, 
  loading, 
  disabled,
  children, 
  variant = 'primary',
  icon: Icon,
  className = ''
}: ActionButtonProps) {
  const variants = {
    primary: 'bg-adm-accent text-white hover:bg-adm-accent/80',
    danger: 'border border-adm-red/40 text-adm-red hover:bg-adm-red/10',
    secondary: 'border border-adm-border text-adm-muted hover:border-adm-faint hover:text-adm-text',
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg disabled:opacity-50 transition-colors ${variants[variant]} ${className}`}
    >
      {loading ? (
        <Loader2 size={14} className="animate-spin" />
      ) : Icon ? (
        <Icon size={14} />
      ) : null}
      {children}
    </button>
  )
}

interface ApproveRejectButtonsProps {
  onApprove: () => void
  onReject: () => void
  loading?: boolean
  approveLabel?: string
  rejectLabel?: string
}

export function ApproveRejectButtons({
  onApprove,
  onReject,
  loading,
  approveLabel = 'Approve',
  rejectLabel = 'Reject',
}: ApproveRejectButtonsProps) {
  return (
    <div className="flex items-center gap-2">
      <AdminActionButton
        onClick={onApprove}
        loading={loading}
        variant="primary"
        icon={Check}
      >
        {approveLabel}
      </AdminActionButton>
      <AdminActionButton
        onClick={onReject}
        loading={loading}
        variant="danger"
        icon={X}
      >
        {rejectLabel}
      </AdminActionButton>
    </div>
  )
}

export const AdminActionButtons = {
  Button: AdminActionButton,
  ApproveReject: ApproveRejectButtons,
}
