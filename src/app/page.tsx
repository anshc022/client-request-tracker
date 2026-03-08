import { getRequests, checkDbConnection } from './actions';
import Dashboard from '@/components/Dashboard';
import { StatusBadge } from '@/components/StatusBadge';

export default async function Home() {
  const requests = await getRequests();
  const isDbConnected = await checkDbConnection();

  return (
    <main className="min-h-screen bg-gray-50 text-gray-800 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="pb-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
             <div>
                <h1 className="text-3xl font-bold text-indigo-700 tracking-tight">Freelancer Pro Dashboard</h1>
                <p className="text-gray-500 mt-2 text-sm">Centralized dashboard for managing client feedback and tasks.</p>
             </div>
             <div className="hidden sm:block">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                  Beta v1.2
                </span>
             </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <Dashboard initialRequests={requests} />
        
        <StatusBadge isConnected={isDbConnected} />

      </div>
    </main>
  );
}
