'use client'
import { usePathname } from 'next/navigation'
import WorldIDVerificationGate from '@/components/WorldIDVerificationGate'

export default function ClientVerificationGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  // Allow access to apps and task completion routes without verification for testing
  const isAppsRoute = pathname?.startsWith('/apps')
  const isCompleteTaskRoute = pathname?.startsWith('/complete-task')
  
  if (isAppsRoute || isCompleteTaskRoute) {
    return <>{children}</>
  }
  
  return (
    <WorldIDVerificationGate mode="global" onVerificationComplete={() => {}}>
      {children}
    </WorldIDVerificationGate>
  )
}
