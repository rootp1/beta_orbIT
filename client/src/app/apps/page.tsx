'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/utils/supabaseClient'
import ThemeToggle from '@/components/ThemeToggle'

type App = {
  id: string;
  name: string;
  description: string;
  deployed_url: string;
  reward_per_tester: number;
  max_testers: number;
  status: string;
  created_at: string;
};

const AppCard = ({ app }: { app: App }) => (
  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col group">
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-full bg-indigo-100 dark:bg-blue-900 flex items-center justify-center">
            <span className="text-indigo-600 dark:text-blue-400 font-bold text-xl">{app.name.charAt(0)}</span>
          </div>
          <div>
            <h3 className="font-bold text-xl text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-blue-400 transition-colors">{app.name}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {new Date(app.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
        <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 px-3 py-1 rounded-full text-xs font-medium">
          {app.status}
        </span>
      </div>
      
      <p className="text-gray-600 dark:text-gray-300 text-sm mb-6 h-20 overflow-hidden leading-relaxed">{app.description}</p>
      
      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
        <span>Max Testers: {app.max_testers}</span>
        <span>Visit App ↗</span>
      </div>
    </div>
    
    <div className="border-t border-gray-200 dark:border-gray-700 mt-auto p-8 bg-gray-50 dark:bg-gray-900 rounded-b-2xl flex justify-between items-center">
      <div>
        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">Total Reward</p>
        <p className="font-bold text-indigo-600 dark:text-blue-400 text-lg">{app.reward_per_tester} WLD</p>
      </div>
      <Link href={`/apps/${app.id}`}>
        <button className="bg-indigo-600 hover:bg-indigo-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors text-sm">
          View Tasks
        </button>
      </Link>
    </div>
  </div>
);

export default function AppDiscoveryPage() {
  const [apps, setApps] = useState<App[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchActiveApps = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('apps')
          .select('id, name, description, deployed_url, reward_per_tester, max_testers, status, created_at')
          .eq('status', 'ACTIVE')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setApps(data || []);
      } catch (error: any) {
        alert(`Error: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActiveApps();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-indigo-600 dark:bg-blue-600 rounded-lg"></div>
              <span className="font-bold text-xl text-gray-900 dark:text-white">Orbital Tester Portal</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/apps/admin" className="text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors text-sm font-medium">
                Admin Panel
              </Link>
              <ThemeToggle />
              <Link href="/" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors font-medium">
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-4 sm:p-8">
        <div className="text-center mb-16">
          <div className="w-20 h-20 bg-indigo-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-8">
            <svg className="w-10 h-10 text-indigo-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-8 tracking-tight">Discover Apps to Test</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mt-4 max-w-3xl mx-auto leading-relaxed">
            Choose an application to test, complete the verification tasks, and earn WLD rewards for your valuable feedback.
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-10">
            <p>Loading active apps...</p>
          </div>
        ) : apps.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-medium text-gray-900 dark:text-white mb-2">No Active Apps</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">There are no apps available for testing right now. Please check back later!</p>
            <Link href="/">
              <button className="bg-indigo-600 hover:bg-indigo-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors">
                Go to Developer Portal
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {apps.map((app) => (
              <AppCard key={app.id} app={app} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}