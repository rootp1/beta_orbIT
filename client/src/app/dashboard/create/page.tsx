'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/utils/supabaseClient'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import ThemeToggle from '@/components/ThemeToggle'

type Task = {
  description: string;
  verification_key: string;
  per_task_reward: number;
};

export default function CreateAppPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { walletAddress } = useAuth();

  const [appName, setAppName] = useState('');
  const [appDescription, setAppDescription] = useState('');
  const [appUrl, setAppUrl] = useState('');
  const [maxTesters, setMaxTesters] = useState(5);
  const [tasks, setTasks] = useState<Task[]>([{ description: '', verification_key: '', per_task_reward: 0 }]);

  // Calculate total reward per tester by summing all task rewards
  const calculateTotalReward = () => {
    return tasks.reduce((total, task) => total + (task.per_task_reward || 0), 0);
  };

  // If user is not logged in, don't show the create app form
  if (!walletAddress) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-700 text-center max-w-md">
          <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-gray-300 mb-6">You need to connect your wallet to submit an app for testing.</p>
          <Link href="/">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-all">
              Go Back to Home
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const handleTaskChange = (index: number, field: keyof Task, value: string | number) => {
    const updatedTasks = [...tasks];
    (updatedTasks[index] as any)[field] = value;
    setTasks(updatedTasks);
  };

  const handleAddTask = () => {
    setTasks([...tasks, { description: '', verification_key: '', per_task_reward: 0 }]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!walletAddress) {
      alert("Please connect your wallet before submitting an app.");
      setIsLoading(false);
      return;
    }

    try {
      const totalReward = calculateTotalReward();
      
      const { data: appData, error: appError } = await supabase
        .from('apps')
        .insert({
          name: appName,
          description: appDescription,
          deployed_url: appUrl,
          max_testers: maxTesters,
          reward_per_tester: totalReward,
          owner_id: walletAddress,
          status: 'DRAFT'
        })
        .select()
        .single();

      if (appError) throw appError;

      const tasksToInsert = tasks.map((task, index) => ({
        app_id: appData.id,
        position: index + 1,
        description: task.description,
        verification_key: task.verification_key,
        per_task_reward: task.per_task_reward,
      }));

      const { error: tasksError } = await supabase.from('tasks').insert(tasksToInsert);
      if (tasksError) throw tasksError;

      alert('App submitted successfully as a draft!');
      router.push('/dashboard');
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <nav className="mb-8 flex justify-between items-center">
            <Link href="/" className="text-indigo-600 dark:text-blue-400 hover:underline">
                &larr; Back to Home
            </Link>
            <ThemeToggle />
        </nav>
        <div className="bg-white dark:bg-gray-800 p-8 sm:p-12 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-4 mb-8">
                <img 
                    src="/logo.png" 
                    alt="Orbital Logo" 
                    className="w-16 h-16 rounded-xl"
                />
                <div>
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">Submit Your Application</h1>
                    <p className="text-gray-600 dark:text-gray-300 text-lg">List your application on the platform for community testing and feedback.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* App Details Section */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-white border-b border-gray-600 pb-2">1. App Details</h2>
                    
                    {/* App Name */}
                    <div>
                        <label htmlFor="appName" className="block text-sm font-medium text-gray-300 mb-1">
                            App Name *
                        </label>
                        <input
                            type="text"
                            id="appName"
                            required
                            value={appName}
                            onChange={(e) => setAppName(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter your app name"
                        />
                    </div>

                    {/* App Description */}
                    <div>
                        <label htmlFor="appDescription" className="block text-sm font-medium text-gray-300 mb-1">
                            App Description *
                        </label>
                        <textarea
                            id="appDescription"
                            required
                            rows={3}
                            value={appDescription}
                            onChange={(e) => setAppDescription(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Describe what your app does and what testers should focus on"
                        />
                    </div>

                    {/* Deployed URL */}
                    <div>
                        <label htmlFor="appUrl" className="block text-sm font-medium text-gray-300 mb-1">
                            Deployed URL *
                        </label>
                        <input
                            type="url"
                            id="appUrl"
                            required
                            value={appUrl}
                            onChange={(e) => setAppUrl(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="https://your-app.com"
                        />
                    </div>

                    {/* Max Testers */}
                    <div>
                        <div>
                            <label htmlFor="maxTesters" className="block text-sm font-medium text-gray-300 mb-1">
                                Maximum Number of Testers
                            </label>
                            <input
                                type="number"
                                id="maxTesters"
                                min={1}
                                max={100}
                                value={maxTesters}
                                onChange={(e) => setMaxTesters(parseInt(e.target.value))}
                                className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                Total Reward per Tester
                            </label>
                            <div className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-gray-300">
                                {calculateTotalReward()} WLD (calculated from task rewards below)
                            </div>
                        </div>
                    </div>
                </div>

                {/* Testing Tasks Section */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-white border-b border-gray-600 pb-2">2. Testing Tasks</h2>
                    {tasks.map((task, index) => (
                        <div key={index} className="space-y-4 p-4 bg-gray-700 rounded-lg border border-gray-600">
                            <div className="flex justify-between items-center">
                                <h3 className="font-medium text-white">Task {index + 1}</h3>
                                {tasks.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => setTasks(tasks.filter((_, i) => i !== index))}
                                        className="text-red-400 hover:text-red-300 text-sm"
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>
                            
                            {/* Task Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    Task Description *
                                </label>
                                <textarea
                                    required
                                    rows={2}
                                    value={task.description}
                                    onChange={(e) => handleTaskChange(index, 'description', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-600 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="What should the tester do for this task?"
                                />
                            </div>

                            {/* Verification Key */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    Verification Key *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={task.verification_key}
                                    onChange={(e) => handleTaskChange(index, 'verification_key', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-600 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Secret key or code that proves task completion"
                                />
                            </div>

                            {/* Per Task Reward */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    Reward for this Task (WLD) *
                                </label>
                                <input
                                    type="number"
                                    required
                                    step="0.01"
                                    min={0}
                                    value={task.per_task_reward}
                                    onChange={(e) => handleTaskChange(index, 'per_task_reward', parseFloat(e.target.value) || 0)}
                                    className="w-full px-3 py-2 border border-gray-600 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>
                    ))}
                    <button type="button" onClick={handleAddTask} className="w-full text-sm font-medium text-blue-400 border-2 border-dashed border-gray-600 rounded-lg py-2 hover:bg-gray-700">
                        + Add Another Task
                    </button>
                </div>

                {/* Summary */}
                <div className="bg-gray-700 p-6 rounded-lg border border-gray-600">
                    <h3 className="font-medium text-white mb-4">Campaign Summary</h3>
                    <div className="space-y-2 text-sm">
                        <p className="text-gray-300">App: <span className="text-white font-medium">{appName || 'Not specified'}</span></p>
                        <p className="text-gray-300">Total Tasks: <span className="text-white font-medium">{tasks.length}</span></p>
                        <p className="text-gray-300">Max Testers: <span className="text-white font-medium">{maxTesters}</span></p>
                        <p className="text-gray-300">Reward per Tester: <span className="text-white font-medium">{calculateTotalReward()} WLD</span></p>
                        <p className="text-gray-300">Total Campaign Budget: <span className="text-white font-medium">{calculateTotalReward() * maxTesters} WLD</span></p>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="flex space-x-4">
                    <Link href="/dashboard">
                        <button type="button" className="flex-1 bg-gray-600 hover:bg-gray-500 text-white font-semibold py-3 px-6 rounded-lg transition-colors">
                            Cancel
                        </button>
                    </Link>
                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                    >
                        {isLoading ? 'Submitting...' : 'Submit App for Testing'}
                    </button>
                </div>
            </form>
        </div>
      </div>
    </div>
  );
}
