'use client'

import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  hover?: boolean
}

export default function Card({ children, className = "", hover = true }: CardProps) {
  const baseClasses = "bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 p-6 sm:p-8"
  const hoverClasses = hover ? "hover:shadow-2xl transition-all duration-300" : ""
  
  return (
    <div className={`${baseClasses} ${hoverClasses} ${className}`}>
      {children}
    </div>
  )
}
