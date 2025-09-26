'use client'

import { MiniKit, ISuccessResult, VerificationLevel } from '@worldcoin/minikit-js'
import { useState } from 'react'

export default function VerifyWithWorldIDButton({ walletAddress }: { walletAddress: string }) {
  const [isVerifying, setIsVerifying] = useState(false)
  const [isVerified, setIsVerified] = useState(false)

  const handleVerify = async () => {
    setIsVerifying(true)
    try {
      if (!MiniKit.isInstalled()) {
        throw new Error('Please open this in the World App.');
      }
      
      const { finalPayload } = await MiniKit.commandsAsync.verify({
        action: 'signin', // This must match an action created in your Developer Portal
        signal: walletAddress,
        verification_level: VerificationLevel.Orb,
      })

      if (finalPayload.status === 'error') {
        throw new Error(finalPayload.detail || 'Verification failed in World App.');
      }

      // Verify the proof in the backend
      const verifyResponse = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payload: finalPayload as ISuccessResult,
          signal: walletAddress,
          action: 'signin',
        }),
      });

      if (!verifyResponse.ok) {
        const errorData = await verifyResponse.json()
        throw new Error(errorData.message || 'Proof verification failed on the server.');
      }
      
      setIsVerified(true);
      alert('Success! You are now verified as a unique human.');

    } catch (error: any) {
      console.error('❌ Verification Error:', error)
      alert(`Verification failed: ${error.message}`);
    } finally {
      setIsVerifying(false);
    }
  }

  if (isVerified) {
    return (
      <div className="flex items-center justify-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
        <svg className="w-6 h-6 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <span className="text-green-600 font-semibold text-sm sm:text-base">Humanity Verified ✓</span>
      </div>
    );
  }

  return (
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
          <span className="text-sm sm:text-base">Verifying...</span>
        </div>
      ) : (
        <div className="flex items-center">
          <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm-1.47 18.53L4.94 13l2.12-2.12 2.94 2.94 6.47-6.47L18.59 9.4l-8.06 8.06z"/>
          </svg>
          <span className="text-sm sm:text-base font-medium">Verify with World ID</span>
        </div>
      )}
    </button>
  )
}
