'use client'

import { useEffect } from 'react'

export default function AutoDeepLink({ href, delay = 50 }: { href: string; delay?: number }) {
  useEffect(() => {
    if (typeof window === 'undefined' || !href) return
    const t = setTimeout(() => {
      try {
        window.location.assign(href)
      } catch (e) {
        console.warn('Auto deep link failed, showing manual button instead.', e)
      }
    }, delay)
    return () => clearTimeout(t)
  }, [href, delay])
  return null
}
