import { type LucideIcon } from 'lucide-react'

interface AdminEmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
}

export function AdminEmptyState({ 
  icon: Icon, 
  title, 
  description,
  action 
}: AdminEmptyStateProps) {
  return (
    <div className="bg-adm-surface border border-adm-border py-16 md:py-20 text-center">
      <Icon size={40} className="mx-auto text-adm-faint mb-3" />
      <h3 className="font-semibold text-adm-text mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-adm-muted mb-4">{description}</p>
      )}
      {action && (
        <div className="mt-6">
          {action}
        </div>
      )}
    </div>
  )
}
