'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/utils/supabaseClient'
import { useAuth } from '@/context/AuthContext'
import ThemeToggle from '@/components/ThemeToggle'

// A TypeScript type for our app data
type App = {
  id: string;
  name: string;
  description?: string;
  status: 'DRAFT' | 'ACTIVE' | 'COMPLETED';
  max_testers: number;
  reward_per_tester: number;
  created_at: string;
};

export default function DashboardPage() {
  const [apps, setApps] = useState<App[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { walletAddress } = useAuth();
  const router = useRouter();

  // If user is not logged in, don't show the dashboard content
  if (!walletAddress) {
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
          .select('id, name, description, status, max_testers, reward_per_tester, created_at')
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
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">Developer Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2 text-lg">Manage your submitted applications and view their status.</p>
          </div>
          <div className="flex items-center space-x-4">
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
                      <span>Max Testers: {app.max_testers}</span>
                      <span>•</span>
                      <span>Reward: {app.reward_per_tester} WLD</span>
                      <span>•</span>
                      <span>Created: {new Date(app.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex space-x-2 w-full sm:w-auto">
                    {app.status === 'DRAFT' && (
                      <button className="w-full sm:w-auto text-sm bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg">
                        Fund
                      </button>
                    )}
                    <button className="w-full sm:w-auto text-sm bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg">
                      View Submissions
                    </button>
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