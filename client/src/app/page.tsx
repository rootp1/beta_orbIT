'use client';

import { useState } from 'react';
import Link from "next/link";
import SignInWithWalletButton from "@/components/SignInWithWalletButton";
import VerifyWithWorldIDButton from "@/components/VerifyWithWorldIDButton";
import { useAuth } from "@/context/AuthContext";
import ThemeToggle from "@/components/ThemeToggle";

export default function Home() {
  const { walletAddress, setWalletAddress } = useAuth();
  const [selectedMode, setSelectedMode] = useState<'user' | 'developer' | null>(null);

  // Show mode selection if no mode is chosen
  if (!selectedMode) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Navigation */}
        <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-indigo-600 dark:bg-blue-600 rounded-lg"></div>
                <span className="font-bold text-2xl text-gray-900 dark:text-white">Orbital</span>
              </div>
              <ThemeToggle />
            </div>
          </div>
        </nav>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          {/* Hero Section */}
          <div className="text-center mb-20">
            <div className="flex justify-center mb-8">
              <img 
                src="/logo.png" 
                alt="Orbital Logo" 
                className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl shadow-lg"
              />
            </div>
            <h1 className="text-5xl sm:text-7xl font-bold text-gray-900 dark:text-white mb-8 tracking-tight">
              Welcome to Orbital
            </h1>
            <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 mb-6 max-w-4xl mx-auto leading-relaxed">
              Decentralized app testing platform with World ID authentication
            </p>
            <p className="text-lg text-gray-500 mb-16 font-medium">
              Choose your experience to get started
            </p>
          </div>

          {/* Mode Selection Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            {/* User Mode */}
            <div 
              onClick={() => setSelectedMode('user')}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-10 hover:shadow-xl transition-all duration-300 cursor-pointer group"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-indigo-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-8">
                  <svg className="w-8 h-8 text-indigo-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 group-hover:text-indigo-600 dark:group-hover:text-blue-400 transition-colors">
                  Tester Portal
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-8 text-lg leading-relaxed">
                  Test applications, complete verification tasks, and earn WLD tokens as a community tester
                </p>
                <div className="space-y-4 text-left mb-10">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-indigo-600 dark:bg-blue-400 rounded-full"></div>
                    <span className="text-gray-700 dark:text-gray-300">Browse available applications</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-indigo-600 dark:bg-blue-400 rounded-full"></div>
                    <span className="text-gray-700 dark:text-gray-300">Complete testing tasks</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-indigo-600 dark:bg-blue-400 rounded-full"></div>
                    <span className="text-gray-700 dark:text-gray-300">Earn WLD rewards</span>
                  </div>
                </div>
                <button className="w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-xl transition-colors duration-200">
                  Enter Tester Portal
                </button>
              </div>
            </div>

            {/* Developer Mode */}
            <div 
              onClick={() => setSelectedMode('developer')}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-10 hover:shadow-xl transition-all duration-300 cursor-pointer group"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-indigo-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-8">
                  <svg className="w-8 h-8 text-indigo-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 group-hover:text-indigo-600 dark:group-hover:text-blue-400 transition-colors">
                  Developer Portal
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-8 text-lg leading-relaxed">
                  Submit applications for testing, create campaigns, and manage your testing programs
                </p>
                <div className="space-y-4 text-left mb-10">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-indigo-600 dark:bg-blue-400 rounded-full"></div>
                    <span className="text-gray-700 dark:text-gray-300">Submit apps for testing</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-indigo-600 dark:bg-blue-400 rounded-full"></div>
                    <span className="text-gray-700 dark:text-gray-300">Manage testing campaigns</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-indigo-600 dark:bg-blue-400 rounded-full"></div>
                    <span className="text-gray-700 dark:text-gray-300">Configure rewards & incentives</span>
                  </div>
                </div>
                <button className="w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-xl transition-colors duration-200">
                  Enter Developer Portal
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <footer className="mt-24 pt-12 border-t border-gray-200 dark:border-gray-700">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <p className="text-sm font-medium">© 2025 Orbital Platform. Built with Next.js, World ID, and MiniKit.</p>
              <p className="text-xs mt-3 tracking-wide">Decentralized • Secure • Transparent</p>
            </div>
          </footer>
        </div>
      </div>
    );
  }

  // Show User Mode - Redirect to apps page
  if (selectedMode === 'user') {
    // Redirect to apps browsing page
    window.location.href = '/apps';
    return null;
  }

  // Show Developer Mode with authentication flow
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Developer Navigation */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-indigo-600 dark:bg-blue-600 rounded-lg"></div>
              <span className="font-bold text-xl text-gray-900 dark:text-white">Orbital Developer Portal</span>
            </div>
            <div className="flex items-center space-x-6">
              {walletAddress ? (
                <>
                  <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors font-medium">
                    Dashboard
                  </Link>
                  <Link href="/dashboard/create" className="bg-indigo-600 hover:bg-indigo-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors text-sm font-semibold">
                    Create Campaign
                  </Link>
                </>
              ) : null}
              <ThemeToggle />
              <button 
                onClick={() => setSelectedMode(null)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors font-medium"
              >
                ← Back to Home
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {!walletAddress ? (
          // Authentication Step
          <div className="text-center mb-16">
            <div className="w-20 h-20 bg-indigo-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-8">
              <svg className="w-10 h-10 text-indigo-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-8 tracking-tight">
              Developer Authentication
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-16 max-w-2xl mx-auto leading-relaxed">
              Connect your wallet to access the developer dashboard and start creating testing campaigns for your applications.
            </p>
            
            {/* Authentication Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-10 max-w-lg mx-auto">
              <div className="flex items-center justify-center space-x-4 mb-8">
                <div className="w-12 h-12 bg-indigo-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-indigo-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Connect Wallet</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-10 text-lg leading-relaxed">
                Authenticate securely using your wallet to access all developer features and campaign management tools.
              </p>
              <SignInWithWalletButton onSignInSuccess={setWalletAddress} />
            </div>
          </div>
        ) : (
          // Authenticated Developer Dashboard
          <div className="text-center mb-16">
            <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-8">
              <svg className="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-8 tracking-tight">
              Welcome, Developer
            </h1>
            <p className="text-xl text-gray-600 mb-12 leading-relaxed">
              Your wallet is connected. Choose what you'd like to do:
            </p>
            
            {/* Connected Wallet Display */}
            <div className="bg-indigo-50 dark:bg-blue-900 border border-indigo-200 dark:border-blue-700 text-indigo-800 dark:text-blue-100 rounded-xl p-6 mb-16 max-w-lg mx-auto">
              <p className="text-sm text-indigo-600 dark:text-blue-300 mb-2 font-semibold">Connected Wallet</p>
              <p className="font-mono text-sm break-all font-medium">{walletAddress}</p>
            </div>

            {/* Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
              {/* Dashboard Card */}
              <Link href="/dashboard">
                <div className="bg-gray-800 rounded-2xl shadow-lg border border-gray-700 p-10 hover:shadow-xl transition-all duration-300 cursor-pointer group">
                  <div className="w-16 h-16 bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-6 group-hover:text-blue-400 transition-colors">
                    View Dashboard
                  </h3>
                  <p className="text-gray-300 mb-8 leading-relaxed">
                    Monitor your existing campaigns, view submissions, and track performance metrics
                  </p>
                  <div className="space-y-4 text-left mb-8">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span className="text-gray-300">Track campaign metrics</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span className="text-gray-300">Manage tester submissions</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span className="text-gray-300">Monitor reward distribution</span>
                    </div>
                  </div>
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl transition-colors duration-200">
                    Open Dashboard
                  </button>
                </div>
              </Link>

              {/* Create Campaign Card */}
              <Link href="/dashboard/create">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-10 hover:shadow-xl transition-all duration-300 cursor-pointer group">
                  <div className="w-16 h-16 bg-indigo-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-indigo-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 group-hover:text-indigo-600 dark:group-hover:text-blue-400 transition-colors">
                    Create Campaign
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                    Submit a new application for testing and configure your reward structure
                  </p>
                  <div className="space-y-4 text-left mb-8">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-indigo-600 dark:bg-blue-400 rounded-full"></div>
                      <span className="text-gray-700 dark:text-gray-300">Submit your application</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-indigo-600 dark:bg-blue-400 rounded-full"></div>
                      <span className="text-gray-700 dark:text-gray-300">Define testing tasks</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-indigo-600 dark:bg-blue-400 rounded-full"></div>
                      <span className="text-gray-700 dark:text-gray-300">Configure reward amounts</span>
                    </div>
                  </div>
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl transition-colors duration-200">
                    Start New Campaign
                  </button>
                </div>
              </Link>
            </div>

            {/* World ID Verification Section */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 max-w-lg mx-auto">
              <div className="flex items-center justify-center space-x-4 mb-6">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">World ID Verification</h3>
              </div>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Verify your humanity with World ID for enhanced platform features and increased trust.
              </p>
              <VerifyWithWorldIDButton walletAddress={walletAddress} />
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-20 pt-8 border-t border-gray-200">
          <div className="text-center text-gray-500">
            <p className="text-sm font-medium">© 2025 Orbital Developer Platform. Built with Next.js, World ID, and MiniKit.</p>
            <p className="text-xs mt-2 tracking-wide">Secure • Decentralized • Developer-Friendly</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
