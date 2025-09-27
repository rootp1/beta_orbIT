'use client'

import { MiniKit as MiniKitImported, ISuccessResult, VerificationLevel, ResponseEvent } from '@worldcoin/minikit-js'
import { useState, useEffect } from 'react'
import ThemeToggle from './ThemeToggle'
import Link from 'next/link'
import AutoDeepLink from '@/components/AutoDeepLink'

interface WorldIDVerificationGateProps {
  children: React.ReactNode
  onVerificationComplete: () => void
  mode?: 'global' | 'page'
}

export default function WorldIDVerificationGate({ children, onVerificationComplete, mode = 'page' }: WorldIDVerificationGateProps) {
  const [isVerifying, setIsVerifying] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [useMiniKit, setUseMiniKit] = useState(false)
  const [unsubscribed, setUnsubscribed] = useState(false)
  const [autoTriggered, setAutoTriggered] = useState(false)
  const [redirecting, setRedirecting] = useState(false)

  // Prefer window-injected MiniKit when present (some World App shells inject globally)
  const getMK = () => {
    if (typeof window !== 'undefined' && (window as any)?.MiniKit) return (window as any).MiniKit
    return MiniKitImported as any
  }

  // Check if user is already verified and detect platform
  useEffect(() => {
    // Detect MiniKit without calling isInstalled (which can throw in browsers)
    if (typeof window !== 'undefined') {
      const ua = navigator.userAgent || ''
      const uaHintsWorldApp = /WorldApp|World\s?Coin|com\.worldcoin\.app|WorldID|WLD/i.test(ua)
      const MK = getMK()
      const featureCheck = !!MK?.commandsAsync || !!MK?.commands
      const sp = new URLSearchParams(window.location.search)
      const forceMiniKit = /^(1|true)$/i.test(sp.get('forceMiniKit') || '')
      setUseMiniKit(Boolean(forceMiniKit || featureCheck || uaHintsWorldApp))
      // Minimal diagnostics for tricky shells
      console.info('[MiniKit] detect', { uaHintsWorldApp, featureAsync: !!MK?.commandsAsync, featureEvents: !!MK?.commands, forceMiniKit })
    }
    
    const verificationStatus = localStorage.getItem('worldid_verified')
    if (verificationStatus) {
      try {
        // Handle both old boolean format and new JSON format
        if (verificationStatus === 'true') {
          setIsVerified(true)
          onVerificationComplete()
        } else {
          const verificationData = JSON.parse(verificationStatus)
          if (verificationData.verified && verificationData.action === 'login') {
            setIsVerified(true)
            onVerificationComplete()
          }
        }
      } catch (error) {
        console.error('Error parsing verification status:', error)
        localStorage.removeItem('worldid_verified')
      }
    }
  }, [onVerificationComplete])

  // Auto-start verification on app open when detected in World App or deep linked
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (isVerified || isVerifying || autoTriggered) return
    const sp = new URLSearchParams(window.location.search)
    const shouldAuto = useMiniKit || /^(1|true)$/i.test(sp.get('autoverify') || '') || /^(verify)$/i.test(sp.get('start') || '')
    if (!shouldAuto) return
    setAutoTriggered(true)
    // Slight defer to allow provider injection to settle
    setTimeout(() => {
      handleVerify()
    }, 50)
  }, [isVerified, isVerifying, autoTriggered, useMiniKit])

  const handleVerify = async () => {
    setIsVerifying(true)
    setError(null)
    
    try {
      const payload = {
        action: 'login',
        signal: 'orbital_tester_access',
        verification_level: VerificationLevel.Orb,
      } as const

      const MK = getMK()
      const supportsAsync = typeof MK?.commandsAsync?.verify === 'function'
      const supportsEvents = typeof MK?.commands?.verify === 'function'

      console.log('🚀 Starting World ID verification with MiniKit...', { supportsAsync, supportsEvents })

      if (supportsAsync) {
        const { finalPayload } = await MK.commandsAsync.verify(payload)
        console.log('📋 Verification payload (async) received:', finalPayload)
        if (finalPayload.status === 'error') {
          throw new Error((finalPayload as any)?.detail || (finalPayload as any)?.message || 'Verification failed in World App.')
        }
        await verifyProof(finalPayload as ISuccessResult)
        return
      }

      if (supportsEvents) {
        // Event-based fallback
        let done = false
        const timeout = setTimeout(() => {
          if (!done) {
            setError('No response from World App. Please try again inside the World App.')
          }
        }, 20000)

        const handler = async (response: any) => {
          try {
            if (done) return
            done = true
            clearTimeout(timeout)
            console.log('📋 Verification payload (event) received:', response)
            if (response?.status === 'error') {
              throw new Error(response?.detail || response?.message || 'Verification failed in World App.')
            }
            await verifyProof(response as ISuccessResult)
          } catch (e: any) {
            console.error('❌ Verification Error (event):', e)
            setError(e?.message || 'Verification failed')
          } finally {
            try { MK.unsubscribe(ResponseEvent.MiniAppVerifyAction) } catch {}
            setUnsubscribed(true)
            setIsVerifying(false)
          }
        }

        try {
          MK.subscribe(ResponseEvent.MiniAppVerifyAction, handler)
          MK.commands.verify(payload)
          return
        } catch (e: any) {
          try { MK.unsubscribe(ResponseEvent.MiniAppVerifyAction) } catch {}
          setUnsubscribed(true)
          throw e
        }
      }

      throw new Error('World App environment not detected. Ensure MiniKit provider is active and open inside World App.')

    } catch (error: any) {
      console.error('❌ Verification Error:', error)
      setError(error.message)
      // In global mode, redirect to a dedicated page with instructions
      if (mode === 'global' && typeof window !== 'undefined' && !redirecting) {
        setRedirecting(true)
        setTimeout(() => {
          window.location.assign('/verification-required')
        }, 50)
      }
    } finally {
  if (!unsubscribed) setIsVerifying(false)
      setUnsubscribed(false)
    }
  }

  // IDKit flow removed – MiniKit (World App) only

  const verifyProof = async (payload: ISuccessResult) => {
    console.log('🔄 Sending proof to server for verification...')
    
    // Verify the proof in the backend
    const verifyResponse = await fetch('/api/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        payload,
        signal: 'orbital_tester_access',
        action: 'login',
      }),
    });

  const verifyData = await verifyResponse.json()
    console.log('📊 Server verification response:', verifyData)

    if (!verifyResponse.ok || !verifyData.success) {
      throw new Error(verifyData.message || verifyData.detail || 'Proof verification failed on the server.');
    }
    
    console.log('✅ Verification successful!')
    
    // Store verification status with timestamp and the human identifier (nullifier hash)
    const verificationData = {
      verified: true,
      timestamp: Date.now(),
      action: 'login',
      human_id: verifyData?.human_id || (payload as any)?.nullifier_hash || null
    }
    localStorage.setItem('worldid_verified', JSON.stringify(verificationData))
    setIsVerified(true)
  try { window.dispatchEvent(new Event('worldid:verified')) } catch {}
    onVerificationComplete()
  }

  // If verified, show the children (the apps page content)
  if (isVerified) {
    return <>{children}</>
  }

  // Global minimal splash gate
  if (mode === 'global') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 p-6">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
            <svg className="animate-spin h-7 w-7 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Verifying your World ID…</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">Hang tight while we confirm you’re a unique human.</p>
          {error && (
            <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
          )}
          {!useMiniKit && (
            <div className="mt-6 space-y-3">
              <AutoDeepLink href={`worldapp://mini-app?app_id=${encodeURIComponent(process.env.NEXT_PUBLIC_WORLDCOIN_APP_ID || '')}&path=${encodeURIComponent('/?autoverify=1')}`} />
              <a
                href={`worldapp://mini-app?app_id=${encodeURIComponent(process.env.NEXT_PUBLIC_WORLDCOIN_APP_ID || '')}&path=${encodeURIComponent('/?autoverify=1')}`}
                className="inline-block w-full px-5 py-3 bg-white dark:bg-gray-900 border border-green-600 dark:border-emerald-600 text-green-700 dark:text-emerald-400 rounded-lg font-medium hover:bg-green-50 dark:hover:bg-gray-800 transition"
              >
                Authorize
              </a>
              <p className="text-xs text-gray-500 dark:text-gray-400">If you’re in a browser tab, tap this to reopen in the MiniApp container.</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Page-level rich gate (legacy)
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-3">
              <img 
                src="/logo.png" 
                alt="Orbital Logo" 
                className="w-8 h-8 rounded-lg"
              />
              <span className="font-bold text-xl text-gray-900 dark:text-white">Orbital Tester Portal</span>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Link href="/" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors font-medium">
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-4">
        <div className="max-w-lg w-full">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 p-8 sm:p-10">
            
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                Human Verification Required
              </h1>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                To access the tester portal and earn WLD rewards, we need to verify that you're a unique human using World ID.
              </p>
            </div>

            {/* Features List */}
            <div className="space-y-4 mb-8">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-gray-700 dark:text-gray-300">Prevent duplicate accounts</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-gray-700 dark:text-gray-300">Fair reward distribution</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-gray-700 dark:text-gray-300">Ensure genuine feedback</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-gray-700 dark:text-gray-300">Privacy-preserving verification</span>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-600 dark:text-red-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
                </div>
              </div>
            )}

            {/* Verification Button (World App preferred) */}
            <div className="space-y-4">
              <button 
                onClick={handleVerify} 
        disabled={isVerifying}
        className="w-full flex items-center justify-center px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isVerifying ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Verifying with World ID...</span>
                  </div>
                ) : (
                  <div className="flex items-center">
          <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm-1.47 18.53L4.94 13l2.12-2.12 2.94 2.94 6.47-6.47L18.59 9.4l-8.06 8.06z"/>
                    </svg>
          <span className="font-medium">Verify with World ID</span>
                  </div>
                )}
              </button>
              {!useMiniKit && (
                <div className="space-y-3">
                  <a
                    href={`worldapp://mini-app?app_id=${encodeURIComponent(process.env.NEXT_PUBLIC_WORLDCOIN_APP_ID || '')}&path=${encodeURIComponent('/apps?autoverify=1')}`}
                    className="block w-full text-center px-6 py-3 bg-white dark:bg-gray-900 border border-green-600 dark:border-emerald-600 text-green-700 dark:text-emerald-400 font-medium rounded-xl hover:bg-green-50 dark:hover:bg-gray-800 transition"
                  >
                    Open in World App (Deep Link)
                  </a>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    If you’re inside World App but still see issues, this link re-opens the mini app in the correct container. Ensure your APP_ID is configured.
                  </p>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">
                    {useMiniKit ? 'World App Detected' : 'World App Recommended'}
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-400">
                    {useMiniKit 
                      ? 'Great! You can verify directly through the World App you\'re using now.'
                      : 'If verification fails, tap the deep link below to reopen in the World App mini app container.'
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Alternative Access */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Don't have World ID? {' '}
                <a 
                  href="https://world.org" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                >
                  Learn more about World ID
                </a>
              </p>
            </div>

            {/* Debug: Clear verification for testing */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-4 text-center">
                <button 
                  onClick={() => {
                    localStorage.removeItem('worldid_verified')
                    window.location.reload()
                  }}
                  className="text-xs text-gray-400 hover:text-gray-600 underline"
                >
                  Clear Verification (Dev Only)
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
