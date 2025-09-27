'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/utils/supabaseClient'
import { useAuth } from '@/context/AuthContext'
import ThemeToggle from '@/components/ThemeToggle'
import HumanBadge from '@/components/HumanBadge'

// A TypeScript type for our app data
type App = {
  id: string;
  name: string;
  description?: string;
  deployed_url?: string;
  logo_url?: string;
  status: 'DRAFT' | 'ACTIVE' | 'COMPLETED';
  max_testers?: number;
  reward_per_tester?: number;
  created_at: string;
};

export default function DashboardPage() {
  const [apps, setApps] = useState<App[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { walletAddress, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const router = useRouter();

  // Show loading while auth is initializing
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  const publishApp = async (appId: string) => {
    try {
      const { error } = await supabase
        .from('apps')
        .update({ status: 'ACTIVE' })
        .eq('id', appId);

      if (error) throw error;

      // Refresh the apps list
      const { data } = await supabase
        .from('apps')
        .select('id, name, description, deployed_url, logo_url, status, max_testers, reward_per_tester, created_at')
        .eq('owner_id', walletAddress)
        .order('created_at', { ascending: false });

      setApps(data || []);
      alert('App published successfully! It will now appear in the tester portal.');

    } catch (error: any) {
      console.error('Error publishing app:', error);
      alert(`Error: ${error.message}`);
    }
  };

  // If user is not authenticated, don't show the dashboard content
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 text-center max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Access Denied</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">You need to connect your wallet to access the developer dashboard.</p>
          <Link href="/">
            <button className="bg-indigo-600 hover:bg-indigo-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-all">
              Go Back to Home
            </button>
          </Link>
        </div>
      </div>
    );
  } 

  useEffect(() => {
    const fetchApps = async () => {
      setIsLoading(true);
      try {
        if (!walletAddress) {
          throw new Error("User is not logged in.");
        }

        // Fetch only the apps that belong to the current user
        const { data, error } = await supabase
          .from('apps')
          .select('id, name, description, deployed_url, logo_url, status, max_testers, reward_per_tester, created_at')
          .eq('owner_id', walletAddress) // The key filtering logic
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        setApps(data || []);

      } catch (error: any) {
        console.error("Error fetching apps:", error);
        alert(`Error: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchApps();
  }, [walletAddress]); // Re-fetch if the user changes

  const AppStatusBadge = ({ status }: { status: App['status'] }) => {
    const styles = {
      DRAFT: 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300',
      ACTIVE: 'bg-green-200 dark:bg-green-900 text-green-800 dark:text-green-300',
      COMPLETED: 'bg-blue-200 dark:bg-blue-900 text-blue-800 dark:text-blue-300',
    };
    return <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status]}`}>{status}</span>;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <div className="flex items-center space-x-4">
            <img 
              src="/logo.png" 
              alt="Orbital Logo" 
              className="w-16 h-16 rounded-xl"
            />
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">Developer Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2 text-lg">Manage your submitted applications and view their status.</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-right">
              <p className="text-gray-500 dark:text-gray-400">Connected as:</p>
              <p className="font-mono text-indigo-600 dark:text-blue-400">
                {walletAddress?.slice(0, 8)}...{walletAddress?.slice(-6)}
              </p>
            </div>
            <button
              onClick={logout}
              className="text-sm bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800 text-red-700 dark:text-red-300 px-4 py-2 rounded-lg transition-colors font-medium"
            >
              Disconnect
            </button>
            <HumanBadge />
            <ThemeToggle />
            <Link href="/dashboard/create">
              <button className="bg-indigo-600 hover:bg-indigo-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors">
                Submit New App
              </button>
            </Link>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
          {isLoading ? (
            <div className="text-center py-10">
              <p className="text-gray-600 dark:text-gray-300">Loading your apps...</p>
            </div>
          ) : apps.length === 0 ? (
            <div className="text-center py-10">
              <h3 className="text-xl font-medium text-gray-900 dark:text-white">No Apps Found</h3>
              <p className="text-gray-500 dark:text-gray-400 mt-2 mb-4">You haven't submitted any apps for testing yet.</p>
              <Link href="/dashboard/create">
                <button className="bg-indigo-600 hover:bg-indigo-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors">
                  Submit Your First App
                </button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {apps.map((app) => (
                <div key={app.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="mb-4 sm:mb-0 flex-1">
                    <p className="font-bold text-lg text-gray-900 dark:text-white">{app.name}</p>
                    {app.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 mb-2">{app.description.length > 100 ? app.description.substring(0, 100) + '...' : app.description}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 mt-1">
                      <AppStatusBadge status={app.status} />
                      <span>•</span>
                      <span>Max Testers: {app.max_testers || 'Not set'}</span>
                      <span>•</span>
                      <span>Reward: {app.reward_per_tester || 0} WLD</span>
                      <span>•</span>
                      <span>Created: {new Date(app.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex space-x-2 w-full sm:w-auto">
                    {app.status === 'DRAFT' && (
                      <button 
                        onClick={() => publishApp(app.id)}
                        className="w-full sm:w-auto text-sm bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                      >
                        Publish App
                      </button>
                    )}
                    {app.deployed_url && (
                      <a 
                        href={app.deployed_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-full sm:w-auto text-sm bg-indigo-600 hover:bg-indigo-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-center"
                      >
                        View App
                      </a>
                    )}
                    <Link href={`/apps/${app.id}`}>
                      <button className="w-full sm:w-auto text-sm bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                        View Details
                      </button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}