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
    bg: 'bg-[#51CF66]/10',
    text: 'text-[#51CF66]',
    icon: ShieldCheck,
  },
  pending: {
    bg: 'bg-[#212529]/10',
    text: 'text-[#495057]',
    icon: ShieldAlert,
  },
  rejected: {
    bg: 'bg-[#FF6B6B]/10',
    text: 'text-[#FF6B6B]',
    icon: ShieldX,
  },
  active: {
    bg: 'bg-[#51CF66]/10',
    text: 'text-[#51CF66]',
    icon: Check,
  },
  inactive: {
    bg: 'bg-[#E9ECEF]',
    text: 'text-[#ADB5BD]',
    icon: X,
  },
  success: {
    bg: 'bg-[#51CF66]/10',
    text: 'text-[#51CF66]',
    icon: Check,
  },
  warning: {
    bg: 'bg-[#212529]/10',
    text: 'text-[#495057]',
    icon: Clock,
  },
  error: {
    bg: 'bg-[#FF6B6B]/10',
    text: 'text-[#FF6B6B]',
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
