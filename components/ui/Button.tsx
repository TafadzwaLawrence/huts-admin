import { ButtonHTMLAttributes, forwardRef } from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cn } from '@/lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'icon'
  size?: 'sm' | 'md' | 'lg'
  asChild?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', asChild = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    
    const baseClasses = 'btn'
    const variantClasses = {
      primary: 'btn-primary',
      secondary: 'btn-secondary',
      ghost: 'btn-ghost',
      icon: 'btn-icon'
    }
    const sizeClasses = {
      sm: 'px-4 py-1.5 text-xs',
      md: '', // default from .btn
      lg: 'px-8 py-4 text-base'
    }

    return (
      <Comp
        ref={ref}
        className={cn(
          baseClasses,
          variantClasses[variant],
          size !== 'md' && sizeClasses[size],
          className
        )}
        {...props}
      >
        {children}
      </Comp>
    )
  }
)
Button.displayName = 'Button'
