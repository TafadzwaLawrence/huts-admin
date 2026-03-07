import { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'title' | 'image' | 'avatar' | 'custom'
}

export function Skeleton({ className, variant = 'custom', ...props }: SkeletonProps) {
  const variantClasses = {
    text: 'skeleton-text',
    title: 'skeleton-title',
    image: 'skeleton-image',
    avatar: 'skeleton-avatar',
    custom: 'skeleton',
  }

  return (
    <div
      className={cn(variantClasses[variant], className)}
      {...props}
    />
  )
}

// Preset skeleton layouts
export function PropertyCardSkeleton() {
  return (
    <div className="bg-white border border-[#E9ECEF] rounded-xl overflow-hidden">
      <Skeleton variant="image" />
      <div className="p-6 space-y-3">
        <Skeleton variant="title" />
        <Skeleton variant="text" className="w-2/3" />
        <div className="pt-3 border-t border-[#E9ECEF] flex gap-4">
          <Skeleton variant="text" className="w-16" />
          <Skeleton variant="text" className="w-16" />
        </div>
      </div>
    </div>
  )
}

export function DashboardStatSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-[#E9ECEF] p-6">
      <div className="flex items-center justify-between mb-3">
        <Skeleton className="w-9 h-9 rounded-lg" />
      </div>
      <Skeleton className="h-8 w-16 mb-1" />
      <Skeleton className="h-4 w-24" />
    </div>
  )
}

export function TableRowSkeleton({ columns = 4 }: { columns?: number }) {
  return (
    <div className="flex items-center gap-4 px-5 py-4 border-b border-[#E9ECEF]">
      <Skeleton variant="avatar" className="w-10 h-10" />
      {Array.from({ length: columns }).map((_, i) => (
        <div key={i} className="flex-1 space-y-2">
          <Skeleton variant="text" className={i === 0 ? 'w-3/4' : 'w-1/2'} />
          {i === 0 && <Skeleton variant="text" className="w-1/2" />}
        </div>
      ))}
    </div>
  )
}
