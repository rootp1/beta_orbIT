'use client'

import { useState } from 'react'
import { supabase } from '@/utils/supabaseClient'
import { MiniKit } from '@worldcoin/minikit-js'
import { ethers } from 'ethers'

interface FundCampaignButtonProps {
  campaignId: string
  amount: string // ETH value like '0.01'
}

// The ABI for the specific function we want to call
const escrowContractAbi = [
  'function fundCampaign(string memory campaignId) public payable'
]

export default function FundCampaignButton({ campaignId, amount }: FundCampaignButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const escrowContractAddress = process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS

  const handleFundCampaign = async () => {
    if (!escrowContractAddress) {
      alert('Contract address not configured.')
      return
    }

    if (!MiniKit.isInstalled()) {
      alert('MiniKit is not available. Please make sure you are using this app within the World App.')
      return
    }

    setIsLoading(true)
    
    try {
      // Step 1: Convert ETH amount to wei using ethers
      const valueInWei = ethers.parseEther(amount).toString()
      
      // Step 2: Encode the function call data using ethers
      const contractInterface = new ethers.Interface(escrowContractAbi)
      const encodedData = contractInterface.encodeFunctionData('fundCampaign', [campaignId])

      console.log(`Sending transaction to ${escrowContractAddress}...`)
      
      // Step 3: Send the transaction using MiniKit SDK async method
      const { finalPayload } = await MiniKit.commandsAsync.sendTransaction({
        to: escrowContractAddress,
        value: valueInWei,
        data: encodedData,
      })
      
      if (finalPayload.status === 'error') {
        throw new Error(finalPayload.detail || 'Transaction failed or was cancelled.')
      }

      const transactionHash = finalPayload.transaction_hash
      console.log('✅ Transaction successful:', transactionHash)

      // Step 4: Update campaign status in Supabase after successful transaction
      await updateCampaignStatus(campaignId, transactionHash)
      
      alert(`Campaign funded successfully!\nTransaction Hash: ${transactionHash}`)
      
    } catch (error) {
      console.error('❌ Transaction error:', error)
      alert(`Transaction failed: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const updateCampaignStatus = async (campaignId: string, transactionHash: string) => {
    try {
      const { error } = await supabase
        .from('campaigns')
        .update({ 
          status: 'ACTIVE',
        })
        .eq('id', campaignId)
      
      if (error) throw error
      console.log('✅ Campaign status updated to ACTIVE in Supabase')
    } catch (error) {
      console.error('Error updating Supabase:', error)
    }
  }

  if (!escrowContractAddress) {
    return (
      <div className="p-4 border-2 border-red-200 rounded-xl bg-gradient-to-r from-red-50 to-pink-50">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <p className="text-red-700 text-sm font-medium">
            Contract address not configured
          </p>
        </div>
        <p className="text-red-600 text-xs mt-2 ml-8">
          Please set NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS in your environment variables.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-gray-600">
        <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
          <p className="font-medium text-gray-800">Amount</p>
          <p className="font-mono">{amount} ETH</p>
        </div>
        <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
          <p className="font-medium text-gray-800">Contract</p>
          <p className="font-mono text-xs truncate">{escrowContractAddress}</p>
        </div>
      </div>
      
      <button
        onClick={handleFundCampaign}
        disabled={isLoading}
        className="w-full flex items-center justify-center px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none disabled:shadow-md"
      >
        {isLoading ? (
          <div className="flex items-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-sm sm:text-base">Processing...</span>
          </div>
        ) : (
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm sm:text-base font-medium">Fund Campaign</span>
          </div>
        )}
      </button>
    </div>
  )
}