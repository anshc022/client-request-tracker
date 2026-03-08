import { getRequests, checkDbConnection } from './actions';
import StatusControl from '@/components/StatusControl';
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
                <h1 className="text-3xl font-bold text-indigo-700 tracking-tight">Client Request Tracker</h1>
                <p className="text-gray-500 mt-2 text-sm">Centralized dashboard for managing client feedback and tasks.</p>
             </div>
             <div className="hidden sm:block">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                  Beta v1.1
                </span>
             </div>
          </div>
        </header>

        {/* Requests Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {requests.length > 0 ? (
            requests.map((req: any) => (
              <div key={req.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs text-gray-400 font-mono">#{req.id}</span>
                    <span className={`px-2 py-0.5 rounded-sm text-xs font-medium border
                      ${req.category === 'Bug' ? 'text-red-700 bg-red-50 border-red-100' : 
                        req.category === 'Feature' ? 'text-purple-700 bg-purple-50 border-purple-100' : 
                        'text-blue-700 bg-blue-50 border-blue-100'}`}>
                      {req.category}
                    </span>
                  </div>
                  <p className="text-gray-900 font-medium text-sm leading-relaxed">{req.content}</p>
                </div>
                
                <div className="border-t border-gray-100 pt-4 flex flex-col space-y-3">
                  <div className="flex justify-between items-center">
                    <time dateTime={req.created_at} className="text-xs text-gray-500">
                      {new Date(req.created_at).toLocaleDateString()}
                    </time>
                  </div>
                  <div className="flex items-center justify-between">
                     <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</span>
                     <StatusControl id={req.id} currentStatus={req.status || 'Pending'} />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-12 text-center text-sm text-gray-500 bg-white rounded-lg border border-gray-200 border-dashed">
              <div className="flex flex-col items-center justify-center space-y-2">
                <svg className="h-10 w-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                <p className="text-gray-900 font-medium">No requests found</p>
                <p className="text-gray-500">Tasks are added via the backend system.</p>
              </div>
            </div>
          )}
        </div>
        
        <StatusBadge isConnected={isDbConnected} />

      </div>
    </main>
  );
}
