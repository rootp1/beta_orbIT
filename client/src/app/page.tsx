'use client'; // 👈 Add this line to make it a Client Component

import Link from "next/link";
import SignInWithWalletButton from "@/components/SignInWithWalletButton";
import VerifyWithWorldIDButton from "@/components/VerifyWithWorldIDButton";
import FundCampaignButton from "@/components/FundCampaignButton";
import MobileMenu from "@/components/MobileMenu";
import { useAuth } from "@/context/AuthContext"; 

export default function Home() {
  // 👇 Add state to store the user's wallet address after login
const { walletAddress, setWalletAddress } = useAuth();
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🚀</span>
              <span className="font-bold text-xl text-gray-900 hidden sm:block">Orbital</span>
            </div>
            <div className="flex items-center space-x-4">
              {walletAddress && (
                <>
                  <Link href="/dashboard" className="hidden sm:block text-gray-600 hover:text-gray-900 transition-colors">
                    Dashboard
                  </Link>
                  <Link href="/dashboard/create" className="hidden sm:block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium">
                    Create Campaign
                  </Link>
                </>
              )}
              <MobileMenu />
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Hero Section */}
        <div className="text-center mb-12 sm:mb-16">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
            🚀 Orbital Campaign Platform
          </h1>
          <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Decentralized campaign funding with World ID authentication
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-12 sm:mb-16">
          {/* Authentication Section */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 p-6 sm:p-8 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center space-x-3 mb-6">
              <span className="text-3xl">🌍</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
                Authentication
              </h2>
            </div>
            <p className="text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base leading-relaxed">
              {walletAddress 
                ? "Your wallet is connected. Now, verify you're a unique human to proceed."
                : "Sign in securely using your wallet. This is the recommended primary auth flow."}
            </p>
            
            {/* Conditional rendering logic */}
            {!walletAddress ? (
              // If not signed in, show the wallet sign-in button
              <SignInWithWalletButton onSignInSuccess={setWalletAddress} />
            ) : (
              // If signed in, show a success message and the World ID verify button
              <div className="space-y-4 sm:space-y-6">
                <div className="p-4 sm:p-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 text-green-800 rounded-xl text-center">
                  <p className="text-sm text-green-600 mb-2">Connected Wallet</p>
                  <p className="font-mono text-xs sm:text-sm break-all font-medium">{walletAddress}</p>
                </div>
                <VerifyWithWorldIDButton walletAddress={walletAddress} />
              </div>
            )}
          </div>

          {/* Campaign Funding Section */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 p-6 sm:p-8 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center space-x-3 mb-6">
              <span className="text-3xl">💰</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
                Fund Campaign
              </h2>
            </div>
            <p className="text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base leading-relaxed">
              Example of funding a campaign using the MiniKit SDK (requires contract deployment).
            </p>
            <FundCampaignButton 
              campaignId="demo-campaign-123" 
              amount="0.01" 
            />
          </div>
        </div>

        {/* Campaign Management Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 p-6 sm:p-8 mb-8 hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center space-x-3 mb-6">
            <span className="text-3xl">📋</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
              Campaign Management
            </h2>
          </div>
          <p className="text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base leading-relaxed">
            Create and manage your campaigns with our dashboard.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/dashboard" className="flex-1">
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                View Dashboard
              </button>
            </Link>
            <Link href="/dashboard/create" className="flex-1">
              <button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                Create Campaign
              </button>
            </Link>
          </div>
        </div>
        
        {/* Setup Instructions */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 p-6 sm:p-8">
          <div className="flex items-center space-x-3 mb-6">
            <span className="text-3xl">⚙️</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
              Setup Instructions
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-600 text-sm sm:text-base">
            <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
              <p className="font-medium text-gray-800 mb-2">Environment Setup</p>
              <p>Add <code className="bg-white px-2 py-1 rounded text-xs font-mono">NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS</code> to your .env.local</p>
            </div>
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
              <p className="font-medium text-gray-800 mb-2">Install MiniKit SDK</p>
              <code className="bg-white px-2 py-1 rounded text-xs font-mono">npm install @worldcoin/minikit-js</code>
            </div>
            <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
              <p className="font-medium text-gray-800 mb-2">Install Ethers.js</p>
              <code className="bg-white px-2 py-1 rounded text-xs font-mono">npm install ethers</code>
            </div>
            <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-200">
              <p className="font-medium text-gray-800 mb-2">Smart Contract</p>
              <p>Deploy your contract and update the environment variable</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-gray-200">
          <div className="text-center text-gray-600">
            <p className="text-sm">© 2025 Orbital Campaign Platform. Built with Next.js, World ID, and MiniKit.</p>
            <p className="text-xs mt-2">Decentralized • Secure • Transparent</p>
          </div>
        </footer>
      </div>
    </div>
  );
}