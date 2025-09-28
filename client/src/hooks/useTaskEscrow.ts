'use client'

import { useState } from 'react'
import { MiniKit } from '@worldcoin/minikit-js'
import { TaskEscrowABI, getTaskEscrowAddress } from '@/lib/contracts'

// Types for transaction responses
interface TransactionResult {
  success: boolean
  transactionId?: string
  error?: string
}

export function useTaskEscrowTransactions() {
  const [isLoading, setIsLoading] = useState(false)
  const [lastTransaction, setLastTransaction] = useState<TransactionResult | null>(null)

  // Helper function to execute transactions
  const executeTransaction = async (
    functionName: string,
    args: any[],
    value?: string
  ): Promise<TransactionResult> => {
    setIsLoading(true)
    setLastTransaction(null)

    try {
      // Check if MiniKit is available
      if (typeof MiniKit?.commandsAsync?.sendTransaction !== 'function') {
        throw new Error('MiniKit not available. Please open in World App.')
      }

      const contractAddress = getTaskEscrowAddress()
      if (contractAddress === '0x0000000000000000000000000000000000000000') {
        throw new Error('Contract not deployed yet. Please deploy TaskEscrow contract first.')
      }

      // Prepare transaction
      const transaction = {
        address: contractAddress,
        abi: TaskEscrowABI,
        functionName,
        args,
        ...(value && { value })
      }

      console.log('🚀 Sending transaction:', { functionName, args, value })

      // Execute transaction through MiniKit
      const { finalPayload } = await MiniKit.commandsAsync.sendTransaction({
        transaction: [transaction]
      })

      console.log('📋 Transaction response:', finalPayload)

      if (finalPayload.status === 'error') {
        throw new Error((finalPayload as any).message || 'Transaction failed')
      }

      const result = {
        success: true,
        transactionId: (finalPayload as any).transaction_id
      }

      setLastTransaction(result)
      return result

    } catch (error: any) {
      console.error('❌ Transaction error:', error)
      const result = {
        success: false,
        error: error.message || 'Transaction failed'
      }
      setLastTransaction(result)
      return result
    } finally {
      setIsLoading(false)
    }
  }

  // Create a new task
  const createTask = async (
    taskId: string,
    rewardPerCompletion: string, // Wei amount as string
    maxCompletions: number
  ): Promise<TransactionResult> => {
    return executeTransaction('createTask', [taskId, rewardPerCompletion, maxCompletions])
  }

  // Fund a task (stake ETH)
  const fundTask = async (
    taskId: string,
    amount: string // Wei amount as string
  ): Promise<TransactionResult> => {
    return executeTransaction('fundTask', [taskId], amount)
  }

  // Mark task as completed by a tester
  const completeTask = async (
    taskId: string,
    testerAddress: string
  ): Promise<TransactionResult> => {
    return executeTransaction('completeTask', [taskId, testerAddress])
  }

  // Withdraw staked funds
  const withdrawStake = async (taskId: string): Promise<TransactionResult> => {
    return executeTransaction('withdrawStake', [taskId])
  }

  // Deactivate a task
  const deactivateTask = async (taskId: string): Promise<TransactionResult> => {
    return executeTransaction('deactivateTask', [taskId])
  }

  return {
    // Transaction functions
    createTask,
    fundTask,
    completeTask,
    withdrawStake,
    deactivateTask,
    
    // State
    isLoading,
    lastTransaction,
    
    // Utilities
    executeTransaction
  }
}

// Hook for reading contract data (view functions)
export function useTaskEscrowData() {
  const [isLoading, setIsLoading] = useState(false)

  // Helper function for contract calls (read-only)
  const callContract = async (
    functionName: string,
    args: any[] = []
  ): Promise<any> => {
    setIsLoading(true)
    
    try {
      // Note: For read operations, you'd typically use a web3 provider
      // For simplicity, we'll create an API endpoint to handle reads
      const response = await fetch('/api/contract/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contractAddress: getTaskEscrowAddress(),
          functionName,
          args
        })
      })

      if (!response.ok) {
        throw new Error('Failed to read from contract')
      }

      const data = await response.json()
      return data.result

    } catch (error) {
      console.error('Contract read error:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Get task details
  const getTask = async (taskId: string) => {
    return callContract('getTask', [taskId])
  }

  // Check if user completed a task
  const hasCompletedTask = async (taskId: string, userAddress: string) => {
    return callContract('hasCompletedTask', [taskId, userAddress])
  }

  // Get user's stake in a task
  const getUserStake = async (userAddress: string, taskId: string) => {
    return callContract('getUserStake', [userAddress, taskId])
  }

  // Get all task IDs
  const getAllTasks = async () => {
    return callContract('getAllTasks', [])
  }

  // Get available rewards for a task
  const getAvailableRewards = async (taskId: string) => {
    return callContract('getAvailableRewards', [taskId])
  }

  return {
    // Read functions
    getTask,
    hasCompletedTask,
    getUserStake,
    getAllTasks,
    getAvailableRewards,
    
    // State
    isLoading,
    
    // Utilities
    callContract
  }
}

// Utility functions for formatting
export const formatWei = (wei: string | number): string => {
  const eth = Number(wei) / Math.pow(10, 18)
  return eth.toFixed(4)
}

export const parseEther = (eth: string | number): string => {
  const wei = Math.floor(Number(eth) * Math.pow(10, 18))
  return wei.toString()
}
