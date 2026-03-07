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
      default: 'bg-[#F8F9FA] text-[#495057] border border-[#E9ECEF]',
      outline: 'bg-transparent text-[#212529] border-2 border-[#212529]',
      subtle: 'bg-[#F8F9FA] text-[#212529]',
      solid: 'bg-[#212529] text-white',
    }
    
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
          'inline-flex items-center gap-1.5 rounded-full font-semibold uppercase tracking-wider',
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
