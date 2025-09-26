'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const { walletAddress } = useAuth()

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="sm:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
        aria-label="Toggle menu"
      >
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Mobile menu overlay */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40 bg-black bg-opacity-25" 
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed top-16 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-lg sm:hidden">
            <div className="px-4 py-6 space-y-4">
              {walletAddress ? (
                <>
                  <Link 
                    href="/dashboard" 
                    className="block text-gray-900 hover:text-blue-600 font-medium py-2"
                    onClick={() => setIsOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link 
                    href="/dashboard/create" 
                    className="block text-gray-900 hover:text-blue-600 font-medium py-2"
                    onClick={() => setIsOpen(false)}
                  >
                    Create Campaign
                  </Link>
                  <div className="pt-4 border-t border-gray-200">
                    <Link 
                      href="/dashboard/create"
                      className="block w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-center font-semibold py-3 px-6 rounded-xl"
                      onClick={() => setIsOpen(false)}
                    >
                      + New Campaign
                    </Link>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">Connect your wallet to access developer features</p>
                  <Link 
                    href="/"
                    className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-all"
                    onClick={() => setIsOpen(false)}
                  >
                    Connect Wallet
                  </Link>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  )
}
