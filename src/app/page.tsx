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
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <header className="h-12 px-4 md:px-6 flex items-center justify-between border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-black dark:bg-white rounded flex items-center justify-center">
            <span className="text-white dark:text-black font-bold text-sm">T</span>
          </div>
          <span className="font-semibold text-black dark:text-white">Task Tracker</span>
          <span className="text-sm text-gray-500 dark:text-gray-400">{tasks.length}</span>
        </div>
        <div className="flex items-center gap-3">
          {urgentCount > 0 && (
            <span className="px-2 py-1 text-xs font-medium text-black bg-gray-100 dark:bg-gray-800 dark:text-white rounded">
              {urgentCount} urgent
            </span>
          )}
          {openCount > 0 && (
            <span className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-400 rounded">
              {openCount} open
            </span>
          )}
          <Link 
            href="/stats" 
            className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
          >
            Stats
          </Link>
        </div>
      </header>

      <TaskList tasks={tasks} />
    </div>
  );
}
