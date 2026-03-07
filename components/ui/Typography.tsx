import { HTMLAttributes, forwardRef, ElementType } from 'react'
import { cn } from '@/lib/utils'

type TypographyVariant = 
  | 'hero' 
  | 'page-title' 
  | 'section-title' 
  | 'subsection-title'
  | 'card-title'
  | 'card-title-sm'
  | 'label'
  | 'body'
  | 'body-lg'
  | 'secondary'
  | 'small'

interface TypographyProps extends HTMLAttributes<HTMLElement> {
  variant: TypographyVariant
  as?: ElementType
}

export const Typography = forwardRef<HTMLElement, TypographyProps>(
  ({ variant, as, className, children, ...props }, ref) => {
    const Component = as || getDefaultElement(variant)
    const variantClass = `text-${variant}`

    return (
      <Component
        ref={ref}
        className={cn(variantClass, className)}
        {...props}
      >
        {children}
      </Component>
    )
  }
)
Typography.displayName = 'Typography'

function getDefaultElement(variant: TypographyVariant): ElementType {
  const map: Record<TypographyVariant, ElementType> = {
    'hero': 'h1',
    'page-title': 'h1',
    'section-title': 'h2',
    'subsection-title': 'h3',
    'card-title': 'h3',
    'card-title-sm': 'h4',
    'label': 'label',
    'body': 'p',
    'body-lg': 'p',
    'secondary': 'p',
    'small': 'span',
  }
  return map[variant]
}

// Convenience exports
export const Hero = forwardRef<HTMLHeadingElement, Omit<TypographyProps, 'variant'>>((props, ref) => (
  <Typography variant="hero" ref={ref} {...props} />
))
Hero.displayName = 'Hero'

export const PageTitle = forwardRef<HTMLHeadingElement, Omit<TypographyProps, 'variant'>>((props, ref) => (
  <Typography variant="page-title" ref={ref} {...props} />
))
PageTitle.displayName = 'PageTitle'

export const SectionTitle = forwardRef<HTMLHeadingElement, Omit<TypographyProps, 'variant'>>((props, ref) => (
  <Typography variant="section-title" ref={ref} {...props} />
))
SectionTitle.displayName = 'SectionTitle'

export const SubsectionTitle = forwardRef<HTMLHeadingElement, Omit<TypographyProps, 'variant'>>((props, ref) => (
  <Typography variant="subsection-title" ref={ref} {...props} />
))
SubsectionTitle.displayName = 'SubsectionTitle'

export const CardTitle = forwardRef<HTMLHeadingElement, Omit<TypographyProps, 'variant'>>((props, ref) => (
  <Typography variant="card-title" ref={ref} {...props} />
))
CardTitle.displayName = 'CardTitle'
