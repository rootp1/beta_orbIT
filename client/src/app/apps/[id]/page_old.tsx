'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/utils/supabaseClient'
import Link from 'next/link'

// TypeScript types
type AppDetails = { name: string; description: string; deployed_url: string; };
type Task = { id: string; position: number; description: string; verification_key: string; status?: 'not-done' | 'verified'; feedback?: string; };

// TaskItem Component
const TaskItem = ({ task, isLocked, onFeedbackSubmit }: { task: Task; isLocked: boolean; onFeedbackSubmit: (taskId: string, feedback: string) => void }) => {
  const [feedback, setFeedback] = useState(task.feedback || '');
  const statusColor = task.status === 'verified' ? 'bg-green-500' : isLocked ? 'bg-gray-300' : 'bg-red-500';
  const statusIcon = task.status === 'verified' ? '✓' : isLocked ? '🔒' : '○';
  
  return (
    <div className={`p-4 sm:p-5 border-2 rounded-xl transition-all duration-300 ${
      isLocked 
        ? 'bg-gray-50 opacity-60 border-gray-200' 
        : task.status === 'verified' 
          ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 shadow-md' 
          : 'bg-white border-gray-200 shadow-sm hover:shadow-md'
    }`}>
      <div className="flex items-start space-x-3 sm:space-x-4">
        <div className={`flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-bold ${statusColor}`}>
          {task.status === 'verified' ? '✓' : task.position}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`font-semibold text-sm sm:text-base leading-relaxed ${
            isLocked ? 'text-gray-500' : 'text-gray-800'
          }`}>
            {task.description}
          </p>
          {task.status === 'verified' && (
            <span className="inline-flex items-center px-2 py-1 mt-2 text-xs font-medium text-green-800 bg-green-100 rounded-full">
              Completed
            </span>
          )}
        </div>
      </div>
      {task.status === 'verified' && (
        <div className="mt-4 pl-0 sm:pl-10">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Feedback (Optional)
          </label>
          <textarea 
            value={feedback} 
            onChange={(e) => setFeedback(e.target.value)} 
            onBlur={() => onFeedbackSubmit(task.id, feedback)} 
            placeholder="Share your experience with this task..." 
            className="w-full text-sm p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none" 
            rows={3}
          />
        </div>
      )}
    </div>
  );
};

