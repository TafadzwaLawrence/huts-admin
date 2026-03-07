import { LucideIcon } from 'lucide-react'
import { Button } from './Button'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: {
    label: string
    href?: string
    onClick?: () => void
    variant?: 'primary' | 'secondary'
  }
  secondaryAction?: {
    label: string
    href?: string
    onClick?: () => void
  }
  iconSize?: number
}

export function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  action,
  secondaryAction,
  iconSize = 28 
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 bg-[#F8F9FA] rounded-2xl flex items-center justify-center border-2 border-[#E9ECEF] shadow-sm mb-6">
        <Icon size={iconSize} className="text-[#495057]" />
      </div>
      
      <h3 className="text-section-title mb-3">{title}</h3>
      <p className="text-secondary max-w-md mb-6 leading-relaxed">{description}</p>
      
      {action && (
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {action.href ? (
            <Button variant={action.variant || 'primary'} asChild>
              <a href={action.href}>{action.label}</a>
            </Button>
          ) : (
            <Button variant={action.variant || 'primary'} onClick={action.onClick}>
              {action.label}
            </Button>
          )}
          
          {secondaryAction && (
            secondaryAction.href ? (
              <Button variant="secondary" asChild>
                <a href={secondaryAction.href}>{secondaryAction.label}</a>
              </Button>
            ) : (
              <Button variant="secondary" onClick={secondaryAction.onClick}>
                {secondaryAction.label}
              </Button>
            )
          )}
        </div>
      )}
    </div>
  )
}
