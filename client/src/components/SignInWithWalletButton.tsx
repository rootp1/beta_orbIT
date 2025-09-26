'use client'

import { useState } from 'react'
import { MiniKit } from '@worldcoin/minikit-js'

interface SignInProps {
  onSignInSuccess: (address: string) => void;
}

export default function SignInWithWalletButton({ onSignInSuccess }: SignInProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      if (!MiniKit.isInstalled()) {
        throw new Error('Please open this in the World App.');
      }

      const nonceResponse = await fetch('/api/nonce');
      if (!nonceResponse.ok) throw new Error('Failed to get nonce from server.');
      const { nonce } = await nonceResponse.json();

      const { finalPayload } = await MiniKit.commandsAsync.walletAuth({
        nonce: nonce,
        statement: 'Sign in to access your campaign dashboard',
      });

      if (finalPayload.status === 'error') {
        throw new Error(finalPayload.detail || 'Wallet authentication failed.');
      }

      const verifyResponse = await fetch('/api/complete-siwe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payload: finalPayload, nonce }),
      });

      if (!verifyResponse.ok) {
        const errorData = await verifyResponse.json();
        throw new Error(errorData.message || 'Verification failed on the server.');
      }

      const walletAddress = finalPayload.address;
      onSignInSuccess(walletAddress);

    } catch (error: any) {
      console.error('❌ Sign-in error:', error);
      alert(`Sign-in failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleSignIn}
      disabled={isLoading}
      className="w-full flex items-center justify-center px-6 py-4 bg-gradient-to-r from-black to-gray-800 hover:from-gray-800 hover:to-gray-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none disabled:shadow-md"
    >
      {isLoading ? (
        <div className="flex items-center">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-sm sm:text-base">Connecting...</span>
        </div>
      ) : (
        <div className="flex items-center">
          <svg className="w-5 h-5 mr-3 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
          <span className="text-sm sm:text-base font-medium">Connect Wallet</span>
        </div>
      )}
    </button>
  )
}