// Main Page Component
export default function TestAppPage() {
  const params = useParams();
  const router = useRouter();
  const appId = params.id as string;

  const [appDetails, setAppDetails] = useState<AppDetails | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isClaiming, setIsClaiming] = useState(false);
  
  // TODO: Replace with the actual wallet address from your global auth state
  const testerWalletAddress = '0xYourLoggedInWalletAddressHere';

  useEffect(() => {
    const fetchData = async () => {
      if (!appId) return;
      setIsLoading(true);
      try {
        const { data: appData, error: appError } = await supabase.from('apps').select('name, description, deployed_url').eq('id', appId).single();
        if (appError) throw appError;
        setAppDetails(appData);

        const { data: tasksData, error: tasksError } = await supabase.from('tasks').select('id, position, description, verification_key').eq('app_id', appId).order('position');
        if (tasksError) throw tasksError;
        
        const taskIds = tasksData.map(t => t.id);
        const { data: submissionsData, error: submissionsError } = await supabase.from('task_submissions').select('task_id, status, feedback').in('task_id', taskIds).eq('tester_id', testerWalletAddress);
        if (submissionsError) throw submissionsError;

        const mergedTasks = tasksData.map(task => {
          const submission = submissionsData.find(s => s.task_id === task.id);
          return { ...task, status: submission?.status === 'verified' ? 'verified' : 'not-done', feedback: submission?.feedback || '' };
        });
        setTasks(mergedTasks);
      } catch (error: any) { console.error("Error fetching data:", error); } 
      finally { setIsLoading(false); }
    };
    fetchData();
  }, [appId, testerWalletAddress]);

  useEffect(() => {
    const handleTaskVerification = async (event: MessageEvent) => {
      const receivedKey = event.data?.taskCompleted;
      if (!receivedKey) return;
      const currentTask = tasks.find(t => t.status === 'not-done');
      if (!currentTask || currentTask.verification_key !== receivedKey) return;
      const { error } = await supabase.from('task_submissions').upsert({ task_id: currentTask.id, tester_id: testerWalletAddress, status: 'verified' }, { onConflict: 'task_id, tester_id' });
      if (error) { console.error("Error updating task status:", error); return; }
      setTasks(currentTasks => currentTasks.map(t => t.id === currentTask.id ? { ...t, status: 'verified' } : t));
    };
    window.addEventListener('message', handleTaskVerification);
    return () => window.removeEventListener('message', handleTaskVerification);
  }, [tasks, testerWalletAddress]);

  const handleFeedbackSubmit = async (taskId: string, feedback: string) => {
    await supabase.from('task_submissions').update({ feedback }).eq('task_id', taskId).eq('tester_id', testerWalletAddress);
  };

  const handleClaimReward = async () => {
    setIsClaiming(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/claim-reward`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({ appId, testerAddress: testerWalletAddress }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to claim reward.');
      }
      
      alert(`Reward claimed successfully! Transaction hash: ${data.txHash}`);
      router.push('/apps');
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setIsClaiming(false);
    }
  };
  
  const allTasksVerified = tasks.length > 0 && tasks.every(t => t.status === 'verified');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading app details...</p>
        </div>
      </div>
    );
  }
  
  if (!appDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-6xl mb-4">😞</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">App Not Found</h2>
          <p className="text-gray-600 mb-4">The app you're looking for doesn't exist.</p>
          <Link href="/apps" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors">
            Back to Apps
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Mobile-First Responsive Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Back Button - Always visible */}
            <Link href="/apps" className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors font-medium">
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-sm sm:text-base">Back</span>
            </Link>
            
            {/* App Name - Center on mobile, left-aligned on desktop */}
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 truncate max-w-xs sm:max-w-none">
              {appDetails.name}
            </h1>
            
            {/* Claim Button - Responsive sizing */}
            <button 
              onClick={handleClaimReward} 
              disabled={!allTasksVerified || isClaiming}
              className={`
                px-3 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold text-sm sm:text-base transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none disabled:shadow-md
                ${allTasksVerified && !isClaiming 
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white' 
                  : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                }
              `}
            >
              {isClaiming ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="hidden sm:inline">Claiming...</span>
                </div>
              ) : (
                <span className="hidden sm:inline">Claim Reward</span>
              )}
              {/* Mobile icon */}
              {!isClaiming && (
                <span className="sm:hidden">🏆</span>
              )}
            </button>
          </div>
        </div>
      </header>
      {/* Mobile-First Responsive Main Content */}
      <div className="flex-1 flex flex-col lg:grid lg:grid-cols-3 gap-4 sm:gap-6 p-4 sm:p-6 lg:p-8">
        
        {/* Tasks Panel - Full width on mobile, sidebar on desktop */}
        <div className="lg:col-span-1 order-2 lg:order-1">
          <div className="bg-white/80 backdrop-blur-sm p-4 sm:p-6 rounded-2xl shadow-xl border border-gray-200 h-full">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800">Your Tasks</h2>
              <div className="text-sm text-gray-500">
                {tasks.filter(t => t.status === 'verified').length} / {tasks.length} completed
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mb-6">
              <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-green-500 h-2 sm:h-3 rounded-full transition-all duration-500"
                  style={{ width: `${tasks.length > 0 ? (tasks.filter(t => t.status === 'verified').length / tasks.length) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            {/* Tasks List */}
            <div className="space-y-3 sm:space-y-4 max-h-96 lg:max-h-full overflow-y-auto">
              {tasks.length > 0 ? (
                tasks.map((task, index) => (
                  <TaskItem 
                    key={task.id} 
                    task={task} 
                    isLocked={index > 0 && tasks[index - 1].status !== 'verified'} 
                    onFeedbackSubmit={handleFeedbackSubmit}
                  />
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">📋</div>
                  <p>No tasks available for this app.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* App Iframe - Full width on mobile, main content on desktop */}
        <div className="lg:col-span-2 order-1 lg:order-2 h-96 sm:h-[500px] lg:h-full min-h-[400px]">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 h-full overflow-hidden">
            {/* Iframe Header */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-800 text-sm sm:text-base">App Preview</h3>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                </div>
              </div>
            </div>
            
            {/* Iframe Content */}
            <div className="h-full pb-12 sm:pb-16">
              <iframe 
                src={appDetails.deployed_url} 
                className="w-full h-full border-0" 
                title="App Sandbox"
                allow="camera; microphone; geolocation"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Action Bar */}
      <div className="lg:hidden bg-white border-t border-gray-200 p-4 sticky bottom-0">
        <button 
          onClick={handleClaimReward} 
          disabled={!allTasksVerified || isClaiming}
          className={`
            w-full py-4 rounded-xl font-bold text-lg transition-all duration-200 shadow-lg
            ${allTasksVerified && !isClaiming 
              ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }
          `}
        >
          {isClaiming ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Claiming Reward...
            </div>
          ) : allTasksVerified ? (
            '🏆 Claim Your Reward'
          ) : (
            `Complete ${tasks.length - tasks.filter(t => t.status === 'verified').length} more task${tasks.length - tasks.filter(t => t.status === 'verified').length !== 1 ? 's' : ''}`
          )}
        </button>
      </div>
    </div>
  );
}