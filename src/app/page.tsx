import Link from 'next/link';
import { getRequests } from './actions';
import TaskList from '@/components/TaskList';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function HomePage() {
  const tasks = await getRequests();
  const openCount = tasks.filter(t => t.status !== 'Done').length;
  const urgentCount = tasks.filter(t => t.status === 'Urgent').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <header className="h-16 px-4 md:px-6 flex items-center justify-between border-b border-slate-200/70 dark:border-slate-700/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
            T
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg text-slate-800 dark:text-white">Task Tracker Pro</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">{tasks.length} total tasks</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {urgentCount > 0 && (
            <span className="px-3 py-1 text-xs font-semibold text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400 rounded-full animate-pulse">
              🚨 {urgentCount} urgent
            </span>
          )}
          {openCount > 0 && (
            <span className="px-3 py-1 text-xs font-medium text-amber-700 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400 rounded-full">
              ⏳ {openCount} open
            </span>
          )}
          <Link 
            href="/stats" 
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <span className="text-base">📊</span>
            Stats
          </Link>
        </div>
      </header>

      <TaskList tasks={tasks} />
    </div>
  );
}
