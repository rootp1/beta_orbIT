'use client'

import { useState } from 'react'
import { useTaskEscrowTransactions, formatWei, parseEther } from '@/hooks/useTaskEscrow'
import StepByStepVerification from '@/components/StepByStepVerification'

interface TaskCreationFlowProps {
  onTaskCreated: (taskId: string) => void
}

type CreationStep = 'verification' | 'details' | 'funding' | 'complete'

export default function TaskCreationFlow({ onTaskCreated }: TaskCreationFlowProps) {
  const [currentStep, setCurrentStep] = useState<CreationStep>('verification')
  const [walletAddress, setWalletAddress] = useState<string>('')
  const [taskDetails, setTaskDetails] = useState({
    taskId: '',
    description: '',
    rewardAmount: '0.01', // ETH
    maxCompletions: 10,
    fundingAmount: '0.1' // ETH
  })
  
  const { createTask, fundTask, isLoading, lastTransaction } = useTaskEscrowTransactions()

  const handleVerificationComplete = (address: string) => {
    setWalletAddress(address)
    setCurrentStep('details')
  }

  const handleTaskDetailsSubmit = async () => {
    if (!taskDetails.taskId || !taskDetails.rewardAmount) {
      alert('Please fill in all required fields')
      return
    }

    const rewardInWei = parseEther(taskDetails.rewardAmount)
    
    // Create the task
    const result = await createTask(
      taskDetails.taskId,
      rewardInWei,
      taskDetails.maxCompletions
    )

    if (result.success) {
      setCurrentStep('funding')
    } else {
      alert(`Failed to create task: ${result.error}`)
    }
  }

  const handleFundTask = async () => {
    if (!taskDetails.fundingAmount || Number(taskDetails.fundingAmount) <= 0) {
      alert('Please enter a valid funding amount')
      return
    }

    const fundingInWei = parseEther(taskDetails.fundingAmount)
    
    const result = await fundTask(taskDetails.taskId, fundingInWei)

    if (result.success) {
      setCurrentStep('complete')
      onTaskCreated(taskDetails.taskId)
    } else {
      alert(`Failed to fund task: ${result.error}`)
    }
  }

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center space-x-4">
        <StepIndicator 
          step={1} 
          title="Verify" 
          isActive={currentStep === 'verification'} 
          isComplete={!!walletAddress} 
        />
        <Arrow />
        <StepIndicator 
          step={2} 
          title="Details" 
          isActive={currentStep === 'details'} 
          isComplete={currentStep !== 'verification' && currentStep !== 'details'} 
        />
        <Arrow />
        <StepIndicator 
          step={3} 
          title="Fund" 
          isActive={currentStep === 'funding'} 
          isComplete={currentStep === 'complete'} 
        />
        <Arrow />
        <StepIndicator 
          step={4} 
          title="Live" 
          isActive={currentStep === 'complete'} 
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
          userType="developer"
        />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {renderStepIndicator()}
      
      {currentStep === 'details' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Create Your Task
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Define the details of your testing task and reward structure
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Task ID (Unique Identifier)
              </label>
              <input
                type="text"
                value={taskDetails.taskId}
                onChange={(e) => setTaskDetails(prev => ({ ...prev, taskId: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="e.g., mobile-app-beta-test-v1"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Task Description
              </label>
              <textarea
                value={taskDetails.description}
                onChange={(e) => setTaskDetails(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Describe what testers need to do..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Reward per Completion (ETH)
                </label>
                <input
                  type="number"
                  step="0.001"
                  min="0.001"
                  value={taskDetails.rewardAmount}
                  onChange={(e) => setTaskDetails(prev => ({ ...prev, rewardAmount: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Maximum Completions
                </label>
                <input
                  type="number"
                  min="1"
                  value={taskDetails.maxCompletions}
                  onChange={(e) => setTaskDetails(prev => ({ ...prev, maxCompletions: parseInt(e.target.value) }))}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-2">Task Summary</h4>
              <div className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
                <p>• Reward per completion: {taskDetails.rewardAmount} ETH</p>
                <p>• Maximum completions: {taskDetails.maxCompletions}</p>
                <p>• Total potential rewards: {(Number(taskDetails.rewardAmount) * taskDetails.maxCompletions).toFixed(3)} ETH</p>
              </div>
            </div>

            <button
              onClick={handleTaskDetailsSubmit}
              disabled={isLoading || !taskDetails.taskId || !taskDetails.rewardAmount}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating Task...' : 'Create Task'}
            </button>
          </div>
        </div>
      )}

      {currentStep === 'funding' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Fund Your Task
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Stake ETH to activate your task and enable tester rewards
            </p>
          </div>

          <div className="space-y-6">
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <svg className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="font-medium text-green-900 dark:text-green-300">Task Created Successfully!</span>
              </div>
              <div className="text-sm text-green-800 dark:text-green-400">
                Task ID: <span className="font-mono">{taskDetails.taskId}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Initial Funding Amount (ETH)
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={taskDetails.fundingAmount}
                onChange={(e) => setTaskDetails(prev => ({ ...prev, fundingAmount: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                required
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                This will enable ~{Math.floor(Number(taskDetails.fundingAmount) / Number(taskDetails.rewardAmount))} task completions
              </p>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm">
                  <p className="font-medium text-yellow-900 dark:text-yellow-300 mb-1">Staking Information</p>
                  <p className="text-yellow-800 dark:text-yellow-400">
                    You can add more funding later or withdraw unused funds when the task is complete.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleFundTask}
              disabled={isLoading || !taskDetails.fundingAmount || Number(taskDetails.fundingAmount) <= 0}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Funding Task...' : `Fund Task with ${taskDetails.fundingAmount} ETH`}
            </button>
          </div>
        </div>
      )}

      {currentStep === 'complete' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Task is Live! 🎉
          </h2>
          
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            Your task has been created and funded successfully. Testers can now complete it and earn rewards.
          </p>

          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-green-900 dark:text-green-300 mb-4">Task Details</h3>
            <div className="text-sm text-green-800 dark:text-green-400 space-y-2 text-left">
              <div className="flex justify-between">
                <span>Task ID:</span>
                <span className="font-mono">{taskDetails.taskId}</span>
              </div>
              <div className="flex justify-between">
                <span>Reward per completion:</span>
                <span>{taskDetails.rewardAmount} ETH</span>
              </div>
              <div className="flex justify-between">
                <span>Maximum completions:</span>
                <span>{taskDetails.maxCompletions}</span>
              </div>
              <div className="flex justify-between">
                <span>Initial funding:</span>
                <span>{taskDetails.fundingAmount} ETH</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => window.location.href = `/apps/task-manager`}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
            >
              Go to Task Manager
            </button>
            
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold py-3 px-6 rounded-lg transition-all duration-200"
            >
              Create Another Task
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// Helper components
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
