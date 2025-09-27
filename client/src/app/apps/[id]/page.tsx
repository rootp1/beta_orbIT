'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/utils/supabaseClient'
import ThemeToggle from '@/components/ThemeToggle'

type App = {
  id: string
  name: string
  description: string
  deployed_url: string
  max_testers: number
  status: string
  created_at: string
  owner_id: string
}

type Task = {
  id: string
  app_id: string
  title: string
  description: string
  per_task_reward: number
  verification_key: string
}

export default function AppDetailPage() {
  const { id } = useParams()
  const [app, setApp] = useState<App | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set())
  const [verificationKeys, setVerificationKeys] = useState<{[key: string]: string}>({})
  const [submitting, setSubmitting] = useState<string | null>(null)
  const [showIframe, setShowIframe] = useState(false)
  const [iframeUrl, setIframeUrl] = useState('')
  const [fullscreenIframe, setFullscreenIframe] = useState(false)
  const [iframeError, setIframeError] = useState(false)
  const [iframeLoading, setIframeLoading] = useState(true)

  useEffect(() => {
    if (id) {
      fetchAppAndTasks()
    }
  }, [id])

  const fetchAppAndTasks = async () => {
    setLoading(true)
    try {
      // Fetch app details
      const { data: appData, error: appError } = await supabase
        .from('apps')
        .select('*')
        .eq('id', id)
        .single()

      if (appError) throw appError
      setApp(appData)

      // Fetch tasks for this app
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .eq('app_id', id)
        .order('per_task_reward', { ascending: false })

      if (tasksError) throw tasksError
      setTasks(tasksData || [])

    } catch (error) {
      console.error('Error fetching data:', error)
      alert('Failed to load app details')
    } finally {
      setLoading(false)
    }
  }

  const handleTaskCompletion = async (taskId: string, expectedKey: string) => {
    const userKey = verificationKeys[taskId]
    
    if (!userKey) {
      alert('Please enter the verification key')
      return
    }

    if (userKey !== expectedKey) {
      alert('Incorrect verification key. Please complete the task and try again.')
      return
    }

    setSubmitting(taskId)
    
    // Simulate API call delay
    setTimeout(() => {
      setCompletedTasks(prev => new Set([...prev, taskId]))
      setSubmitting(null)
      alert('Task completed successfully! Reward earned.')
    }, 1000)
  }

  const totalReward = tasks.reduce((sum, task) => 
    completedTasks.has(task.id) ? sum + task.per_task_reward : sum, 0
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading app details...</p>
        </div>
      </div>
    )
  }

  if (!app) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">App Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">The app you're looking for doesn't exist.</p>
          <Link href="/apps" className="text-indigo-600 dark:text-blue-400 hover:underline mt-4 inline-block">
            ← Back to Apps
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-3">
              <img 
                src="/logo.png" 
                alt="Orbital Logo" 
                className="w-8 h-8 rounded-lg"
              />
              <span className="font-bold text-xl text-gray-900 dark:text-white">App Testing</span>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Link href="/apps" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors font-medium">
                ← Back to Apps
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto p-6">
        {/* App Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">{app.name}</h1>
              <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">{app.description}</p>
              <div className="flex items-center gap-4 mt-4 text-sm text-gray-500 dark:text-gray-400">
                <span>Max Testers: {app.max_testers}</span>
                <span>Status: {app.status}</span>
                <span>Created: {new Date(app.created_at).toLocaleDateString()}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500 dark:text-gray-400">Your Progress</p>
              <p className="text-2xl font-bold text-indigo-600 dark:text-blue-400">{totalReward} WLD</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{completedTasks.size}/{tasks.length} tasks</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={() => {
                setIframeUrl(app.deployed_url)
                setShowIframe(true)
                setIframeError(false)
                setIframeLoading(true)
              }}
              className="inline-flex items-center bg-indigo-600 hover:bg-indigo-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
            >
              Test App (Sandbox)
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            <a 
              href={app.deployed_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
            >
              Open in New Tab
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>

        {/* App Preview Section */}
        {showIframe && (
          <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-8 ${fullscreenIframe ? 'fixed inset-4 z-50 overflow-auto' : ''}`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">App Preview (Sandboxed)</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setFullscreenIframe(!fullscreenIframe)}
                  className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  {fullscreenIframe ? 'Exit Fullscreen' : 'Fullscreen'}
                </button>
                <button
                  onClick={() => {
                    setShowIframe(false)
                    setFullscreenIframe(false)
                  }}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Close Preview
                </button>
              </div>
            </div>
            <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4">
              <div className="bg-white dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-600 overflow-hidden">
                <div className="bg-gray-50 dark:bg-gray-700 px-4 py-2 border-b border-gray-200 dark:border-gray-600 flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  </div>
                  <div className="flex-1 bg-white dark:bg-gray-600 rounded px-3 py-1 text-sm text-gray-600 dark:text-gray-300 font-mono">
                    {iframeUrl}
                  </div>
                </div>
                <div className="relative">
                  {iframeLoading && (
                    <div className={`absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-700 ${fullscreenIframe ? 'h-[calc(100vh-12rem)]' : 'h-96 md:h-[32rem] lg:h-[40rem]'}`}>
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Loading app...</p>
                      </div>
                    </div>
                  )}
                  
                  {iframeError ? (
                    <div className={`flex flex-col items-center justify-center bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg ${fullscreenIframe ? 'h-[calc(100vh-12rem)]' : 'h-96 md:h-[32rem] lg:h-[40rem]'}`}>
                      <div className="text-center p-8">
                        <svg className="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <h3 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-2">Unable to Load in Sandbox</h3>
                        <p className="text-sm text-red-700 dark:text-red-400 mb-4">
                          This website blocks iframe embedding for security reasons.
                        </p>
                        <div className="space-y-2">
                          <a 
                            href={iframeUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                          >
                            Open in New Tab
                            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                          <button
                            onClick={() => {
                              setIframeError(false)
                              setIframeLoading(true)
                              // Force reload iframe
                              const iframe = document.querySelector('iframe[title*="App Preview"]') as HTMLIFrameElement
                              if (iframe) {
                                iframe.src = iframe.src
                              }
                            }}
                            className="ml-2 inline-flex items-center bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                          >
                            Try Again
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <iframe
                      src={iframeUrl}
                      className={`w-full border-0 bg-white ${fullscreenIframe ? 'h-[calc(100vh-12rem)]' : 'h-96 md:h-[32rem] lg:h-[40rem]'}`}
                      sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-presentation allow-downloads"
                      loading="lazy"
                      title={`${app.name} - App Preview`}
                      onLoad={() => {
                        setIframeLoading(false)
                        // Check if iframe actually loaded content
                        setTimeout(() => {
                          try {
                            const iframe = document.querySelector('iframe[title*="App Preview"]') as HTMLIFrameElement
                            if (iframe && iframe.contentWindow) {
                              // Try to access iframe content to detect blocking
                              iframe.contentWindow.location.href
                            }
                          } catch (e) {
                            // If we can't access, it might be blocked
                            console.log('Iframe access blocked, but content may have loaded')
                          }
                        }, 2000)
                      }}
                      onError={() => {
                        setIframeLoading(false)
                        setIframeError(true)
                      }}
                    />
                  )}
                  
                  {!iframeError && !iframeLoading && (
                    <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                      Sandboxed
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-300">Sandbox Information</p>
                  <div className="text-sm text-blue-700 dark:text-blue-400 mt-1 space-y-1">
                    <p>• Apps run in a secure sandbox for your protection</p>
                    <p>• Some sites (YouTube, Google, etc.) may block iframe embedding</p>
                    <p>• If blocked, use "Open in New Tab" for full functionality</p>
                    <p>• Your data remains secure while testing</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tasks Section */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Testing Tasks</h2>
          
          {tasks.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
              <p className="text-gray-500 dark:text-gray-400">No tasks available for this app.</p>
            </div>
          ) : (
            tasks.map((task, index) => (
              <div key={task.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="bg-indigo-100 dark:bg-blue-900 text-indigo-600 dark:text-blue-400 px-3 py-1 rounded-full text-sm font-medium">
                        Task {index + 1}
                      </span>
                      <span className="bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 px-3 py-1 rounded-full text-sm font-semibold">
                        {task.per_task_reward} WLD
                      </span>
                      {completedTasks.has(task.id) && (
                        <span className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full text-sm font-medium">
                          ✓ Completed
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{task.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{task.description}</p>
                  </div>
                </div>

                {!completedTasks.has(task.id) && (
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Complete this task to earn {task.per_task_reward} WLD</p>
                      {!showIframe && (
                        <button
                          onClick={() => {
                            setIframeUrl(app.deployed_url)
                            setShowIframe(true)
                            setIframeError(false)
                            setIframeLoading(true)
                          }}
                          className="text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-lg transition-colors"
                        >
                          🔍 Test App
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        placeholder="Enter verification key..."
                        value={verificationKeys[task.id] || ''}
                        onChange={(e) => setVerificationKeys(prev => ({
                          ...prev,
                          [task.id]: e.target.value
                        }))}
                        className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        onClick={() => handleTaskCompletion(task.id, task.verification_key)}
                        disabled={submitting === task.id}
                        className="bg-indigo-600 hover:bg-indigo-700 dark:bg-blue-600 dark:hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors min-w-[120px]"
                      >
                        {submitting === task.id ? 'Verifying...' : 'Complete Task'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
