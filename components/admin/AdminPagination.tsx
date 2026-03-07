import { ChevronLeft, ChevronRight } from 'lucide-react'

interface AdminPaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function AdminPagination({ 
  currentPage, 
  totalPages, 
  onPageChange 
}: AdminPaginationProps) {
  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-center gap-2 pt-4">
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="p-2 rounded-lg border border-[#E9ECEF] text-[#495057] hover:border-[#212529] disabled:opacity-30 disabled:hover:border-[#E9ECEF] transition-colors"
      >
        <ChevronLeft size={16} />
      </button>
      <span className="text-sm text-[#495057] px-3">
        Page {currentPage} of {totalPages}
      </span>
      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="p-2 rounded-lg border border-[#E9ECEF] text-[#495057] hover:border-[#212529] disabled:opacity-30 disabled:hover:border-[#E9ECEF] transition-colors"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  )
}
