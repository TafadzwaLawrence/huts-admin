interface AdminPageHeaderProps {
  title: string
  description?: string
  action?: React.ReactNode
  stats?: Array<{ label: string; value: string | number }>
}

export function AdminPageHeader({ 
  title, 
  description, 
  action,
  stats 
}: AdminPageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
      <div className="flex-1">
        <h1 className="text-xl font-bold text-[#212529]">{title}</h1>
        {description && (
          <p className="text-sm text-[#ADB5BD] mt-1">{description}</p>
        )}
        {stats && stats.length > 0 && (
          <div className="flex items-center gap-4 mt-2">
            {stats.map((stat, index) => (
              <div key={index} className="text-xs">
                <span className="text-[#ADB5BD]">{stat.label}:</span>{' '}
                <span className="font-semibold text-[#212529]">{stat.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      {action && (
        <div className="flex-shrink-0">
          {action}
        </div>
      )}
    </div>
  )
}
