'use client'

import { useState } from 'react'
import { MiniKit } from '@worldcoin/minikit-js'
import WorldIDVerificationGate from '@/components/WorldIDVerificationGate'
import SignInWithWalletButton from '@/components/SignInWithWalletButton'

interface StepByStepVerificationProps {
  onComplete: (walletAddress: string) => void
  userType: 'tester' | 'developer'
}

type VerificationStep = 'human' | 'wallet' | 'complete'

export default function StepByStepVerification({ onComplete, userType }: StepByStepVerificationProps) {
  const [currentStep, setCurrentStep] = useState<VerificationStep>('human')
  const [isHumanVerified, setIsHumanVerified] = useState(false)
  const [walletAddress, setWalletAddress] = useState<string>('')

  const handleHumanVerificationComplete = () => {
    setIsHumanVerified(true)
    setCurrentStep('wallet')
  }

  const handleWalletSignInSuccess = (address: string) => {
    setWalletAddress(address)
    setCurrentStep('complete')
    onComplete(address)
  }

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center space-x-4">
        {/* Step 1: Human Verification */}
        <div className={`flex items-center space-x-2 ${
          currentStep === 'human' ? 'text-blue-600' : 
          isHumanVerified ? 'text-green-600' : 'text-gray-400'
        }`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
            isHumanVerified ? 'bg-green-600 border-green-600 text-white' :
            currentStep === 'human' ? 'border-blue-600 bg-blue-50' : 'border-gray-300'
          }`}>
            {isHumanVerified ? '✓' : '1'}
          </div>
          <span className="font-medium">Human Verification</span>
        </div>

        {/* Arrow */}
        <div className="text-gray-400">→</div>

        {/* Step 2: Wallet Connection */}
        <div className={`flex items-center space-x-2 ${
          currentStep === 'wallet' ? 'text-blue-600' : 
          walletAddress ? 'text-green-600' : 'text-gray-400'
        }`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
            walletAddress ? 'bg-green-600 border-green-600 text-white' :
            currentStep === 'wallet' ? 'border-blue-600 bg-blue-50' : 'border-gray-300'
          }`}>
            {walletAddress ? '✓' : '2'}
          </div>
          <span className="font-medium">Wallet Connection</span>
        </div>

        {/* Arrow */}
        <div className="text-gray-400">→</div>

        {/* Step 3: Complete */}
        <div className={`flex items-center space-x-2 ${
          currentStep === 'complete' ? 'text-green-600' : 'text-gray-400'
        }`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
            currentStep === 'complete' ? 'bg-green-600 border-green-600 text-white' : 'border-gray-300'
          }`}>
            {currentStep === 'complete' ? '✓' : '3'}
          </div>
          <span className="font-medium">Ready</span>
        </div>
      </div>
    </div>
  )

  if (currentStep === 'complete') {
    return (
      <div className="max-w-md mx-auto text-center">
        {renderStepIndicator()}
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6">
          <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-green-800 dark:text-green-400 mb-2">
            Verification Complete!
          </h3>
          <p className="text-green-700 dark:text-green-300 mb-4">
            Welcome, verified {userType}! You're now ready to {userType === 'tester' ? 'complete tasks and earn rewards' : 'create and fund tasks'}.
          </p>
          <div className="text-sm text-green-600 dark:text-green-400 font-mono bg-green-100 dark:bg-green-800/30 rounded p-2">
            {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto">
      {renderStepIndicator()}
      
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8">
        {currentStep === 'human' && (
          <>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Verify Your Humanity
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                As a {userType}, we need to verify you're a real person to ensure fair {userType === 'tester' ? 'reward distribution' : 'task creation'}.
              </p>
            </div>
            
            <WorldIDVerificationGate
              onVerificationComplete={handleHumanVerificationComplete}
              mode="page"
            >
              <div></div>
            </WorldIDVerificationGate>
          </>
        )}

        {currentStep === 'wallet' && (
          <>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Connect Your Wallet
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Connect your World App wallet to {userType === 'tester' ? 'receive task rewards' : 'fund tasks and pay fees'}.
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-sm">
                    <p className="font-medium text-blue-800 dark:text-blue-300">
                      ✅ Human verification complete
                    </p>
                    <p className="text-blue-600 dark:text-blue-400">
                      You've been verified as a unique human
                    </p>
                  </div>
                </div>
              </div>

              <SignInWithWalletButton onSignInSuccess={handleWalletSignInSuccess} />

              <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                Your wallet will be used for {userType === 'tester' ? 'receiving ETH rewards' : 'funding tasks and paying gas fees'}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
