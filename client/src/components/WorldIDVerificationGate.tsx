'use client'

import { MiniKit, ISuccessResult, VerificationLevel } from '@worldcoin/minikit-js'
import { IDKitWidget, VerificationLevel as IDKitVerificationLevel } from '@worldcoin/idkit'
import { useState, useEffect } from 'react'
import ThemeToggle from './ThemeToggle'
import Link from 'next/link'

interface WorldIDVerificationGateProps {
  children: React.ReactNode
  onVerificationComplete: () => void
}

export default function WorldIDVerificationGate({ children, onVerificationComplete }: WorldIDVerificationGateProps) {
  const [isVerifying, setIsVerifying] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [useMiniKit, setUseMiniKit] = useState(false)

  // Check if user is already verified and detect platform
  useEffect(() => {
    // Check if MiniKit is available (World App)
    setUseMiniKit(MiniKit.isInstalled())
    
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

  const handleVerify = async () => {
    if (!useMiniKit) {
      setError('This verification method is only available in the World App. Please use the "Verify in Browser" option below.')
      return
    }

    setIsVerifying(true)
    setError(null)
    
    try {
      console.log('🚀 Starting World ID verification with MiniKit...')
      
      const { finalPayload } = await MiniKit.commandsAsync.verify({
        action: 'login', // Action for tester mode verification
        signal: 'orbital_tester_access',
        verification_level: VerificationLevel.Orb, // Require Orb verification for tester access
      })

      console.log('📋 Verification payload received:', finalPayload)

      if (finalPayload.status === 'error') {
        throw new Error((finalPayload as any).detail || 'Verification failed in World App.');
      }

      await verifyProof(finalPayload as ISuccessResult)

    } catch (error: any) {
      console.error('❌ Verification Error:', error)
      setError(error.message)
    } finally {
      setIsVerifying(false)
    }
  }

  const handleIDKitSuccess = async (result: ISuccessResult) => {
    console.log('🚀 Starting World ID verification with IDKit...')
    setIsVerifying(true)
    setError(null)
    
    try {
      await verifyProof(result)
    } catch (error: any) {
      console.error('❌ IDKit Verification Error:', error)
      setError(error.message)
    } finally {
      setIsVerifying(false)
    }
  }

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
    
    // Store verification status with timestamp
    const verificationData = {
      verified: true,
      timestamp: Date.now(),
      action: 'login'
    }
    localStorage.setItem('worldid_verified', JSON.stringify(verificationData))
    setIsVerified(true)
    onVerificationComplete()
  }

  // If verified, show the children (the apps page content)
  if (isVerified) {
    return <>{children}</>
  }

  // Show verification gate
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

            {/* Verification Buttons */}
            <div className="space-y-4">
              {useMiniKit ? (
                <button 
                  onClick={handleVerify} 
                  disabled={isVerifying}
                  className="w-full flex items-center justify-center px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none disabled:shadow-md"
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
              ) : (
                <IDKitWidget
                  app_id={(process.env.NEXT_PUBLIC_WORLDCOIN_APP_ID || "") as `app_${string}`}
                  action="login"
                  signal="orbital_tester_access"
                  onSuccess={handleIDKitSuccess}
                  verification_level={IDKitVerificationLevel.Orb}
                  onError={(error) => setError(error.detail || 'Verification failed')}
                >
                  {({ open }) => (
                    <button 
                      onClick={open} 
                      disabled={isVerifying}
                      className="w-full flex items-center justify-center px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none disabled:shadow-md"
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
                          <span className="font-medium">Verify in Browser</span>
                        </div>
                      )}
                    </button>
                  )}
                </IDKitWidget>
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
                    {useMiniKit ? 'World App Detected' : 'Web Browser Verification'}
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-400">
                    {useMiniKit 
                      ? 'Great! You can verify directly through the World App you\'re using now.'
                      : 'Verify using your World ID. This will open a QR code to scan with your World App mobile device.'
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
