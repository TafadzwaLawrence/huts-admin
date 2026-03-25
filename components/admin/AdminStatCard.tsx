import Link from 'next/link'
import { ArrowUpRight, type LucideIcon } from 'lucide-react'

interface AdminStatCardProps {
  label: string
  value: number | string
  icon: LucideIcon
  href?: string
  highlight?: boolean
  description?: string
}

export function AdminStatCard({ 
  label, 
  value, 
  icon: Icon, 
  href, 
  highlight,
  description 
}: AdminStatCardProps) {
  const content = (
    <div className={`group bg-adm-surface border p-5 transition-all ${
      highlight 
        ? 'border-adm-amber/30 hover:border-adm-amber/60' 
        : 'border-adm-border hover:border-adm-faint'
    } ${href ? 'cursor-pointer' : ''}`}>
      <div className="flex items-center justify-between mb-3">
        <div className={`w-9 h-9 flex items-center justify-center transition-colors ${
          highlight
            ? 'bg-adm-amber/10'
            : 'bg-adm-surface-2 group-hover:bg-adm-accent/15'
        }`}>
          <Icon size={17} className={`transition-colors ${
            highlight
              ? 'text-adm-amber'
              : 'text-adm-muted group-hover:text-adm-accent'
          }`} />
        </div>
        {href && (
          <ArrowUpRight 
            size={14} 
            className="text-adm-faint opacity-0 group-hover:opacity-100 transition-opacity" 
          />
        )}
      </div>
      <p className="text-2xl font-bold text-adm-text tabular-nums mb-0.5">{value}</p>
      <p className="text-xs text-adm-muted font-medium">{label}</p>
      {description && (
        <p className="text-[10px] text-adm-faint mt-1">{description}</p>
      )}
    </div>
  )

  return href ? <Link href={href}>{content}</Link> : content
}
