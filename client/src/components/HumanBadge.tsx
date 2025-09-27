'use client'

import { useEffect, useState } from 'react'

export default function HumanBadge() {
  const [isHuman, setIsHuman] = useState(false)

  useEffect(() => {
    const read = () => {
      try {
        const raw = localStorage.getItem('worldid_verified')
        if (!raw) { setIsHuman(false); return }
        const v = JSON.parse(raw)
        setIsHuman(Boolean(v?.verified && v?.human_id))
      } catch {
        setIsHuman(false)
      }
    }
    read()
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'worldid_verified') read()
    }
    const onVerified = () => read()
    window.addEventListener('storage', onStorage)
    window.addEventListener('worldid:verified', onVerified as EventListener)
    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener('worldid:verified', onVerified as EventListener)
    }
  }, [])

  if (!isHuman) return null

  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-600 text-white text-xs font-semibold shadow-sm">
      <svg className="w-3.5 h-3.5 mr-1.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293A1 1 0 003.293 10.707l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z" clipRule="evenodd" />
      </svg>
      human
    </span>
  )
}
