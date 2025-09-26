'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/utils/supabaseClient'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext' // 👈 1. Import useAuth

type Task = {
  description: string;
  verification_key: string;
  per_task_reward: number;
};

export default function CreateAppPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { walletAddress } = useAuth(); // 👈 2. Get the live wallet address from global state

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200 text-center max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">You need to connect your wallet to submit an app for testing.</p>
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

    // 👇 3. Check if the user is logged in before submitting
    if (!walletAddress) {
      alert("Please connect your wallet before submitting an app.");
      setIsLoading(false);
      return;
    }

    try {
      // This is now redundant if your SIWE logic already does this, but it's safe to keep.
      await supabase.from('users').upsert({ id: walletAddress });

      const { data: appData, error: appError } = await supabase
        .from('apps')
        .insert({
          name: appName,
          description: appDescription,
          deployed_url: appUrl,
          max_testers: maxTesters,
          reward_per_tester: calculateTotalReward(),
          owner_id: walletAddress, // 👈 4. Use the real wallet address
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
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <nav className="mb-8">
            <Link href="/" className="text-blue-600 hover:underline">
                &larr; Back to Home
            </Link>
        </nav>
        <div className="bg-white p-6 sm:p-10 rounded-2xl shadow-lg border border-gray-200">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Submit Your App</h1>
            <p className="text-gray-600 mb-8">List your app on the Proving Ground for community testing.</p>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* App Details Section */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">1. App Details</h2>
                    
                    {/* App Name */}
                    <div>
                        <label htmlFor="appName" className="block text-sm font-medium text-gray-700 mb-1">
                            App Name *
                        </label>
                        <input
                            type="text"
                            id="appName"
                            required
                            value={appName}
                            onChange={(e) => setAppName(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter your app name"
                        />
                    </div>

                    {/* App Description */}
                    <div>
                        <label htmlFor="appDescription" className="block text-sm font-medium text-gray-700 mb-1">
                            App Description *
                        </label>
                        <textarea
                            id="appDescription"
                            required
                            rows={3}
                            value={appDescription}
                            onChange={(e) => setAppDescription(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Describe what your app does and what testers should focus on"
                        />
                    </div>

                    {/* Deployed URL */}
                    <div>
                        <label htmlFor="appUrl" className="block text-sm font-medium text-gray-700 mb-1">
                            Deployed URL *
                        </label>
                        <input
                            type="url"
                            id="appUrl"
                            required
                            value={appUrl}
                            onChange={(e) => setAppUrl(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="https://your-app.com"
                        />
                    </div>

                    {/* Max Testers and Calculated Total Reward */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="maxTesters" className="block text-sm font-medium text-gray-700 mb-1">
                                Max Testers *
                            </label>
                            <input
                                type="number"
                                id="maxTesters"
                                min="1"
                                max="100"
                                required
                                value={maxTesters}
                                onChange={(e) => setMaxTesters(parseInt(e.target.value) || 1)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <p className="text-xs text-gray-500 mt-1">Maximum number of testers (1-100)</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Total Reward per Tester (WLD)
                            </label>
                            <div className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-700">
                                {calculateTotalReward().toFixed(4)} WLD
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Automatically calculated from task rewards</p>
                        </div>
                    </div>
                </div>

                {/* Tasks Section */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">2. Testing Tasks</h2>
                    {tasks.map((task, index) => (
                        <div key={index} className="p-4 border border-gray-200 rounded-lg space-y-3 bg-gray-50">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="font-medium text-gray-700">Task {index + 1}</h3>
                                {tasks.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const updatedTasks = tasks.filter((_, i) => i !== index);
                                            setTasks(updatedTasks);
                                        }}
                                        className="text-red-600 hover:text-red-800 text-sm"
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>
                            
                            {/* Task Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Task Description *
                                </label>
                                <textarea
                                    required
                                    rows={2}
                                    value={task.description}
                                    onChange={(e) => handleTaskChange(index, 'description', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Describe what the tester should do for this task"
                                />
                            </div>

                            {/* Verification Key */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Verification Key *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={task.verification_key}
                                    onChange={(e) => handleTaskChange(index, 'verification_key', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter the verification key/code testers should find"
                                />
                                <p className="text-xs text-gray-500 mt-1">This is what testers need to submit to prove task completion</p>
                            </div>

                            {/* Per Task Reward */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Task Reward (WLD) *
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    required
                                    value={task.per_task_reward}
                                    onChange={(e) => handleTaskChange(index, 'per_task_reward', parseFloat(e.target.value) || 0)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <p className="text-xs text-gray-500 mt-1">WLD tokens earned for completing this specific task</p>
                            </div>
                        </div>
                    ))}
                    <button type="button" onClick={handleAddTask} className="w-full text-sm font-medium text-blue-600 border-2 border-dashed border-gray-300 rounded-lg py-2 hover:bg-blue-50">
                        + Add Another Task
                    </button>
                </div>

                {/* Campaign Summary */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-blue-900 mb-3">Campaign Summary</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                        <div>
                            <p className="text-blue-700 font-medium">Tasks</p>
                            <p className="text-blue-900 font-bold">{tasks.length}</p>
                        </div>
                        <div>
                            <p className="text-blue-700 font-medium">Reward per Tester</p>
                            <p className="text-blue-900 font-bold">{calculateTotalReward().toFixed(4)} WLD</p>
                        </div>
                        <div>
                            <p className="text-blue-700 font-medium">Total Campaign Cost</p>
                            <p className="text-blue-900 font-bold">{(calculateTotalReward() * maxTesters).toFixed(4)} WLD</p>
                        </div>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="pt-5">
                    <button
                      type="submit"
                      disabled={isLoading || !walletAddress} // 👈 5. Disable button if not logged in
                      className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
                    >
                      {isLoading ? 'Submitting...' : 'Submit App'}
                    </button>
                    {!walletAddress && (
                      <p className="text-center text-red-600 text-sm mt-2">Please connect your wallet to submit an app.</p>
                    )}
                </div>
            </form>
        </div>
      </div>
    </div>
  );
}