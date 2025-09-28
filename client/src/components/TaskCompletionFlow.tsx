'use client'

import { useState, useEffect } from 'react'
import { useTaskEscrowTransactions, useTaskEscrowData, formatWei } from '@/hooks/useTaskEscrow'
import StepByStepVerification from '@/components/StepByStepVerification'

interface TaskCompletionFlowProps {
  taskId: string
  onTaskCompleted: () => void
}

type CompletionStep = 'verification' | 'task-details' | 'complete' | 'reward'

interface TaskData {
  developer: string
  rewardPerCompletion: string
  totalFunded: string
  totalCompletions: number
  maxCompletions: number
  isActive: boolean
}

export default function TaskCompletionFlow({ taskId, onTaskCompleted }: TaskCompletionFlowProps) {
  const [currentStep, setCurrentStep] = useState<CompletionStep>('task-details')
  const [walletAddress, setWalletAddress] = useState<string>('0xTestWallet123') // Default test wallet for non-verified users
  const [taskData, setTaskData] = useState<TaskData | null>(null)
  const [hasCompleted, setHasCompleted] = useState<boolean>(false)
  const [isLoadingTask, setIsLoadingTask] = useState(false)
  
  const { completeTask, isLoading } = useTaskEscrowTransactions()
  const { getTask, hasCompletedTask } = useTaskEscrowData()

  // Load task data immediately without requiring wallet verification
  useEffect(() => {
    if (taskId) {
      loadTaskData()
    }
  }, [taskId])

  const loadTaskData = async () => {
    setIsLoadingTask(true)
    try {
      const [task, completed] = await Promise.all([
        getTask(taskId),
        hasCompletedTask(taskId, walletAddress)
      ])
      
      setTaskData({
        developer: task[0],
        rewardPerCompletion: task[1],
        totalFunded: task[2],
        totalCompletions: task[3],
        maxCompletions: task[4],
        isActive: task[5]
      })
      
      setHasCompleted(completed)
      // Already starting at task-details, no need to change step
    } catch (error) {
      console.error('Failed to load task data:', error)
      alert('Failed to load task data. Please try again.')
    } finally {
      setIsLoadingTask(false)
    }
  }

  const handleVerificationComplete = (address: string) => {
    setWalletAddress(address)
  }

  const handleCompleteTask = async () => {
    if (!walletAddress) {
      alert('Wallet not connected')
      return
    }

    // In a real app, you'd have the developer or a backend service call this
    // For now, we'll simulate the tester requesting completion
    const result = await completeTask(taskId, walletAddress)

    if (result.success) {
      setCurrentStep('reward')
      onTaskCompleted()
    } else {
      alert(`Failed to complete task: ${result.error}`)
    }
  }

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center space-x-4">
        <StepIndicator 
          step={1} 
          title="Task Details" 
          isActive={currentStep === 'task-details'} 
          isComplete={currentStep === 'complete' || currentStep === 'reward'} 
        />
        <Arrow />
        <StepIndicator 
          step={2} 
          title="Complete Task" 
          isActive={currentStep === 'complete'} 
          isComplete={currentStep === 'reward'} 
        />
        <Arrow />
        <StepIndicator 
          step={3} 
          title="Claim Reward" 
          isActive={currentStep === 'reward'} 
          isComplete={false} 
        />
      </div>
    </div>
  )

  if (currentStep === 'verification') {
    return (
      <div className="max-w-4xl mx-auto">
        <StepByStepVerification 
          onComplete={handleVerificationComplete}
          userType="tester"
        />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {renderStepIndicator()}
      
      {currentStep === 'task-details' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8">
          {isLoadingTask ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading task details...</p>
            </div>
          ) : !taskData ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-red-800 dark:text-red-400 mb-2">Task Not Found</h3>
              <p className="text-red-600 dark:text-red-300">
                The task "{taskId}" could not be found or loaded.
              </p>
            </div>
          ) : hasCompleted ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-yellow-800 dark:text-yellow-400 mb-2">Already Completed</h3>
              <p className="text-yellow-600 dark:text-yellow-300">
                You have already completed this task and received your reward.
              </p>
            </div>
          ) : !taskData.isActive ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-400 mb-2">Task Inactive</h3>
              <p className="text-gray-600 dark:text-gray-300">
                This task is no longer active and cannot be completed.
              </p>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  Complete Task
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Review the task details and earn your reward
                </p>
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 max-w-md mx-auto">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    ⚠️ Testing Mode: Human verification bypassed for open access
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                  <h3 className="font-bold text-blue-900 dark:text-blue-300 mb-4 text-lg">Task Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-blue-700 dark:text-blue-400 font-medium">Task ID:</span>
                      <p className="font-mono text-blue-900 dark:text-blue-300">{taskId}</p>
                    </div>
                    <div>
                      <span className="text-blue-700 dark:text-blue-400 font-medium">Reward:</span>
                      <p className="font-mono text-blue-900 dark:text-blue-300">{formatWei(taskData.rewardPerCompletion)} ETH</p>
                    </div>
                    <div>
                      <span className="text-blue-700 dark:text-blue-400 font-medium">Progress:</span>
                      <p className="text-blue-900 dark:text-blue-300">
                        {taskData.totalCompletions} / {taskData.maxCompletions} completed
                      </p>
                    </div>
                    <div>
                      <span className="text-blue-700 dark:text-blue-400 font-medium">Available Funds:</span>
                      <p className="font-mono text-blue-900 dark:text-blue-300">{formatWei(taskData.totalFunded)} ETH</p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
                  <h4 className="font-semibold text-green-900 dark:text-green-300 mb-3">Testing Instructions</h4>
                  <div className="text-sm text-green-800 dark:text-green-400 space-y-2">
                    <p>1. Complete the testing tasks as specified by the developer</p>
                    <p>2. Ensure you follow all testing guidelines and requirements</p>
                    <p>3. Submit your completion request below</p>
                    <p>4. Wait for developer verification (this may be automated)</p>
                    <p>5. Receive your ETH reward directly to your wallet</p>
                  </div>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-sm">
                      <p className="font-medium text-yellow-900 dark:text-yellow-300 mb-1">Important Note</p>
                      <p className="text-yellow-800 dark:text-yellow-400">
                        You can only complete each task once. Make sure you have fully completed all requirements before submitting.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <button
                    onClick={() => setCurrentStep('complete')}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    I Have Completed The Task
                  </button>
                  
                  <button
                    onClick={() => window.history.back()}
                    className="w-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold py-3 px-6 rounded-lg transition-all duration-200"
                  >
                    Go Back
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {currentStep === 'complete' && taskData && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Submit Completion
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Confirm your task completion and claim your reward
            </p>
          </div>

          <div className="space-y-6">
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
              <h4 className="font-semibold text-green-900 dark:text-green-300 mb-3">Reward Summary</h4>
              <div className="text-sm text-green-800 dark:text-green-400 space-y-2">
                <div className="flex justify-between">
                  <span>Base Reward:</span>
                  <span className="font-mono">{formatWei(taskData.rewardPerCompletion)} ETH</span>
                </div>
                <div className="flex justify-between">
                  <span>Platform Fee (2.5%):</span>
                  <span className="font-mono">-{formatWei((BigInt(taskData.rewardPerCompletion) * BigInt(250) / BigInt(10000)).toString())} ETH</span>
                </div>
                <div className="border-t border-green-300 dark:border-green-700 pt-2">
                  <div className="flex justify-between font-semibold">
                    <span>You Will Receive:</span>
                    <span className="font-mono">{formatWei((BigInt(taskData.rewardPerCompletion) * BigInt(9750) / BigInt(10000)).toString())} ETH</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm">
                  <p className="font-medium text-blue-900 dark:text-blue-300 mb-1">Automatic Processing</p>
                  <p className="text-blue-800 dark:text-blue-400">
                    Your reward will be sent directly to your wallet: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleCompleteTask}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Processing Completion...' : 'Submit & Claim Reward'}
            </button>
          </div>
        </div>
      )}

      {currentStep === 'reward' && taskData && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Congratulations! 🎉
          </h2>
          
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            You have successfully completed the task and earned your reward!
          </p>

          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-green-900 dark:text-green-300 mb-4">Completion Summary</h3>
            <div className="text-sm text-green-800 dark:text-green-400 space-y-2">
              <div className="flex justify-between">
                <span>Task Completed:</span>
                <span className="font-mono">{taskId}</span>
              </div>
              <div className="flex justify-between">
                <span>Reward Earned:</span>
                <span className="font-mono">{formatWei((BigInt(taskData.rewardPerCompletion) * BigInt(9750) / BigInt(10000)).toString())} ETH</span>
              </div>
              <div className="flex justify-between">
                <span>Sent to:</span>
                <span className="font-mono">{walletAddress.slice(0, 8)}...{walletAddress.slice(-8)}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => window.location.href = `/apps/task-explorer`}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
            >
              Find More Tasks
            </button>
            
            <button
              onClick={() => window.location.href = `/dashboard`}
              className="w-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold py-3 px-6 rounded-lg transition-all duration-200"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// Helper components (same as TaskCreationFlow)
const StepIndicator = ({ step, title, isActive, isComplete }: {
  step: number
  title: string
  isActive: boolean
  isComplete: boolean
}) => (
  <div className={`flex items-center space-x-2 ${
    isActive ? 'text-blue-600' : 
    isComplete ? 'text-green-600' : 'text-gray-400'
  }`}>
    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
      isComplete ? 'bg-green-600 border-green-600 text-white' :
      isActive ? 'border-blue-600 bg-blue-50' : 'border-gray-300'
    }`}>
      {isComplete ? '✓' : step}
    </div>
    <span className="font-medium">{title}</span>
  </div>
)

const Arrow = () => (
  <div className="text-gray-400">→</div>
)
