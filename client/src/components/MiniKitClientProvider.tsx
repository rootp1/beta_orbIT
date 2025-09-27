'use client'

import { MiniKitProvider } from '@worldcoin/minikit-js/minikit-provider'

export default function MiniKitClientProvider({ children }: { children: React.ReactNode }) {
  const appId = process.env.NEXT_PUBLIC_WORLDCOIN_APP_ID || ''
  if (typeof window !== 'undefined' && !appId) {
    // Surface misconfiguration early during development
    console.warn('[MiniKit] NEXT_PUBLIC_WORLDCOIN_APP_ID is not set. MiniApp deep link and provider may not work as expected.')
  }
  return (
    <MiniKitProvider
      props={{
        appId,
      }}
    >
      {children}
    </MiniKitProvider>
  )
}
