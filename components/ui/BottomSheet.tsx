'use client'

import { useState, useEffect, useRef } from 'react'
import { X } from 'lucide-react'

interface BottomSheetProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

export function BottomSheet({ isOpen, onClose, title, children }: BottomSheetProps) {
  const [isAnimating, setIsAnimating] = useState(false)
  const sheetRef = useRef<HTMLDivElement>(null)
  const touchStartY = useRef(0)
  const translateY = useRef(0)

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    const diff = e.touches[0].clientY - touchStartY.current
    if (diff > 0 && sheetRef.current) {
      translateY.current = diff
      sheetRef.current.style.transform = `translateY(${diff}px)`
    }
  }

  const handleTouchEnd = () => {
    if (translateY.current > 100) {
      onClose()
    } else if (sheetRef.current) {
      sheetRef.current.style.transform = 'translateY(0)'
    }
    translateY.current = 0
  }

  if (!isOpen && !isAnimating) return null

  return (
    <div
      className={`fixed inset-0 z-50 transition-opacity duration-300 ${
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      onTransitionEnd={() => { if (!isOpen) setIsAnimating(false) }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        className={`absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[85vh] flex flex-col transition-transform duration-300 ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-[#ADB5BD] rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#E9ECEF]">
          <h2 className="text-base font-bold text-[#212529]">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 -mr-2 rounded-lg hover:bg-[#F8F9FA] transition-colors"
            aria-label="Close"
          >
            <X size={20} className="text-[#495057]" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {children}
        </div>
      </div>
    </div>
  )
}
