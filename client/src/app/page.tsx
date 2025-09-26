'use client';

import { useState } from 'react';
import Link from "next/link";
import SignInWithWalletButton from "@/components/SignInWithWalletButton";
import VerifyWithWorldIDButton from "@/components/VerifyWithWorldIDButton";
import { useAuth } from "@/context/AuthContext"; 

export default function Home() {
  const { walletAddress, setWalletAddress } = useAuth();
  const [selectedMode, setSelectedMode] = useState<'user' | 'developer' | null>(null);
  // Show mode selection if no mode is chosen
  if (!selectedMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Simple Navigation */}
        <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center items-center h-16">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">🚀</span>
                <span className="font-bold text-xl text-gray-900">Orbital</span>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-6">
              🚀 Welcome to Orbital
            </h1>
            <p className="text-xl sm:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Decentralized app testing platform with World ID authentication
            </p>
            <p className="text-lg text-gray-500 mb-12">
              Choose your experience to get started
            </p>
          </div>

          {/* Mode Selection Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* User Mode */}
            <div 
              onClick={() => setSelectedMode('user')}
              className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-gray-200 p-8 hover:shadow-3xl transition-all duration-300 cursor-pointer transform hover:scale-105 group"
            >
              <div className="text-center">
                <div className="text-6xl mb-6">👤</div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">
                  User Mode
                </h2>
                <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                  Test apps, complete tasks, and earn WLD tokens as a tester in the community
                </p>
                <div className="space-y-3 text-sm text-gray-500">
                  <div className="flex items-center justify-center space-x-2">
                    <span>🎯</span>
                    <span>Browse available apps to test</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <span>✅</span>
                    <span>Complete testing tasks</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <span>💰</span>
                    <span>Earn WLD rewards</span>
                  </div>
                </div>
                <button className="mt-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-200 shadow-lg group-hover:shadow-xl">
                  Enter as Tester
                </button>
              </div>
            </div>

            {/* Developer Mode */}
            <div 
              onClick={() => setSelectedMode('developer')}
              className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-gray-200 p-8 hover:shadow-3xl transition-all duration-300 cursor-pointer transform hover:scale-105 group"
            >
              <div className="text-center">
                <div className="text-6xl mb-6">👨‍💻</div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4 group-hover:text-green-600 transition-colors">
                  Developer Mode
                </h2>
                <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                  Submit your apps for testing, create campaigns, and manage your testing programs
                </p>
                <div className="space-y-3 text-sm text-gray-500">
                  <div className="flex items-center justify-center space-x-2">
                    <span>🚀</span>
                    <span>Submit apps for testing</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <span>📊</span>
                    <span>Manage testing campaigns</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <span>💎</span>
                    <span>Set rewards & incentives</span>
                  </div>
                </div>
                <button className="mt-8 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-200 shadow-lg group-hover:shadow-xl">
                  Enter as Developer
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <footer className="mt-20 pt-8 border-t border-gray-200">
            <div className="text-center text-gray-600">
              <p className="text-sm">© 2025 Orbital Platform. Built with Next.js, World ID, and MiniKit.</p>
              <p className="text-xs mt-2">Decentralized • Secure • Transparent</p>
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Developer Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🚀</span>
              <span className="font-bold text-xl text-gray-900">Orbital - Developer Mode</span>
            </div>
            <div className="flex items-center space-x-4">
              {walletAddress ? (
                <>
                  <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 transition-colors">
                    Dashboard
                  </Link>
                  <Link href="/dashboard/create" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium">
                    Create Campaign
                  </Link>
                </>
              ) : null}
              <button 
                onClick={() => setSelectedMode(null)}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                ← Back
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {!walletAddress ? (
          // Authentication Step
          <div className="text-center mb-12">
            <div className="text-8xl mb-6">👨‍💻</div>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              Developer Authentication
            </h1>
            <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
              Connect your wallet to access the developer dashboard and start creating testing campaigns for your apps.
            </p>
            
            {/* Authentication Card */}
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-gray-200 p-8 max-w-md mx-auto">
              <div className="flex items-center justify-center space-x-3 mb-6">
                <span className="text-3xl">🌍</span>
                <h2 className="text-2xl font-bold text-gray-800">Connect Wallet</h2>
              </div>
              <p className="text-gray-600 mb-8 text-sm leading-relaxed">
                Sign in securely using your wallet to access developer features.
              </p>
              <SignInWithWalletButton onSignInSuccess={setWalletAddress} />
            </div>
          </div>
        ) : (
          // Authenticated Developer Dashboard
          <div className="text-center mb-12">
            <div className="text-8xl mb-6">✅</div>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              Welcome, Developer!
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Your wallet is connected. Choose what you'd like to do:
            </p>
            
            {/* Connected Wallet Display */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 text-green-800 rounded-xl p-4 mb-8 max-w-md mx-auto">
              <p className="text-sm text-green-600 mb-2">Connected Wallet</p>
              <p className="font-mono text-xs break-all font-medium">{walletAddress}</p>
            </div>

            {/* Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {/* Dashboard Card */}
              <Link href="/dashboard">
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 p-8 hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-105 group">
                  <div className="text-5xl mb-4">�</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">
                    View Dashboard
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Monitor your existing campaigns, view submissions, and track performance
                  </p>
                  <div className="space-y-2 text-sm text-gray-500">
                    <div className="flex items-center justify-center space-x-2">
                      <span>📈</span>
                      <span>Track campaign metrics</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <span>�</span>
                      <span>Manage tester submissions</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <span>💰</span>
                      <span>Monitor reward distribution</span>
                    </div>
                  </div>
                  <button className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg group-hover:shadow-xl">
                    Open Dashboard
                  </button>
                </div>
              </Link>

              {/* Create Campaign Card */}
              <Link href="/dashboard/create">
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 p-8 hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-105 group">
                  <div className="text-5xl mb-4">🚀</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-green-600 transition-colors">
                    Create Campaign
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Submit a new app for testing and set up your reward structure
                  </p>
                  <div className="space-y-2 text-sm text-gray-500">
                    <div className="flex items-center justify-center space-x-2">
                      <span>📱</span>
                      <span>Submit your app</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <span>✅</span>
                      <span>Define testing tasks</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <span>💎</span>
                      <span>Set reward amounts</span>
                    </div>
                  </div>
                  <button className="mt-6 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg group-hover:shadow-xl">
                    Start New Campaign
                  </button>
                </div>
              </Link>
            </div>

            {/* World ID Verification Section */}
            <div className="mt-12 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 p-8 max-w-md mx-auto">
              <div className="flex items-center justify-center space-x-3 mb-6">
                <span className="text-3xl">🌍</span>
                <h3 className="text-xl font-bold text-gray-800">World ID Verification</h3>
              </div>
              <p className="text-gray-600 mb-6 text-sm">
                Verify your humanity with World ID for enhanced platform features.
              </p>
              <VerifyWithWorldIDButton walletAddress={walletAddress} />
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-20 pt-8 border-t border-gray-200">
          <div className="text-center text-gray-600">
            <p className="text-sm">© 2025 Orbital Developer Platform. Built with Next.js, World ID, and MiniKit.</p>
            <p className="text-xs mt-2">Secure • Decentralized • Developer-Friendly</p>
          </div>
        </footer>
      </div>
    </div>
  );
}