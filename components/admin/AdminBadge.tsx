import { ShieldCheck, ShieldAlert, ShieldX, Check, X, Clock } from 'lucide-react'

type BadgeVariant = 'approved' | 'pending' | 'rejected' | 'active' | 'inactive' | 'success' | 'warning' | 'error'

interface AdminBadgeProps {
  variant: BadgeVariant
  label?: string
  showIcon?: boolean
  size?: 'sm' | 'md'
}

const badgeConfig: Record<BadgeVariant, {
  bg: string
  text: string
  icon: typeof ShieldCheck
}> = {
  approved: {
    bg: 'bg-adm-green/10',
    text: 'text-adm-green',
    icon: ShieldCheck,
  },
  pending: {
    bg: 'bg-adm-amber/10',
    text: 'text-adm-amber',
    icon: ShieldAlert,
  },
  rejected: {
    bg: 'bg-adm-red/10',
    text: 'text-adm-red',
    icon: ShieldX,
  },
  active: {
    bg: 'bg-adm-green/10',
    text: 'text-adm-green',
    icon: Check,
  },
  inactive: {
    bg: 'bg-adm-surface-2',
    text: 'text-adm-faint',
    icon: X,
  },
  success: {
    bg: 'bg-adm-green/10',
    text: 'text-adm-green',
    icon: Check,
  },
  warning: {
    bg: 'bg-adm-amber/10',
    text: 'text-adm-amber',
    icon: Clock,
  },
  error: {
    bg: 'bg-adm-red/10',
    text: 'text-adm-red',
    icon: X,
  },
}

export function AdminBadge({ 
  variant, 
  label, 
  showIcon = true,
  size = 'md' 
}: AdminBadgeProps) {
  const config = badgeConfig[variant]
  const Icon = config.icon
  const displayLabel = label || variant.charAt(0).toUpperCase() + variant.slice(1)
  
  const sizeClasses = size === 'sm' 
    ? 'px-2 py-0.5 text-[10px] gap-1' 
    : 'px-2.5 py-1 text-xs gap-1.5'
  
  const iconSize = size === 'sm' ? 11 : 13

  return (
    <span 
      className={`inline-flex items-center ${sizeClasses} rounded-full font-semibold ${config.bg} ${config.text}`}
    >
      {showIcon && <Icon size={iconSize} />}
      {displayLabel}
    </span>
  )
}
