'use client'

import WorldIDVerificationGate from '@/components/WorldIDVerificationGate'

export default function ClientVerificationGate({ children }: { children: React.ReactNode }) {
  return (
  <WorldIDVerificationGate mode="global" onVerificationComplete={() => {}}>
      {children}
    </WorldIDVerificationGate>
  )
}
