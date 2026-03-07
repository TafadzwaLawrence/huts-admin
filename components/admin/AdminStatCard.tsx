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
    <div className={`group bg-white rounded-xl border p-5 transition-all ${
      highlight 
        ? 'border-amber-200 hover:border-amber-400' 
        : 'border-[#E9ECEF] hover:border-[#212529]'
    } ${href ? 'hover:shadow-md cursor-pointer' : ''}`}>
      <div className="flex items-center justify-between mb-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
          highlight 
            ? 'bg-[#F8F9FA] group-hover:bg-[#212529]' 
            : 'bg-[#F8F9FA] group-hover:bg-[#212529]'
        }`}>
          <Icon size={17} className={`transition-colors ${
            highlight
              ? 'text-[#495057] group-hover:text-white'
              : 'text-[#495057] group-hover:text-white'
          }`} />
        </div>
        {href && (
          <ArrowUpRight 
            size={14} 
            className="text-[#ADB5BD] opacity-0 group-hover:opacity-100 transition-opacity" 
          />
        )}
      </div>
      <p className="text-2xl font-bold text-[#212529] tabular-nums mb-0.5">{value}</p>
      <p className="text-xs text-[#ADB5BD] font-medium">{label}</p>
      {description && (
        <p className="text-[10px] text-[#ADB5BD] mt-1">{description}</p>
      )}
    </div>
  )

  return href ? <Link href={href}>{content}</Link> : content
}
