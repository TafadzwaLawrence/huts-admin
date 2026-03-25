import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outline' | 'subtle' | 'solid'
  size?: 'sm' | 'md' | 'lg'
  icon?: LucideIcon
}

export const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', size = 'md', icon: Icon, children, ...props }, ref) => {
    const variantClasses = {
    default: 'bg-adm-surface-2 text-adm-muted border border-adm-border',
    outline: 'bg-transparent text-adm-text border border-adm-border',
    subtle:  'bg-adm-surface-2 text-adm-text',
    solid:   'bg-adm-text text-adm-bg',
    
    const sizeClasses = {
      sm: 'px-2 py-0.5 text-[10px]',
      md: 'px-2.5 py-1 text-xs',
      lg: 'px-3 py-1.5 text-sm',
    }

    const iconSizes = {
      sm: 10,
      md: 12,
      lg: 14,
    }

    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center gap-1.5 font-semibold uppercase tracking-wider',
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {Icon && <Icon size={iconSizes[size]} />}
        {children}
      </div>
    )
  }
)
Badge.displayName = 'Badge'
