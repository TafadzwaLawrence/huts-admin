import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'interactive'
  padding?: 'compact' | 'standard' | 'feature'
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', padding = 'standard', children, ...props }, ref) => {
    const variantClasses = {
      default: 'bg-white border border-[#E9ECEF] rounded-xl',
      elevated: 'bg-white border border-[#E9ECEF] rounded-xl shadow-lg',
      interactive: 'property-card', // Uses defined .property-card from globals.css
    }
    
    const paddingClasses = {
      compact: 'p-4',
      standard: 'p-6',
      feature: 'p-8',
    }

    return (
      <div
        ref={ref}
        className={cn(variantClasses[variant], paddingClasses[padding], className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)
Card.displayName = 'Card'

export const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('mb-4', className)} {...props} />
  )
)
CardHeader.displayName = 'CardHeader'

export const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('', className)} {...props} />
  )
)
CardContent.displayName = 'CardContent'

export const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('mt-4 pt-4 border-t border-[#E9ECEF]', className)} {...props} />
  )
)
CardFooter.displayName = 'CardFooter'
