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
    <div className="bg-white rounded-xl border border-[#E9ECEF] py-16 md:py-20 text-center">
      <Icon size={40} className="mx-auto text-[#E9ECEF] mb-3" />
      <h3 className="font-semibold text-[#212529] mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-[#ADB5BD] mb-4">{description}</p>
      )}
      {action && (
        <div className="mt-6">
          {action}
        </div>
      )}
    </div>
  )
}
