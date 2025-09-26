'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/utils/supabaseClient'

type App = {
  id: string;
  name: string;
  description: string;
  reward_per_tester: number;
};

const AppCard = ({ app }: { app: App }) => (
  <div className="bg-white border border-gray-200 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col">
    <div className="p-6">
      <div className="flex items-center space-x-4 mb-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-xl">
          {app.name.charAt(0)}
        </div>
        <h3 className="font-bold text-xl text-gray-900">{app.name}</h3>
      </div>
      <p className="text-gray-600 text-sm mb-4 h-20 overflow-hidden">{app.description}</p>
    </div>
    <div className="border-t border-gray-200 mt-auto p-6 bg-gray-50 rounded-b-2xl flex justify-between items-center">
      <div>
        <p className="text-xs text-gray-500">Reward</p>
        <p className="font-bold text-green-600">{app.reward_per_tester} WLD</p>
      </div>
      <Link href={`/apps/${app.id}`}>
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-sm transition-all text-sm">
          Start Testing
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
          .select('id, name, description, reward_per_tester')
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🚀</span>
              <span className="font-bold text-xl text-gray-900">Orbital - User Mode</span>
            </div>
            <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors">
              ← Back to Home
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-4 sm:p-8">
        <div className="text-center mb-12">
          <div className="text-6xl mb-4">👤</div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900">Discover Apps to Test</h1>
          <p className="text-lg text-gray-600 mt-4 max-w-2xl mx-auto">
            Choose an app to test, complete the tasks, and earn WLD rewards for your feedback.
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-10">
            <p>Loading active apps...</p>
          </div>
        ) : apps.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-lg border">
            <h3 className="text-2xl font-medium text-gray-800">No Active Apps</h3>
            <p className="text-gray-500 mt-2">There are no apps available for testing right now. Please check back later!</p>
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