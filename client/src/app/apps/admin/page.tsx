'use client'

import { useState } from 'react'
import { supabase } from '@/utils/supabaseClient'
import ThemeToggle from '@/components/ThemeToggle'

export default function AdminPage() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const addTestData = async () => {
    setLoading(true)
    setMessage('')
    
    try {
      // First insert test apps
        const { data: apps, error: appsError } = await supabase
        .from('apps')
        .insert([
          {
            name: 'Social Media Analytics',
            description: 'A comprehensive analytics dashboard for social media performance tracking and engagement metrics.',
            deployed_url: 'https://example.com/social-analytics',
            max_testers: 25,
            reward_per_tester: 30,
            status: 'ACTIVE',
            owner_id: '0xtest123'
          },
          {
            name: 'E-Commerce Platform',
            description: 'Modern e-commerce solution with integrated payment processing and inventory management.',
            deployed_url: 'https://example.com/ecommerce',
            max_testers: 30,
            reward_per_tester: 25,
            status: 'ACTIVE',
            owner_id: '0xtest456'
          },
          {
            name: 'Task Management App',
            description: 'Collaborative task management tool with real-time updates and team collaboration features.',
            deployed_url: 'https://example.com/taskmanager',
            max_testers: 20,
            reward_per_tester: 35,
            status: 'ACTIVE',
            owner_id: '0xtest789'
          }
        ])
        .select()

      if (appsError) throw appsError

      // Then insert tasks for each app
      for (let i = 0; i < apps.length; i++) {
        const app = apps[i]
        const { error: tasksError } = await supabase
          .from('tasks')
          .insert([
            {
              app_id: app.id,
              title: 'User Registration Test',
              description: 'Sign up for a new account and verify email confirmation process.',
              per_task_reward: 5,
              verification_key: `reg_${app.id}_key`
            },
            {
              app_id: app.id,
              title: 'Core Feature Testing',
              description: 'Test the main functionality and report any bugs or usability issues.',
              per_task_reward: 15,
              verification_key: `core_${app.id}_key`
            },
            {
              app_id: app.id,
              title: 'Performance Evaluation',
              description: 'Evaluate app performance, loading times, and responsiveness across devices.',
              per_task_reward: 10,
              verification_key: `perf_${app.id}_key`
            }
          ])

        if (tasksError) throw tasksError
      }

      setMessage('Test data added successfully!')
    } catch (error) {
      console.error('Error adding test data:', error)
      setMessage('Error adding test data. Check console for details.')
    } finally {
      setLoading(false)
    }
  }

  const clearTestData = async () => {
    setLoading(true)
    setMessage('')
    
    try {
      // Delete all tasks first (foreign key constraint)
      await supabase.from('tasks').delete().neq('id', 0)
      
      // Then delete all apps
      await supabase.from('apps').delete().neq('id', 0)
      
      setMessage('All test data cleared!')
    } catch (error) {
      console.error('Error clearing test data:', error)
      setMessage('Error clearing test data. Check console for details.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <img 
              src="/logo.png" 
              alt="Orbital Logo" 
              className="w-12 h-12 rounded-xl"
            />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Panel</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Manage test data for development</p>
            </div>
          </div>
          <ThemeToggle />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Test Data Management</h2>
          
          <div className="space-y-4">
            <button
              onClick={addTestData}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-300 dark:disabled:bg-green-800 text-white px-6 py-3 rounded-lg transition-colors font-medium"
            >
              {loading ? 'Adding...' : 'Add Test Data (3 Apps with Tasks)'}
            </button>
            
            <button
              onClick={clearTestData}
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-300 dark:disabled:bg-red-800 text-white px-6 py-3 rounded-lg transition-colors font-medium"
            >
              {loading ? 'Clearing...' : 'Clear All Test Data'}
            </button>
          </div>

          {message && (
            <div className={`mt-4 p-4 rounded-lg ${
              message.includes('Error') 
                ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400' 
                : 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
            }`}>
              {message}
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Quick Navigation</h3>
            <div className="space-y-2">
              <a href="/apps" className="block text-indigo-600 dark:text-blue-400 hover:underline">
                → Tester Portal (View Apps)
              </a>
              <a href="/" className="block text-indigo-600 dark:text-blue-400 hover:underline">
                → Developer Portal
              </a>
              <a href="/dashboard" className="block text-indigo-600 dark:text-blue-400 hover:underline">
                → Developer Dashboard
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
